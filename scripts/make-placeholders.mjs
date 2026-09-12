#!/usr/bin/env node
/* ============================================================================
   Generates stand-in photosets into source-media/ so the site is viewable
   before you have your own work in place. Deliberately oversized (multi-MB,
   up to 4000px) so the optimizer gets a realistic workout.

   DELETE source-media/<slug>/ and drop your own files in when ready.
   Re-run any time with:  node scripts/make-placeholders.mjs
   ========================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'source-media');

const PALETTES = {
  'nocturne':     [['#10131f', '#2b3a5e', '#6d7fa8'], ['#080a12', '#1d2740', '#4a5878']],
  'halfsecond':   [['#1a1a1a', '#3d3a35', '#8a8177'], ['#101010', '#2e2b28', '#b5a893']],
  'field-notes':  [['#141614', '#2f3a2e', '#6f7e63'], ['#0d0f0d', '#242c23', '#8f9a80']],
  'monolith':     [['#121212', '#332f3a', '#7b6f86'], ['#0b0b0e', '#262233', '#5d5470']],
  'transmission': [['#0a0f14', '#123043', '#2e8ba8'], ['#070c10', '#0f2333', '#4fb0c6']],
  'still-life':   [['#1b1714', '#453930', '#a08a72'], ['#141110', '#302722', '#c2a98c']],
};

/* Grain tile, composited over every frame so the placeholders don't read as flat CSS. */
async function grain(size = 220) {
  const px = Buffer.alloc(size * size * 3);
  for (let i = 0; i < px.length; i += 3) {
    const v = 110 + ((Math.random() * 90) | 0);
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  return sharp(px, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer();
}

function artwork(w, h, pal, seed) {
  const [a, b, c] = pal;
  const r = (n) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const shapes = Array.from({ length: 3 }, (_, i) => {
    const cx = r(i * 3) * w, cy = r(i * 3 + 1) * h, rad = (0.18 + r(i * 3 + 2) * 0.4) * Math.min(w, h);
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="url(#g2)" opacity="${(0.16 + r(i) * 0.3).toFixed(2)}"/>`;
  }).join('');
  const bandY = (0.55 + r(9) * 0.3) * h;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="${(0.3 + r(4)).toFixed(2)}" y2="1">
        <stop offset="0%" stop-color="${a}"/><stop offset="62%" stop-color="${b}"/><stop offset="100%" stop-color="${c}"/>
      </linearGradient>
      <radialGradient id="g2"><stop offset="0%" stop-color="${c}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
      <linearGradient id="g3" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${c}" stop-opacity="0"/><stop offset="50%" stop-color="${c}" stop-opacity=".5"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g1)"/>
    ${shapes}
    <rect x="0" y="${bandY.toFixed(0)}" width="${w}" height="${(h * 0.004).toFixed(0)}" fill="url(#g3)"/>
  </svg>`);
}

async function makeImage(file, w, h, pal, seed, noise) {
  const buf = await sharp(artwork(w, h, pal, seed))
    .composite([{ input: noise, tile: true, blend: 'soft-light' }])
    .jpeg({ quality: 97, chromaSubsampling: '4:4:4' })  // intentionally heavy
    .toBuffer();
  await fs.writeFile(file, buf);
  return buf.length;
}

/* Shapes chosen so the auto-layout has portraits, landscapes and squares to work with. */
const PLAN = [
  { name: '01-cover',            w: 3200, h: 4000, tag: null },
  { name: '02-wide',             w: 4000, h: 2250, tag: 'full' },
  { name: '03-detail-left',      w: 2400, h: 3000, tag: 'half' },
  { name: '04-detail-right',     w: 2400, h: 3000, tag: 'half' },
  { name: '05-landscape',        w: 3600, h: 2400, tag: 'wide' },
  { name: '06-study-one',        w: 1800, h: 1800, tag: 'third' },
  { name: '07-study-two',        w: 1800, h: 1800, tag: 'third' },
  { name: '08-study-three',      w: 1800, h: 1800, tag: 'third' },
  { name: '09-closing',          w: 4000, h: 2600, tag: 'full' },
];

async function main() {
  const noise = await grain();
  let total = 0, files = 0;

  for (const [slug, pals] of Object.entries(PALETTES)) {
    const dir = path.join(OUT, slug);
    await fs.mkdir(dir, { recursive: true });
    // Vary how many frames each project has so the grid isn't uniform.
    const n = 5 + ((slug.length * 3) % 5);
    process.stdout.write(`  ${slug.padEnd(16)} `);

    for (let i = 0; i < n; i++) {
      const spec = PLAN[i % PLAN.length];
      const pal = pals[i % pals.length];
      const name = spec.tag ? `${spec.name}@${spec.tag}.jpg` : `${spec.name}.jpg`;
      total += await makeImage(path.join(dir, name), spec.w, spec.h, pal, i + slug.length * 7, noise);
      files++;
      process.stdout.write('.');
    }
    console.log(' ok');
  }

  /* The opening photo. Landscape, so it fills a desktop viewport. */
  const heroDir = path.join(OUT, '_hero');
  await fs.mkdir(heroDir, { recursive: true });
  await makeImage(path.join(heroDir, 'hero.jpg'), 4200, 2800,
    ['#070a12', '#20304f', '#93a9c6'], 41, noise);
  console.log('  _hero            hero.jpg');

  /* One silent hover loop, so the grid shows off inline video too. */
  const loopDir = path.join(OUT, 'transmission');
  const still = path.join(loopDir, '01-cover.jpg');
  try {
    await run('ffmpeg', ['-y', '-loop', '1', '-i', still, '-t', '6',
      '-vf', "zoompan=z='min(zoom+0.0009,1.28)':d=150:s=1280x1600:fps=25,format=yuv420p",
      '-c:v', 'libx264', '-crf', '24', '-preset', 'fast', '-an',
      path.join(loopDir, 'cover@loop.mp4')], { maxBuffer: 1 << 26 });
    console.log('  transmission     + cover@loop.mp4');
  } catch (e) {
    console.log('  (skipped loop video — ffmpeg said:', e.message.split('\n')[0], ')');
  }

  console.log(`\n  ${files} placeholder files, ${(total / 1e6).toFixed(0)} MB of "originals"\n`);
}
main().catch((e) => { console.error(e); process.exit(1); });
