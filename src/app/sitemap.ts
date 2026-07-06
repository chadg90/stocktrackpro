import { MetadataRoute } from 'next';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';
import { SITE_URL } from '@/lib/site';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedArticles = await getAllPublishedComplianceArticles();

  const articleLastModified = Object.fromEntries(
    publishedArticles.map((article) => [
      `/compliance-centre/${article.slug}`,
      new Date(article.dateModified ?? article.datePublished),
    ])
  ) as Record<string, Date>;

  const routes = [
    '',
    '/features',
    '/about',
    '/pricing',
    '/faq',
    '/contact',
    '/compliance-centre',
    ...publishedArticles.map((article) => `/compliance-centre/${article.slug}`),
    '/customers/newstreet',
    '/terms',
    '/subscription-terms',
    '/privacy',
    '/cookies',
  ];

  return routes.map((route) => {
    const isArticle = route.startsWith('/compliance-centre/') && route !== '/compliance-centre';
    return {
      url: `${SITE_URL}${route}`,
      lastModified: articleLastModified[route] ?? new Date('2026-07-06'),
      changeFrequency: route === '' ? 'weekly' : isArticle ? 'monthly' : 'monthly',
      priority: route === '' ? 1 : isArticle ? 0.85 : route === '/pricing' || route === '/features' ? 0.9 : 0.7,
    };
  });
}
