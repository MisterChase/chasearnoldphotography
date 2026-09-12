#!/usr/bin/env node
/* Tiny static server for previewing dist/ locally. No dependencies. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = process.env.PORT || 4321;
// The built site may be addressed under a subfolder (GitHub Pages). Serve it
// at both / and that subfolder so the local preview matches production.
const { default: site } = await import(path.join(ROOT, 'site.config.js'));
const BASE = (site.basePath || '').replace(/\/$/, '');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (BASE && (url === BASE || url.startsWith(BASE + '/'))) url = url.slice(BASE.length) || '/';
  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403).end('Forbidden'); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    const nf = path.join(DIST, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`\n  Preview  →  http://localhost:${PORT}\n  Ctrl+C to stop\n`));
