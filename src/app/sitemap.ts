import { MetadataRoute } from 'next';
import { COMPLIANCE_ARTICLES } from '@/content/complianceArticles';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

const ARTICLE_LAST_MODIFIED = Object.fromEntries(
  COMPLIANCE_ARTICLES.map((article) => [
    `/compliance-centre/${article.slug}`,
    new Date(article.dateModified ?? article.datePublished),
  ])
) as Record<string, Date>;

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/features',
    '/about',
    '/pricing',
    '/faq',
    '/contact',
    '/compliance-centre',
    '/compliance-centre/van-fleet-defect-records',
    '/compliance-centre/paper-vs-digital-inspection-sheets',
    '/compliance-centre/mot-expiry-tracking-for-fleets',
    '/compliance-centre/pre-use-checks-company-vehicles',
    '/compliance-centre/digital-defect-records-dvsa-scrutiny',
    '/compliance-centre/loler-thorough-examination-records',
    '/compliance-centre/plant-machinery-service-vs-loler-examination',
    '/compliance-centre/plant-examination-due-date-tracking',
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
      lastModified: ARTICLE_LAST_MODIFIED[route] ?? new Date('2026-07-06'),
      changeFrequency: route === '' ? 'weekly' : isArticle ? 'monthly' : 'monthly',
      priority: route === '' ? 1 : isArticle ? 0.85 : route === '/pricing' || route === '/features' ? 0.9 : 0.7,
    };
  });
}
