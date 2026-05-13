import { getOrganizationSameAs, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/lib/site';

/**
 * Organization + WebSite graph for every page (Google + AI entity consolidation).
 */
export default function SiteWideJsonLd() {
  const sameAs = getOrganizationSameAs();

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Stock Track PRO Ltd',
    alternateName: ['Stock Track PRO', 'Stock Track PRO fleet software'],
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    email: 'support@stocktrackpro.co.uk',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@stocktrackpro.co.uk',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB',
    },
    areaServed: 'GB',
  };

  if (sameAs.length > 0) {
    organization.sameAs = sameAs;
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'Stock Track PRO',
        url: SITE_URL,
        inLanguage: 'en-GB',
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
