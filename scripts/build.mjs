#!/usr/bin/env node
/* ============================================================================
   BUILD — `npm run build`
   Reads site.config.js + content/projects.js + source-media/, and writes a
   complete static site into dist/.
   ========================================================================== */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../site.config.js';
import projects from '../content/projects.js';
import {
  discoverProjectMedia, processImage, processVideo, parseEmbed,
  MediaCache, humanize, fmtBytes,
} from './lib/media.mjs';
import { BASE } from '../src/templates/shell.mjs';
import { renderHome } from '../src/templates/home.mjs';
import { renderProject, renderNotFound } from '../src/templates/project.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_MEDIA = path.join(ROOT, 'source-media');
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, '.media-cache');

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

/* Run async jobs n-at-a-time so a folder of 60MB TIFFs can't exhaust memory. */
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

async function copyDir(from, to) {
  if (!existsSync(from)) return 0;
  await fs.mkdir(to, { recursive: true });
  let n = 0;
  for (const e of await fs.readdir(from, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const s = path.join(from, e.name), d = path.join(to, e.name);
    if (e.isDirectory()) n += await copyDir(s, d);
    else { await fs.copyFile(s, d); n++; }
  }
  return n;
}

async function main() {
  const t0 = Date.now();
  console.log(`\n${c.bold('BUILDING')} ${c.dim(site.siteTitle)}\n`);

  // Wipe the generated pages but KEEP dist/media — those derivatives are
  // expensive to make and are what the cache is checking for. Anything stale
  // in there gets pruned at the end of the build.
  await fs.mkdir(DIST, { recursive: true });
  for (const e of await fs.readdir(DIST, { withFileTypes: true })) {
    // 'media' is the expensive cache; '.git' is the deploy repo (see deploy.mjs).
    if (e.name === 'media' || e.name === '.git') continue;
    await fs.rm(path.join(DIST, e.name), { recursive: true, force: true });
  }

  const cache = new MediaCache(CACHE);
  await cache.load();

  const warnings = [];
  const expected = new Set();   // every /media/... url this build produces
  let totalSrcBytes = 0, totalOutBytes = 0, totalTypical = 0, imageCount = 0;

  /* --- 1. media ---------------------------------------------------------- */
  for (const p of projects) {
    const items = await discoverProjectMedia(SRC_MEDIA, p.slug);
    if (!items.length) {
      warnings.push(`No media found for "${p.slug}" — expected files in source-media/${p.slug}/`);
      p.media = [];
      continue;
    }

    const outDir = path.join(DIST, 'media', p.slug);
    const publicBase = `${BASE}/media/${p.slug}`;
    process.stdout.write(`  ${c.cyan(p.slug.padEnd(18))} ${items.length} file${items.length === 1 ? '' : 's'} `);

    const processed = await pool(items, 4, async (item) => {
      try {
        const r = item.kind === 'video'
          ? await processVideo(item, { outDir, publicBase, cfg: site.media, cache })
          : await processImage(item, { outDir, publicBase, cfg: site.media, cache });
        r.human = humanize(r.base);
        if (r.kind === 'video' && r.bytes > site.media.videoWarnSizeMB * 1e6) {
          warnings.push(`${p.slug}/${item.file} is ${fmtBytes(r.bytes)} after compression. Consider hosting it on Vimeo and using the \`video:\` field instead.`);
        }
        return r;
      } catch (err) {
        warnings.push(`Skipped ${p.slug}/${item.file} — ${err.message}`);
        return null;
      }
    });

    p.media = processed.filter(Boolean);
    for (const m of p.media) {
      if (m.kind === 'image') for (const src of m.sources) for (const f of src.files) expected.add(f.url);
      else { expected.add(m.src); expected.add(m.poster); }
      totalSrcBytes += m.srcBytes;
      totalOutBytes += m.bytes;
      if (m.kind === 'image') { imageCount++; totalTypical += m.typical ?? 0; }
    }

    // Cover: a file literally named cover.*, else the first image, else first item.
    p.cover = p.media.find((m) => m.base.toLowerCase() === 'cover')
      ?? p.media.find((m) => m.kind === 'image')
      ?? p.media[0];
    // An @loop video plays on hover over the homepage tile.
    p.loopVideo = p.media.find((m) => m.kind === 'video' && m.loop && m !== p.cover) ?? null;
    p.embed = parseEmbed(p.video);

    console.log(c.green('ok'));
  }

  /* --- 1b. the opening photo --------------------------------------------- */
  let heroMedia = null;
  const heroItems = await discoverProjectMedia(SRC_MEDIA, '_hero');
  if (!heroItems.length) {
    warnings.push(`No opening photo yet. Put one in source-media/_hero/ and name it in site.config.js (hero.image). The homepage falls back to plain type until you do.`);
  } else {
    const pick = heroItems.find((i) => i.file === site.hero?.image) ?? heroItems[0];
    if (site.hero?.image && pick.file !== site.hero.image) {
      warnings.push(`site.config.js asks for hero image "${site.hero.image}" but source-media/_hero/ doesn't have it — using "${pick.file}" instead.`);
    }
    const outDir = path.join(DIST, 'media', '_hero');
    const publicBase = `${BASE}/media/_hero`;
    process.stdout.write(`  ${c.cyan('_hero'.padEnd(18))} ${pick.file} `);
    try {
      heroMedia = pick.kind === 'video'
        ? await processVideo(pick, { outDir, publicBase, cfg: site.media, cache })
        : await processImage(pick, { outDir, publicBase, cfg: site.media, cache });
      if (heroMedia.kind === 'image') for (const src of heroMedia.sources) for (const f of src.files) expected.add(f.url);
      else { expected.add(heroMedia.src); expected.add(heroMedia.poster); }
      totalSrcBytes += heroMedia.srcBytes; totalOutBytes += heroMedia.bytes;
      console.log(c.green('ok'));
    } catch (err) {
      console.log(c.red('failed'));
      warnings.push(`Could not process the opening photo — ${err.message}`);
    }
  }

  const live = projects.filter((p) => p.media.length);

  /* --- 2. pages ---------------------------------------------------------- */
  const stats = { projectCount: live.length, imageCount };
  await fs.writeFile(path.join(DIST, 'index.html'), renderHome(site, projects, stats, heroMedia));

  for (let i = 0; i < live.length; i++) {
    const p = live[i];
    const dir = path.join(DIST, 'work', p.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, 'index.html'),
      renderProject(site, p, {
        next: live[(i + 1) % live.length] ?? null,
        prev: i > 0 ? live[i - 1] : null,
      })
    );
  }
  await fs.writeFile(path.join(DIST, '404.html'), renderNotFound(site));

  /* --- 3. assets --------------------------------------------------------- */
  await copyDir(path.join(ROOT, 'src/styles'), path.join(DIST, 'styles'));
  await copyDir(path.join(ROOT, 'src/scripts'), path.join(DIST, 'scripts'));
  await copyDir(path.join(ROOT, 'static'), DIST);

  // GitHub Pages runs Jekyll by default, which silently refuses to serve any
  // path beginning with an underscore — which would hide /media/_hero/ .
  await fs.writeFile(path.join(DIST, '.nojekyll'), '');

  const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${site.theme.ink}"/><text x="16" y="23" font-family="monospace" font-size="20" font-weight="700" fill="${site.theme.paper}" text-anchor="middle">${site.name.trim()[0] ?? 'A'}</text></svg>`;
  await fs.writeFile(path.join(DIST, 'favicon.svg'), fav);

  const base = site.siteUrl.replace(/\/$/, '');
  await fs.writeFile(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [`${base}/`, ...live.map((p) => `${base}/work/${p.slug}/`)]
      .map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`);
  await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);

  // Cloudflare Pages / Netlify: media filenames change when you change the
  // image, so they can be cached forever. HTML must stay fresh.
  await fs.writeFile(path.join(DIST, '_headers'),
    `/media/*\n  Cache-Control: public, max-age=31536000, immutable\n\n` +
    `/styles/*\n  Cache-Control: public, max-age=3600\n\n` +
    `/scripts/*\n  Cache-Control: public, max-age=3600\n\n` +
    `/*\n  Cache-Control: public, max-age=0, must-revalidate\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);

  // Prune derivatives whose source was renamed, retagged or deleted.
  const mediaRoot = path.join(DIST, 'media');
  let pruned = 0;
  if (existsSync(mediaRoot)) {
    for (const slugDir of await fs.readdir(mediaRoot, { withFileTypes: true })) {
      if (!slugDir.isDirectory()) continue;
      const abs = path.join(mediaRoot, slugDir.name);
      if (slugDir.name !== '_hero' && !projects.some((p) => p.slug === slugDir.name)) {
        await fs.rm(abs, { recursive: true, force: true }); pruned++; continue;
      }
      for (const f of await fs.readdir(abs)) {
        if (!expected.has(`${BASE}/media/${slugDir.name}/${f}`)) {
          await fs.rm(path.join(abs, f), { force: true }); pruned++;
        }
      }
    }
  }

  await cache.save();

  /* --- 4. report --------------------------------------------------------- */
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const saved = totalSrcBytes > 0 ? Math.round((1 - totalOutBytes / totalSrcBytes) * 100) : 0;

  console.log(`\n${c.bold('DONE')} in ${secs}s`);
  console.log(`  ${live.length} project pages, ${imageCount} images`);
  if (imageCount > 0) {
    const avgSrc = totalSrcBytes / imageCount, avgOut = totalTypical / imageCount;
    console.log(`  ${c.dim('a visitor downloads ~')}${c.green(fmtBytes(avgOut))} ${c.dim('per image in the grid')} ` +
                `${c.dim(`(originals average ${fmtBytes(avgSrc)})`)}`);
    console.log(`  ${c.dim('deploy size')} ${fmtBytes(totalOutBytes)} ${c.dim(`across ${live.reduce((n,p)=>n+p.media.length,0)} source files`)}`);
  }
  console.log(`  cache ${c.dim(`${cache.hits} reused, ${cache.misses} processed${pruned ? `, ${pruned} pruned` : ''}`)}`);

  if (warnings.length) {
    console.log(`\n${c.yellow('NOTES')}`);
    for (const w of warnings) console.log(`  ${c.yellow('!')} ${w}`);
  }
  console.log(`\n  ${c.bold('npm run serve')} ${c.dim('to preview at http://localhost:4321')}\n`);
}

main().catch((err) => { console.error(c.red('\nBUILD FAILED\n'), err); process.exit(1); });
