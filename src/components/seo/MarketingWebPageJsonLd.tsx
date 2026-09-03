import { ORGANIZATION_ID, absolutePageUrl, WEBSITE_ID } from '@/lib/site';

type Props = {
  path: string;
  title: string;
  description: string;
};

/** WebPage JSON-LD for marketing routes (Google + AI page understanding). */
export default function MarketingWebPageJsonLd({ path, title, description }: Props) {
  const pageUrl = absolutePageUrl(path);

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: 'en-GB',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
  );
}
