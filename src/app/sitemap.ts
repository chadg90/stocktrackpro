import { MetadataRoute } from 'next';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';
import { absolutePageUrl } from '@/lib/site';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedArticles = await getAllPublishedComplianceArticles();

  const articleLastModified = Object.fromEntries(
    publishedArticles.map((article) => [
      `/compliance-centre/${article.slug}`,
      new Date(article.dateModified ?? article.datePublished),
    ])
  ) as Record<string, Date>;
  const pageLastModified: Record<string, Date> = {
    '/features': new Date('2026-09-03'),
    '/about': new Date('2026-09-03'),
    '/pricing': new Date('2026-09-03'),
    '/faq': new Date('2026-09-03'),
    '/contact': new Date('2026-09-03'),
    '/vehicle-walkaround-check-app': new Date('2026-09-03'),
    '/vehicle-defect-reporting-software': new Date('2026-09-03'),
    '/fleet-mot-tax-reminders': new Date('2026-09-03'),
    '/customers/newstreet': new Date('2026-09-03'),
    '/customers/neemt': new Date('2026-09-03'),
  };

  const routes = [
    '/',
    '/features',
    '/vehicle-walkaround-check-app',
    '/vehicle-defect-reporting-software',
    '/fleet-mot-tax-reminders',
    '/about',
    '/pricing',
    '/faq',
    '/contact',
    '/compliance-centre',
    ...publishedArticles.map((article) => `/compliance-centre/${article.slug}`),
    '/customers/newstreet',
    '/customers/neemt',
    '/terms',
    '/subscription-terms',
    '/privacy',
    '/cookies',
  ];

  return routes.map((route) => {
    const isArticle = route.startsWith('/compliance-centre/') && route !== '/compliance-centre';
    const isHome = route === '/';
    const isCommercialFeature = [
      '/vehicle-walkaround-check-app',
      '/vehicle-defect-reporting-software',
      '/fleet-mot-tax-reminders',
    ].includes(route);
    return {
      // Match next.config trailingSlash: true — Google should see final URLs, not 308 hops.
      url: absolutePageUrl(route),
      lastModified:
        articleLastModified[route] ??
        pageLastModified[route] ??
        new Date('2026-07-06'),
      changeFrequency: isHome ? 'weekly' : isArticle ? 'monthly' : 'monthly',
      priority:
        isHome
          ? 1
          : isArticle
            ? 0.85
            : route === '/pricing' || route === '/features' || isCommercialFeature
              ? 0.9
              : 0.7,
    };
  });
}
