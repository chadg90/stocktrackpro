import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import { ORGANIZATION_ID, SITE_URL } from '@/lib/site';

type Props = { article: ComplianceArticleMeta };

/**
 * Article + BreadcrumbList JSON-LD for compliance posts (Google rich results + clearer IA signals).
 */
export function ComplianceArticleJsonLd({ article }: Props) {
  const pageUrl = `${SITE_URL}/compliance-centre/${article.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    inLanguage: 'en-GB',
    image: [`${SITE_URL}/og-image.jpg`],
    author: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Stock Track PRO Ltd',
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Stock Track PRO Ltd',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Stock Track PRO',
      url: SITE_URL,
    },
    about: [
      'Van fleet compliance',
      'DVSA vehicle checks',
      'Vehicle defect records',
    ],
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Compliance Centre',
        item: `${SITE_URL}/compliance-centre`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}
