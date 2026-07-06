import { SITE_KNOWS_ABOUT, SITE_SHORT_DESCRIPTION, SITE_TAGLINE, SITE_BRAND_DISAMBIGUATION } from '@/content/siteSeo';
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
    alternateName: [
      'Stock Track PRO van fleet software',
      'Stock Track PRO DVSA compliance software',
    ],
    url: SITE_URL,
    description: `${SITE_SHORT_DESCRIPTION} ${SITE_BRAND_DISAMBIGUATION}`,
    knowsAbout: SITE_KNOWS_ABOUT,
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
      areaServed: 'GB',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
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
        alternateName: 'Stock Track PRO — UK van fleet compliance (not inventory software)',
        url: SITE_URL,
        description: SITE_TAGLINE,
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
