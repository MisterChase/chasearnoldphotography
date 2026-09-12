#!/usr/bin/env node
/* ============================================================================
   npm run new "Project Name"
   Creates source-media/<slug>/ and adds a starter entry to content/projects.js.
   ========================================================================== */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const title = process.argv.slice(2).join(' ').trim();

if (!title) {
  console.error('\n  Usage:  npm run new "Project Name"\n');
  process.exit(1);
}

const slug = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const dir = path.join(ROOT, 'source-media', slug);
const file = path.join(ROOT, 'content/projects.js');

let src = await fs.readFile(file, 'utf8');
if (src.includes(`slug: '${slug}'`)) {
  console.error(`\n  "${slug}" is already in content/projects.js.\n`);
  process.exit(1);
}

await fs.mkdir(dir, { recursive: true });

const entry = `  {
    slug: '${slug}',
    title: '${title.toUpperCase().replace(/'/g, "\\'")}',
    description: 'One line about this project',
    services: ['DISCIPLINE'],
    year: '${new Date().getFullYear()}',
    client: '',
    role: '',
    about: \`A longer note about the work. Delete this field if you don't want one.\`,
    featured: false,
  },
`;

// Insert before the closing bracket of the exported array.
const close = src.lastIndexOf('];');
if (close === -1) {
  console.error('\n  Could not find the end of the array in content/projects.js — add the entry by hand:\n');
  console.log(entry);
  process.exit(1);
}
src = src.slice(0, close) + entry + src.slice(close);
await fs.writeFile(file, src);

console.log(`
  Added "${title}"

    1. Put your images and videos in   source-media/${slug}/
       Name them 01-…, 02-… to set the order.
    2. Edit the entry in               content/projects.js
    3. Run                             npm run build
`);
