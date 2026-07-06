import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import { SITE_SHORT_DESCRIPTION } from '@/content/siteSeo';
import { ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/lib/site';

type Props = {
  articles: ComplianceArticleMeta[];
};

/** BreadcrumbList + ItemList for the Compliance Centre index (Google + AI discovery). */
export default function ComplianceCentreHubJsonLd({ articles }: Props) {
  const hubUrl = `${SITE_URL}/compliance-centre`;

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
        item: hubUrl,
      },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${hubUrl}#collection`,
    url: hubUrl,
    name: 'Compliance Centre',
    description: SITE_SHORT_DESCRIPTION,
    inLanguage: 'en-GB',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: article.title,
      url: `${SITE_URL}/compliance-centre/${article.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
    </>
  );
}
