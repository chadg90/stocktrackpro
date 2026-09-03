import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import {
  EDITORIAL_TEAM_ID,
  EDITORIAL_TEAM_NAME,
  SITE_LEGAL_NAME,
} from '@/lib/brand';
import { ORGANIZATION_ID, SITE_URL, WEBSITE_ID, absolutePageUrl } from '@/lib/site';

type Props = { article: ComplianceArticleMeta };

/**
 * Article + BreadcrumbList JSON-LD for compliance posts (Google rich results + clearer IA signals).
 */
export function ComplianceArticleJsonLd({ article }: Props) {
  const pageUrl = absolutePageUrl(`/compliance-centre/${article.slug}`);
  const hubUrl = absolutePageUrl('/compliance-centre');
  const homeUrl = absolutePageUrl('/');

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
      '@id': EDITORIAL_TEAM_ID,
      name: EDITORIAL_TEAM_NAME,
      url: `${absolutePageUrl('/about')}#editorial-team`,
      parentOrganization: { '@id': ORGANIZATION_ID },
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: SITE_LEGAL_NAME,
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
      '@id': WEBSITE_ID,
      name: 'Fleet Track PRO',
      url: homeUrl,
    },
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
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}
