/**
 * Firebase App Hosting's Next.js adapter can skip copying the full `public/`
 * folder into the standalone server bundle (known adapter bug). That makes
 * logos, demo screenshots, and other static images 404 in production.
 *
 * After `next build`, merge the full `public/` tree into every standalone
 * output we can find so those assets are included in the deploy.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const publicDir = join(root, 'public');
const standaloneRoot = join(root, '.next', 'standalone');

function listDirsRecursive(dir, depth = 0, out = []) {
  if (depth > 4 || !existsSync(dir)) return out;
  out.push(dir);
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const full = join(dir, name);
    try {
      if (statSync(full).isDirectory()) listDirsRecursive(full, depth + 1, out);
    } catch {
      // ignore
    }
  }
  return out;
}

if (!existsSync(publicDir)) {
  console.log('[copy-public-for-apphosting] No public/ folder — nothing to copy.');
  process.exit(0);
}

if (!existsSync(standaloneRoot)) {
  console.log(
    '[copy-public-for-apphosting] No .next/standalone yet (local next build). Skipping.'
  );
  process.exit(0);
}

const targets = listDirsRecursive(standaloneRoot)
  .filter((dir) => existsSync(join(dir, 'server.js')) || existsSync(join(dir, 'package.json')))
  .map((dir) => join(dir, 'public'));

// Always include the default standalone/public path
targets.unshift(join(standaloneRoot, 'public'));

const uniqueTargets = [...new Set(targets)];
for (const target of uniqueTargets) {
  mkdirSync(target, { recursive: true });
  cpSync(publicDir, target, { recursive: true, force: true });
  console.log(`[copy-public-for-apphosting] Copied public/ -> ${target}`);
}
