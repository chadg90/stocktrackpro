import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site';

const CANONICAL_HOST = 'www.fleettrackpro.co.uk';

// Transactional return and invite routes intentionally remain crawlable so
// search engines can read their page-level `noindex` metadata.
const PRIVATE_PATHS = ['/api/', '/dashboard/', '/onboarding/', '/404', '/500'];

function hostFromHeaders(headerList: Headers): string {
  const raw = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  return raw.split(',')[0]?.trim().split(':')[0]?.toLowerCase() ?? '';
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = hostFromHeaders(headerList);

  // Non-www hosts (apex, preview, legacy): disallow everything.
  if (host && host !== CANONICAL_HOST) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const publicRule = {
    allow: '/' as const,
    disallow: PRIVATE_PATHS,
  };

  return {
    rules: [
      { userAgent: '*', ...publicRule },
      // Allow major AI crawlers on public marketing content only.
      { userAgent: 'GPTBot', ...publicRule },
      { userAgent: 'ChatGPT-User', ...publicRule },
      { userAgent: 'OAI-SearchBot', ...publicRule },
      { userAgent: 'ClaudeBot', ...publicRule },
      { userAgent: 'PerplexityBot', ...publicRule },
      { userAgent: 'Google-Extended', ...publicRule },
      { userAgent: 'Googlebot', allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
