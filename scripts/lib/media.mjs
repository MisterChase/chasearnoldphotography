/* ============================================================================
   MEDIA PIPELINE
   Reads oversized originals from source-media/ and emits web-sized derivatives
   into dist/media/. Originals are never copied or deployed.

   Every result is cached in .media-cache/manifest.json keyed by the source
   file's size + mtime, so rebuilds only touch files you actually changed.
   ========================================================================== */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif', '.avif']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv']);

/* --- filename conventions -------------------------------------------------
   "04-portrait@full.jpg" -> { base: '04-portrait', tags: ['full'] }
   Tags control layout; see the header of content/projects.js.             */
export function parseName(filename) {
  const ext = path.extname(filename).toLowerCase();
  const stem = path.basename(filename, path.extname(filename));
  const parts = stem.split('@');
  const base = parts[0];
  const tags = parts.slice(1).map((t) => t.toLowerCase().trim()).filter(Boolean);
  return { base, tags, ext, stem };
}

/* Turn "03-detail-shot" into "Detail shot" for alt text. */
export function humanize(base) {
  return base
    .replace(/^\d+[-_\s]*/, '')      // drop ordering prefix
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase()) || 'Untitled';
}

const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/* --- discovery ----------------------------------------------------------- */
export async function discoverProjectMedia(sourceDir, slug) {
  const dir = path.join(sourceDir, slug);
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .filter((n) => {
      const ext = path.extname(n).toLowerCase();
      return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext);
    })
    .sort(naturalSort);

  return files.map((name) => {
    const meta = parseName(name);
    return {
      file: name,
      abs: path.join(dir, name),
      kind: VIDEO_EXT.has(meta.ext) ? 'video' : 'image',
      ...meta,
    };
  });
}

/* Cached results carry fully-formed URLs. If basePath changes (moving between
   a subfolder and a root domain) those URLs are stale, so point every one of
   them at the current location rather than reprocessing the images. */
function rehome(result, publicBase) {
  const fix = (url) => (url ? `${publicBase}/${url.split('/').pop()}` : url);
  if (result.sources) for (const src of result.sources) for (const f of src.files) f.url = fix(f.url);
  result.src = fix(result.src);
  result.full = fix(result.full);
  if (result.fullAvif) result.fullAvif = fix(result.fullAvif);
  if (result.poster) result.poster = fix(result.poster);
  return result;
}

/* --- cache --------------------------------------------------------------- */
export class MediaCache {
  constructor(cacheDir) {
    this.file = path.join(cacheDir, 'manifest.json');
    this.dir = cacheDir;
    this.data = {};
    this.hits = 0;
    this.misses = 0;
  }
  async load() {
    try { this.data = JSON.parse(await fs.readFile(this.file, 'utf8')); }
    catch { this.data = {}; }
  }
  async save() {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(this.data, null, 1));
  }
  async keyFor(abs, opts) {
    const st = await fs.stat(abs);
    return `${abs}|${st.size}|${Math.round(st.mtimeMs)}|${JSON.stringify(opts)}`;
  }
  get(key) { return this.data[key]; }
  set(key, value) { this.data[key] = value; }
}

/* --- images -------------------------------------------------------------- */
/* Emits one file per (width x format) that is actually smaller than the
   source, plus a JPEG fallback ladder and an inline blur placeholder. */
export async function processImage(item, { outDir, publicBase, cfg, cache }) {
  const opts = { w: cfg.widths, f: cfg.formats, q: cfg.quality, jm: cfg.jpegFallbackMaxWidth, v: 4 };
  const key = await cache.keyFor(item.abs, opts);
  const cached = cache.get(key);
  if (cached && cached.sources.every((s) => s.files.every((f) => existsSync(path.join(outDir, path.basename(f.url)))))) {
    cache.hits++;
    return rehome(cached, publicBase);
  }
  cache.misses++;

  await fs.mkdir(outDir, { recursive: true });

  let image = sharp(item.abs, { failOn: 'none', limitInputPixels: false });
  let meta;
  try {
    meta = await image.metadata();
  } catch (err) {
    throw new Error(`Could not read image ${item.file}: ${err.message}`);
  }
  // Honour EXIF orientation, then work from the upright pixels.
  image = image.rotate();
  const rotated = (meta.orientation ?? 1) >= 5;
  const srcW = rotated ? meta.height : meta.width;
  const srcH = rotated ? meta.width : meta.height;
  if (!srcW || !srcH) throw new Error(`No dimensions for ${item.file}`);

  const widths = [...new Set(cfg.widths.filter((w) => w < srcW).concat(Math.min(srcW, cfg.lightboxWidth)))]
    .sort((a, b) => a - b);

  const formats = [...cfg.formats, 'jpeg'];
  const sources = [];
  const byFormat = {};

  for (const fmt of formats) {
    const files = [];
    // JPEG exists only for browsers too old for WebP (~2% and falling). They
    // get a capped ladder rather than full-size copies — this alone keeps
    // roughly a third of the deploy off the wire.
    const ladder = fmt === 'jpeg'
      ? widths.filter((w) => w <= cfg.jpegFallbackMaxWidth).slice(-2)
      : widths;
    for (const w of (ladder.length ? ladder : [widths[0]])) {
      const ext = fmt === 'jpeg' ? 'jpg' : fmt;
      const outName = `${item.base}-${w}.${ext}`;
      const outPath = path.join(outDir, outName);
      let pipeline = image.clone().resize({ width: w, withoutEnlargement: true });
      if (fmt === 'avif') pipeline = pipeline.avif({ quality: cfg.quality.avif, effort: 4 });
      else if (fmt === 'webp') pipeline = pipeline.webp({ quality: cfg.quality.webp });
      else pipeline = pipeline.jpeg({ quality: cfg.quality.jpeg, mozjpeg: true, progressive: true });
      const info = await pipeline.toFile(outPath);
      files.push({ url: `${publicBase}/${outName}`, w: info.width, bytes: info.size });
    }
    const type = fmt === 'jpeg' ? 'image/jpeg' : `image/${fmt}`;
    sources.push({ type, files });
    byFormat[fmt] = files;
  }

  // Tiny blurred stand-in, inlined as a data URI so it paints instantly.
  const lqipBuf = await image.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const lqip = `data:image/webp;base64,${lqipBuf.toString('base64')}`;

  const jpegLadder = byFormat.jpeg;
  const result = {
    kind: 'image',
    file: item.file,
    base: item.base,
    tags: item.tags,
    width: srcW,
    height: srcH,
    aspect: +(srcW / srcH).toFixed(4),
    orientation: srcW / srcH > 1.15 ? 'landscape' : srcW / srcH < 0.87 ? 'portrait' : 'square',
    lqip,
    sources,
    src: jpegLadder.at(-1).url,                          // fallback <img src>
    full: (byFormat.webp ?? jpegLadder).at(-1).url,      // lightbox, universal
    fullAvif: byFormat.avif ? byFormat.avif.at(-1).url : null,  // lightbox, preferred
    // What a typical laptop actually pulls down for this image in the grid.
    typical: (byFormat.avif ?? byFormat.webp ?? jpegLadder)
      .reduce((best, f) => (Math.abs(f.w - 1200) < Math.abs(best.w - 1200) ? f : best)).bytes,
    bytes: sources.flatMap((s) => s.files).reduce((n, f) => n + f.bytes, 0),
    srcBytes: (await fs.stat(item.abs)).size,
  };

  cache.set(key, result);
  return result;
}

/* --- video --------------------------------------------------------------- */
/* h264/mp4 with faststart plays everywhere, including iOS inline autoplay.
   A poster frame is pulled at 1s so nothing shows a black box while loading. */
export async function processVideo(item, { outDir, publicBase, cfg, cache }) {
  const opts = { h: cfg.videoMaxHeight, v: 2 };
  const key = await cache.keyFor(item.abs, opts);
  const cached = cache.get(key);
  if (cached && existsSync(path.join(outDir, path.basename(cached.src)))) {
    cache.hits++;
    return rehome(cached, publicBase);
  }
  cache.misses++;

  await fs.mkdir(outDir, { recursive: true });
  const outName = `${item.base}.mp4`;
  const outPath = path.join(outDir, outName);
  const posterName = `${item.base}-poster.jpg`;
  const posterPath = path.join(outDir, posterName);
  const isLoop = item.tags.includes('loop');

  // Probe first so we can keep the real aspect ratio in the layout.
  let width = 1920, height = 1080, duration = 0;
  try {
    const { stdout } = await run('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height:format=duration',
      '-of', 'json', item.abs,
    ]);
    const probe = JSON.parse(stdout);
    width = probe.streams?.[0]?.width ?? width;
    height = probe.streams?.[0]?.height ?? height;
    duration = parseFloat(probe.format?.duration ?? 0);
  } catch { /* ffprobe missing — fall back to 16:9 */ }

  const args = [
    '-y', '-i', item.abs,
    '-vf', `scale='min(iw,trunc(oh*a/2)*2)':'min(${cfg.videoMaxHeight},trunc(ih/2)*2)'`,
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-crf', isLoop ? '26' : '22', '-preset', 'medium',
    '-movflags', '+faststart',
  ];
  // Hover loops are silent by design — dropping audio saves a lot of bytes.
  if (isLoop) args.push('-an');
  else args.push('-c:a', 'aac', '-b:a', '128k');
  args.push(outPath);

  await run('ffmpeg', args, { maxBuffer: 1024 * 1024 * 64 });
  await run('ffmpeg', [
    '-y', '-ss', duration > 2 ? '1' : '0', '-i', item.abs,
    '-frames:v', '1', '-vf', `scale=1600:-2`, '-q:v', '4', posterPath,
  ], { maxBuffer: 1024 * 1024 * 32 });

  const stat = await fs.stat(outPath);
  const result = {
    kind: 'video',
    file: item.file,
    base: item.base,
    tags: item.tags,
    loop: isLoop,
    width, height,
    aspect: +(width / height).toFixed(4),
    orientation: width / height > 1.15 ? 'landscape' : width / height < 0.87 ? 'portrait' : 'square',
    duration,
    src: `${publicBase}/${outName}`,
    poster: `${publicBase}/${posterName}`,
    bytes: stat.size,
    srcBytes: (await fs.stat(item.abs)).size,
  };

  cache.set(key, result);
  return result;
}

/* --- embedded video (Vimeo / YouTube) ------------------------------------ */
export function parseEmbed(url) {
  if (!url) return null;
  let m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { provider: 'vimeo', id: m[1], url: `https://player.vimeo.com/video/${m[1]}?byline=0&portrait=0&title=0&dnt=1` };
  m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { provider: 'youtube', id: m[1], url: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1` };
  return null;
}

export const fmtBytes = (n) =>
  n > 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`;
