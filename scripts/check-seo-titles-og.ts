/**
 * CI: every sitemap URL must have a document <title> ≤ 60 characters and an og:image.
 *
 * Modes:
 * 1) Static (always): validates known title segments + OG asset files exist.
 * 2) Crawl: if SEO_CHECK_BASE_URL is set (e.g. http://127.0.0.1:3000 or production),
 *    fetches /sitemap.xml and checks each page's live HTML.
 *
 * Run: npm run test:seo
 * Crawl: SEO_CHECK_BASE_URL=https://www.fleettrackpro.co.uk npm run test:seo
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMPLIANCE_ARTICLES } from '../src/content/complianceArticles';
import {
  DOCUMENT_TITLE_SUFFIX,
  MAX_DOCUMENT_TITLE_LENGTH,
  complianceMetadataTitle,
  resolveFullDocumentTitle,
  withBrandSuffix,
} from '../src/lib/seo/documentTitles';

const ROOT = join(__dirname, '..');

type Issue = { url: string; problem: string };

const MARKETING_TITLE_SEGMENTS: Array<{ path: string; segment?: string; absolute?: string }> = [
  { path: '/', absolute: 'Fleet Track PRO | Daily Vehicle Checks App & DVSA' },
  { path: '/features/', segment: 'Fleet Management Features' },
  { path: '/vehicle-walkaround-check-app/', absolute: 'Walkaround Check App for UK Fleets: Free Trial' },
  { path: '/vehicle-defect-reporting-software/', segment: 'Vehicle Defect Reporting Software' },
  { path: '/fleet-mot-tax-reminders/', segment: 'Fleet MOT and Tax Reminder Software' },
  { path: '/about/', absolute: 'About Fleet Track PRO | UK Fleet Compliance Software' },
  { path: '/pricing/', segment: 'UK Fleet Management Software Pricing' },
  { path: '/faq/', segment: 'Fleet Management Software FAQs' },
  { path: '/contact/', segment: 'Fleet Software Sales and Support' },
  { path: '/getting-started/', segment: 'Getting started with Fleet Track PRO' },
  { path: '/compliance-centre/', segment: 'Compliance Centre' },
  { path: '/customers/newstreet/', segment: 'Newstreet Groundworks Fleet Case Study' },
  { path: '/customers/neemt/', segment: 'NEEMT Emergency Vehicle Fleet Case Study' },
  { path: '/terms/', segment: 'Terms and Conditions' },
  { path: '/subscription-terms/', segment: 'Subscription Terms' },
  { path: '/privacy/', segment: 'Privacy Policy' },
  { path: '/cookies/', segment: 'Cookie Policy' },
  { path: '/demo/', segment: 'App demo preview' },
];

function fullTitle(entry: { segment?: string; absolute?: string }): string {
  if (entry.absolute) return entry.absolute;
  return withBrandSuffix(entry.segment!);
}

function assertStaticTitles(): Issue[] {
  const issues: Issue[] = [];

  for (const entry of MARKETING_TITLE_SEGMENTS) {
    const title = fullTitle(entry);
    if (title.length > MAX_DOCUMENT_TITLE_LENGTH) {
      issues.push({
        url: entry.path,
        problem: `title ${title.length} chars > ${MAX_DOCUMENT_TITLE_LENGTH}: "${title}"`,
      });
    }
  }

  for (const article of COMPLIANCE_ARTICLES) {
    const title = resolveFullDocumentTitle(complianceMetadataTitle(article.slug, article.title));
    if (title.length > MAX_DOCUMENT_TITLE_LENGTH) {
      issues.push({
        url: `/compliance-centre/${article.slug}/`,
        problem: `title ${title.length} chars > ${MAX_DOCUMENT_TITLE_LENGTH}: "${title}"`,
      });
    }
  }

  // Demo must not double the brand suffix in the segment.
  const demo = MARKETING_TITLE_SEGMENTS.find((e) => e.path === '/demo/');
  if (demo?.segment?.includes(DOCUMENT_TITLE_SUFFIX.trim()) || demo?.segment?.includes('| Fleet Track PRO')) {
    issues.push({ url: '/demo/', problem: 'demo title segment already includes brand suffix' });
  }

  return issues;
}

function assertOgAssets(): Issue[] {
  const issues: Issue[] = [];
  const required = [
    'public/og-image.jpg',
    'public/og/legal.png',
    'src/app/compliance-centre/[slug]/opengraph-image.tsx',
  ];
  for (const rel of required) {
    if (!existsSync(join(ROOT, rel))) {
      issues.push({ url: rel, problem: 'missing OG asset / opengraph-image route' });
    }
  }
  return issues;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeBasicEntities(m[1].trim()) : null;
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    urls.push(m[1].trim());
  }
  return urls;
}

async function crawlBase(baseUrl: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const sitemapUrl = `${baseUrl.replace(/\/$/, '')}/sitemap.xml`;
  const sitemapRes = await fetch(sitemapUrl);
  if (!sitemapRes.ok) {
    return [{ url: sitemapUrl, problem: `failed to fetch sitemap (${sitemapRes.status})` }];
  }
  const xml = await sitemapRes.text();
  const urls = parseSitemapUrls(xml);
  if (urls.length === 0) {
    return [{ url: sitemapUrl, problem: 'sitemap contained no <loc> entries' }];
  }

  for (const url of urls) {
    let res: Response;
    try {
      res = await fetch(url, { redirect: 'follow' });
    } catch (err) {
      issues.push({ url, problem: `fetch error: ${(err as Error).message}` });
      continue;
    }
    if (!res.ok) {
      issues.push({ url, problem: `HTTP ${res.status}` });
      continue;
    }
    const html = await res.text();
    const title = extractTitle(html);
    if (!title) {
      issues.push({ url, problem: 'missing <title>' });
    } else if (title.length > MAX_DOCUMENT_TITLE_LENGTH) {
      issues.push({
        url,
        problem: `title ${title.length} chars > ${MAX_DOCUMENT_TITLE_LENGTH}: "${title}"`,
      });
    }
    const og = extractOgImage(html);
    if (!og) {
      issues.push({ url, problem: 'missing og:image' });
    }
  }

  return issues;
}

async function main() {
  const staticIssues = [...assertStaticTitles(), ...assertOgAssets()];
  let crawlIssues: Issue[] = [];
  const base = process.env.SEO_CHECK_BASE_URL?.trim();
  if (base) {
    console.log(`Crawling sitemap at ${base} …`);
    crawlIssues = await crawlBase(base);
  } else {
    console.log('Skipping live crawl (set SEO_CHECK_BASE_URL to enable).');
  }

  const issues = [...staticIssues, ...crawlIssues];
  if (issues.length) {
    console.error('SEO title / og:image check FAILED:');
    for (const issue of issues) {
      console.error(`  - ${issue.url}: ${issue.problem}`);
    }
    process.exit(1);
  }

  console.log(
    `OK — titles ≤ ${MAX_DOCUMENT_TITLE_LENGTH}, OG assets present` +
      (base ? `, crawl of ${base} passed` : '')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
