import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import { ORGANIZATION_ID, SITE_URL, WEBSITE_ID, absolutePageUrl } from '@/lib/site';

/** Default article OG / schema image until per-article OG assets exist. */
export const COMPLIANCE_ARTICLE_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function complianceArticleCanonicalUrl(slug: string): string {
  return absolutePageUrl(`/compliance-centre/${slug}`);
}

export function complianceArticleWebPageId(slug: string): string {
  return `${complianceArticleCanonicalUrl(slug)}#webpage`;
}

/**
 * JSON-LD graph for a compliance article page:
 * WebPage + Article + BreadcrumbList (Home > Compliance Centre > article).
 */
export function buildComplianceArticleJsonLd(article: ComplianceArticleMeta): Record<string, unknown> {
  const pageUrl = complianceArticleCanonicalUrl(article.slug);
  const webPageId = complianceArticleWebPageId(article.slug);
  const hubUrl = absolutePageUrl('/compliance-centre');
  const homeUrl = absolutePageUrl('/');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': webPageId,
        url: pageUrl,
        name: article.title,
        description: article.metaDescription,
        inLanguage: 'en-GB',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORGANIZATION_ID },
      },
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline: article.title,
        description: article.metaDescription,
        datePublished: article.datePublished,
        dateModified: article.dateModified ?? article.datePublished,
        inLanguage: 'en-GB',
        image: [COMPLIANCE_ARTICLE_OG_IMAGE],
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        mainEntityOfPage: { '@id': webPageId },
        isPartOf: { '@id': WEBSITE_ID },
        about: [
          'Van fleet compliance',
          'DVSA vehicle checks',
          'Vehicle defect records',
        ],
        mentions: {
          '@type': 'SoftwareApplication',
          '@id': `${SITE_URL}/#software`,
          name: 'Fleet Track PRO',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: homeUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Compliance Centre',
            item: hubUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
