import { ORGANIZATION_ID, SITE_URL } from '@/lib/site';

const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

export function HomeJsonLd() {
  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Stock Track PRO',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Android, Web',
    description:
      'UK fleet management software for inspections, defect reporting, MOT tracking, and O-licence compliance.',
    url: SITE_URL,
    screenshot: `${SITE_URL}/website-image-stp.png`,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/pricing`,
      price: '8.00',
      priceCurrency: 'GBP',
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANIZATION_ID },
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '8.00',
        priceCurrency: 'GBP',
        unitText: 'vehicle per month',
        valueAddedTaxIncluded: true,
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
