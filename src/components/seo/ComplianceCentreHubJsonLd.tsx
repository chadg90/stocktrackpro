import { SITE_URL } from '@/lib/site';

/** BreadcrumbList for the Compliance Centre index page. */
export default function ComplianceCentreHubJsonLd() {
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
        item: `${SITE_URL}/compliance-centre`,
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
  );
}
