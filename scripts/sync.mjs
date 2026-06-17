// sync.mjs — pull the latest public content from the Obsidian vault into this repo,
// rebuild the graph/content index, then commit & push (which triggers the Vercel deploy).
//
// Usage:
//   npm run sync                       # uses the default VAULT_DIR below
//   VAULT_DIR="/path/to/vault" npm run sync
//   npm run sync -- --no-push          # sync + commit, skip push
//
// Public scope copied into ./content: wiki/, blog/, raw/assets/  (nothing else).
// Private material (note/, raw/*.md, Zotero/) never enters this repo.

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const VAULT_DIR =
  process.env.VAULT_DIR ||
  '/Users/6_month/Library/CloudStorage/GoogleDrive-firstn1028@gmail.com/내 드라이브/Obsidian/Obsidian';

const repoDir = process.cwd();
const contentDir = path.join(repoDir, 'content');
const noPush = process.argv.includes('--no-push');

// [vault subpath, destination under ./content]
const COPIES = [
  ['wiki', 'wiki'],
  ['blog', 'blog'],
  ['raw/assets', 'raw/assets'],
];

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: repoDir });
}

async function main() {
  // Verify the vault is reachable before touching anything.
  try {
    await fs.access(VAULT_DIR);
  } catch {
    console.error(`✗ VAULT_DIR not found: ${VAULT_DIR}`);
    console.error(`  Set it explicitly:  VAULT_DIR="/path/to/vault" npm run sync`);
    process.exit(1);
  }

  // Wipe content/ so deletions in the vault propagate (no stale notes).
  await fs.rm(contentDir, { recursive: true, force: true });

  for (const [src, dest] of COPIES) {
    const from = path.join(VAULT_DIR, src);
    const to = path.join(contentDir, dest);
    try {
      await fs.access(from);
    } catch {
      console.warn(`• skip (missing in vault): ${src}`);
      continue;
    }
    await fs.mkdir(path.dirname(to), { recursive: true });
    // preserveTimestamps so build-graph can fall back to each note's authoring
    // mtime for its date when no created/date frontmatter is present.
    await fs.cp(from, to, { recursive: true, preserveTimestamps: true });
    console.log(`• copied ${src} → content/${dest}`);
  }

  // Regenerate graph-data.json / content-index.json and public/raw/assets.
  console.log('\n→ building graph & content index...');
  run('node scripts/build-graph.mjs');

  // Commit & push.
  console.log('\n→ committing...');
  run('git add -A');

  // Nothing staged? Bail cleanly.
  try {
    execSync('git diff --cached --quiet', { cwd: repoDir });
    console.log('✓ no changes — vault already in sync.');
    return;
  } catch {
    /* there are staged changes, continue */
  }

  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  run(`git commit -m ${JSON.stringify(`sync: ${stamp}`)}`);

  if (noPush) {
    console.log('✓ committed (push skipped via --no-push).');
    return;
  }

  console.log('\n→ pushing...');
  run('git push');
  console.log('\n✓ synced & pushed. Vercel will deploy automatically.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
