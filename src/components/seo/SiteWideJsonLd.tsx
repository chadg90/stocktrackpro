import { SITE_KNOWS_ABOUT, SITE_SHORT_DESCRIPTION, SITE_TAGLINE, SITE_BRAND_DISAMBIGUATION } from '@/content/siteSeo';
import { getOrganizationSameAs, ORGANIZATION_ID, SITE_URL, WEBSITE_ID, absolutePageUrl } from '@/lib/site';
import {
  EDITORIAL_TEAM_ID,
  EDITORIAL_TEAM_NAME,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SUPPORT_EMAIL,
} from '@/lib/brand';

/**
 * Organization + WebSite graph for every page (Google + AI entity consolidation).
 */
export default function SiteWideJsonLd() {
  const sameAs = getOrganizationSameAs();
  const homeUrl = absolutePageUrl('/');

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_LEGAL_NAME,
    alternateName: [
      `${SITE_NAME} fleet software`,
      `${SITE_NAME} DVSA compliance software`,
      'Stock Track PRO',
    ],
    url: homeUrl,
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
    department: {
      '@type': 'Organization',
      '@id': EDITORIAL_TEAM_ID,
      name: EDITORIAL_TEAM_NAME,
      url: `${absolutePageUrl('/about')}#editorial-team`,
      parentOrganization: { '@id': ORGANIZATION_ID },
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
        alternateName: `${SITE_NAME} — UK fleet compliance software`,
        url: homeUrl,
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
