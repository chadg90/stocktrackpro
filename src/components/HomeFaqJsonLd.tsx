import { HOME_FAQ_ITEMS, type HomeFaqItem } from '@/content/homeFaq';
import { absolutePageUrl } from '@/lib/site';

interface HomeFaqJsonLdProps {
  items?: HomeFaqItem[];
  /** Canonical page that owns this FAQ block (defaults to homepage). */
  path?: string;
}

export function HomeFaqJsonLd({ items, path = '/' }: HomeFaqJsonLdProps = {}) {
  const pageUrl = absolutePageUrl(path);
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: (items ?? HOME_FAQ_ITEMS).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
  );
}
