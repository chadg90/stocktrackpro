/**
 * Fails if any internal href in src/ is missing a trailing slash
 * (unless it has a file extension, is external, mailto/tel, or a bare hash).
 *
 * Run: npm run test:links
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = join(__dirname, '..', 'src');
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx']);

const HREF_RE =
  /\b(?:href|canonical|url)\s*[:=]\s*(?:\{)?[`'"](\/[^`'"]*)[`'"]/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (EXT.has(extname(name))) out.push(full);
  }
  return out;
}

function isExempt(href: string): boolean {
  if (!href.startsWith('/')) return true;
  if (href === '/') return true;
  if (href.startsWith('/#')) return true;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;
  if (href.startsWith('http://') || href.startsWith('https://')) return true;

  const beforeHash = href.split('#')[0] ?? href;
  const pathOnly = beforeHash.split('?')[0] ?? beforeHash;
  if (!pathOnly || pathOnly === '/') return true;
  if (/\.[a-z0-9]+$/i.test(pathOnly)) return true; // file extension
  return pathOnly.endsWith('/');
}

function main() {
  const issues: Array<{ file: string; href: string }> = [];
  for (const file of walk(ROOT)) {
    const text = readFileSync(file, 'utf8');
    HREF_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = HREF_RE.exec(text))) {
      const href = m[1];
      if (!isExempt(href)) {
        issues.push({ file: file.replace(ROOT + '/', 'src/'), href });
      }
    }
  }

  // Also ban bare href="#" placeholder links (ignore comments).
  for (const file of walk(ROOT)) {
    const text = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    if (/href\s*=\s*["']#["']/.test(text) || /href\s*=\s*\{\s*["']#["']\s*\}/.test(text)) {
      issues.push({ file: file.replace(ROOT + '/', 'src/'), href: '#' });
    }
  }

  if (issues.length) {
    console.error('Internal href trailing-slash / href="#" check FAILED:');
    for (const issue of issues) {
      console.error(`  - ${issue.file}: "${issue.href}"`);
    }
    process.exit(1);
  }
  console.log('OK — internal hrefs use trailing slashes (or file extensions); no href="#"');
}

main();
