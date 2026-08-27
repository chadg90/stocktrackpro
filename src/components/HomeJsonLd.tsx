import { SITE_SHORT_DESCRIPTION, SOFTWARE_FEATURE_LIST } from '@/content/siteSeo';
import { ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/lib/site';

const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

export function HomeJsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'Fleet Track PRO',
        alternateName: [
          'Fleet Track PRO fleet compliance software',
          'Stock Track PRO', // former product name — kept for search continuity
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
        url: SITE_URL,
        screenshot: `${SITE_URL}/demo/01-login.png`,
        inLanguage: 'en-GB',
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/pricing`,
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
        isPartOf: { '@id': WEBSITE_ID },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
  );
}
