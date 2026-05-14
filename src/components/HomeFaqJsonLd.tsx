import { HOME_FAQ_ITEMS, type HomeFaqItem } from '@/content/homeFaq';

interface HomeFaqJsonLdProps {
  items?: HomeFaqItem[];
}

export function HomeFaqJsonLd({ items }: HomeFaqJsonLdProps = {}) {
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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
