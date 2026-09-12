#!/usr/bin/env node
/* ============================================================================
   npm run deploy
   Builds the site, then publishes dist/ to the gh-pages branch of your repo.

   dist/ keeps its own little git repository so the published history stays
   separate from your source code. Nothing here touches your main branch.
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../site.config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const sh = (cmd, args, cwd = ROOT) =>
  execFileSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8' }).trim();
const shLoud = (cmd, args, cwd = ROOT) =>
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim  = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

// Where does this publish to? Read it off the main repo's origin remote.
let remote;
try {
  remote = sh('git', ['remote', 'get-url', 'origin']);
} catch {
  console.error(`
  No GitHub repository is connected yet.

  Create one and connect it first:
      gh repo create chasearnoldphotography --public --source=. --remote=origin --push

  Then run npm run deploy again.
`);
  process.exit(1);
}

console.log(`\n${bold('BUILDING')}`);
shLoud('npm', ['run', 'build']);

if (!existsSync(path.join(DIST, 'index.html'))) {
  console.error('\n  Build produced no index.html — stopping.\n');
  process.exit(1);
}

console.log(`${bold('PUBLISHING')} ${dim(remote)}`);

// A throwaway repo inside dist/, re-pointed at origin each time.
if (!existsSync(path.join(DIST, '.git'))) {
  sh('git', ['init', '-q'], DIST);
  sh('git', ['checkout', '-q', '-B', 'gh-pages'], DIST);
}
// Inherit the identity configured on the main repo.
for (const key of ['user.name', 'user.email']) {
  try { sh('git', ['config', key, sh('git', ['config', key])], DIST); } catch {}
}
try { sh('git', ['remote', 'remove', 'origin'], DIST); } catch {}
sh('git', ['remote', 'add', 'origin', remote], DIST);

sh('git', ['add', '-A'], DIST);
try {
  sh('git', ['commit', '-q', '-m', `Publish ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`], DIST);
} catch {
  console.log(dim('  nothing changed since the last publish'));
}
// The published branch is a snapshot, not a history worth preserving.
sh('git', ['push', '-q', '--force', 'origin', 'gh-pages'], DIST);

const url = site.siteUrl.replace(/\/$/, '') + '/';
console.log(`
  ${green('Published.')}  ${bold(url)}

  ${dim('GitHub takes about a minute to serve the new version.')}
  ${dim('If you just created the repo, enable Pages once:')}
  ${dim('  Settings -> Pages -> Source: "Deploy from a branch" -> gh-pages / (root)')}
`);
