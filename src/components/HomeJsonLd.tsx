import {
  HOME_HERO_POSTER_SRC,
  HOME_HERO_VIDEO_DESCRIPTION,
  HOME_HERO_VIDEO_SRC,
} from '@/content/homeHero';
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
        name: 'Stock Track PRO',
        alternateName: 'Stock Track PRO van fleet compliance software',
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Van fleet management and DVSA compliance software',
        operatingSystem: 'iOS, Android, Web',
        description: SITE_SHORT_DESCRIPTION,
        featureList: SOFTWARE_FEATURE_LIST,
        keywords:
          'van fleet compliance, DVSA walkaround checks, vehicle defect reporting, MOT tracking, fleet management UK',
        url: SITE_URL,
        screenshot: `${SITE_URL}/hero-demo-poster.jpg`,
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
            minValue: 5,
            unitText: 'vehicles',
          },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '8.00',
            priceCurrency: 'GBP',
            unitText: 'vehicle per month',
            valueAddedTaxIncluded: true,
          },
        },
        provider: { '@id': ORGANIZATION_ID },
        isPartOf: { '@id': WEBSITE_ID },
      },
      {
        '@type': 'VideoObject',
        '@id': `${SITE_URL}/#hero-video`,
        name: 'Stock Track PRO mobile app demonstration',
        description: HOME_HERO_VIDEO_DESCRIPTION,
        thumbnailUrl: `${SITE_URL}${HOME_HERO_POSTER_SRC}`,
        contentUrl: `${SITE_URL}${HOME_HERO_VIDEO_SRC}`,
        uploadDate: '2026-07-06',
        inLanguage: 'en-GB',
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
  );
}
