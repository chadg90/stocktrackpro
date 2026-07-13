import { SITE_URL } from '@/lib/site';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';

/** Public IndexNow key — must match public/{key}.txt at the site root. */
export const INDEXNOW_KEY = 'dbbbf591575b1280b42cbae9561e66d1';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function hostFromSiteUrl(): string {
  return new URL(SITE_URL).host;
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

export async function getMarketingUrlsForIndexNow(): Promise<string[]> {
  const articles = await getAllPublishedComplianceArticles();
  const routes = [
    '',
    '/features',
    '/about',
    '/pricing',
    '/faq',
    '/contact',
    '/compliance-centre',
    ...articles.map((article) => `/compliance-centre/${article.slug}`),
    '/customers/newstreet',
    '/terms',
    '/subscription-terms',
    '/privacy',
    '/cookies',
  ];
  return routes.map((route) => toAbsoluteUrl(route || '/'));
}

export type IndexNowResult = {
  ok: boolean;
  status: number;
  submitted: number;
  body: string;
};

/**
 * Notify IndexNow participants (Bing and partners) that URLs changed.
 * Google does not use IndexNow — keep Search Console / sitemap for Google.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const unique = [...new Set(urls.map(toAbsoluteUrl).filter(Boolean))];
  if (unique.length === 0) {
    return { ok: true, status: 200, submitted: 0, body: 'No URLs to submit' };
  }

  const host = hostFromSiteUrl();
  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList: unique,
    }),
  });

  const body = await response.text().catch(() => '');
  return {
    ok: response.ok || response.status === 202,
    status: response.status,
    submitted: unique.length,
    body,
  };
}

export async function notifyIndexNowForPaths(paths: string[]): Promise<void> {
  try {
    await submitUrlsToIndexNow(paths);
  } catch (error) {
    console.error('IndexNow notify failed:', error);
  }
}
