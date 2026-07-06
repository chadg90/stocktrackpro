import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const PRIVATE_PATHS = ['/api/', '/dashboard/', '/onboarding/', '/return/', '/404', '/500'];

export default function robots(): MetadataRoute.Robots {
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
