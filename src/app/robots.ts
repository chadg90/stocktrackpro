import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Transactional return and invite routes intentionally remain crawlable so
// search engines can read their page-level `noindex` metadata.
// Preview hosts are blocked via middleware X-Robots-Tag (no headers() here — keeps route static).
const PRIVATE_PATHS = ['/api/', '/dashboard/', '/onboarding/', '/404', '/500'];

const publicRule = {
  allow: '/' as const,
  disallow: PRIVATE_PATHS,
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', ...publicRule },
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
