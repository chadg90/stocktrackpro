import { ORGANIZATION_ID, SITE_URL } from '@/lib/site';

const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

export function HomeJsonLd() {
  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Stock Track PRO',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    description:
      'UK fleet management and defect reporting software for SMEs — inspections, MOT and tax alerts, O-licence-ready audit trails.',
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/pricing`,
      price: '8',
      priceCurrency: 'GBP',
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANIZATION_ID },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '8',
        priceCurrency: 'GBP',
        unitText: 'per vehicle per month',
      },
    },
    provider: { '@id': ORGANIZATION_ID },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }}
    />
  );
}
