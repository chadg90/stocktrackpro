import {
  SITE_BRAND_DISAMBIGUATION,
  SITE_KNOWS_ABOUT,
  SITE_SHORT_DESCRIPTION,
  SITE_TAGLINE,
  SOFTWARE_FEATURE_LIST,
} from '@/content/siteSeo';
import {
  EDITORIAL_TEAM_ID,
  EDITORIAL_TEAM_NAME,
  SITE_LEGAL_NAME,
  SITE_NAME,
  SUPPORT_EMAIL,
} from '@/lib/brand';
import { getOrganizationSameAs, ORGANIZATION_ID, SITE_URL, WEBSITE_ID, absolutePageUrl } from '@/lib/site';

const SOFTWARE_ID = `${SITE_URL}/#software`;
const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

/**
 * Organization + WebSite + SoftwareApplication graph for every page
 * (Google + AI entity consolidation).
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

  const softwareApplication = {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: SITE_NAME,
    alternateName: [
      `${SITE_NAME} fleet compliance software`,
      'Stock Track PRO',
    ],
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Fleet management and DVSA compliance software',
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'UK commercial vehicle fleet operators and transport managers',
    },
    operatingSystem: 'iOS, Android, Web',
    description: SITE_SHORT_DESCRIPTION,
    featureList: SOFTWARE_FEATURE_LIST,
    keywords:
      'fleet compliance, DVSA walkaround checks, vehicle defect reporting, MOT tracking, fleet management UK',
    url: homeUrl,
    screenshot: `${SITE_URL}/demo/01-login.png`,
    inLanguage: 'en-GB',
    offers: {
      '@type': 'Offer',
      url: absolutePageUrl('/pricing'),
      price: '8.00',
      priceCurrency: 'GBP',
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANIZATION_ID },
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        minValue: 2,
        unitText: 'vehicles',
      },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '8.00',
        priceCurrency: 'GBP',
        unitText: 'vehicle per month',
        valueAddedTaxIncluded: false,
      },
    },
    provider: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };

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
        about: { '@id': SOFTWARE_ID },
      },
      softwareApplication,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
