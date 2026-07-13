import { SITE_KNOWS_ABOUT, SITE_SHORT_DESCRIPTION, SITE_TAGLINE, SITE_BRAND_DISAMBIGUATION } from '@/content/siteSeo';
import { getOrganizationSameAs, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/lib/site';
import { SITE_LEGAL_NAME, SITE_NAME, SUPPORT_EMAIL } from '@/lib/brand';

/**
 * Organization + WebSite graph for every page (Google + AI entity consolidation).
 */
export default function SiteWideJsonLd() {
  const sameAs = getOrganizationSameAs();

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_LEGAL_NAME,
    alternateName: [
      `${SITE_NAME} van fleet software`,
      `${SITE_NAME} DVSA compliance software`,
      'Stock Track PRO',
      'Stock Track PRO Ltd',
    ],
    url: SITE_URL,
    description: `${SITE_SHORT_DESCRIPTION} ${SITE_BRAND_DISAMBIGUATION}`,
    knowsAbout: SITE_KNOWS_ABOUT,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    email: SUPPORT_EMAIL,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
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
        name: SITE_NAME,
        alternateName: `${SITE_NAME} — UK van fleet compliance (not inventory software)`,
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
