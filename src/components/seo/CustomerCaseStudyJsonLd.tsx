import type { CustomerStory } from '@/content/customerStories';
import {
  ORGANIZATION_ID,
  SITE_URL,
  WEBSITE_ID,
  absolutePageUrl,
} from '@/lib/site';

type Props = {
  story: CustomerStory;
  heroImageSrc: string;
};

export default function CustomerCaseStudyJsonLd({ story, heroImageSrc }: Props) {
  const pageUrl = absolutePageUrl(`/customers/${story.slug}`);
  const imageUrl = heroImageSrc.startsWith('http')
    ? heroImageSrc
    : `${SITE_URL}${heroImageSrc}`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      '@id': `${pageUrl}#case-study`,
      headline: `${story.shortName} customer case study`,
      description: story.summary,
      articleSection: 'Customer case study',
      image: imageUrl,
      inLanguage: 'en-GB',
      mainEntityOfPage: { '@id': pageUrl },
      isPartOf: { '@id': WEBSITE_ID },
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      about: {
        '@type': 'Organization',
        name: story.company,
        location: {
          '@type': 'Place',
          name: story.location,
        },
      },
      mentions: {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'Fleet Track PRO',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: absolutePageUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Customer stories',
          item: `${absolutePageUrl('/')}#customer-stories`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: story.shortName,
          item: pageUrl,
        },
      ],
    },
  ];

  if (story.quote) {
    graph.push({
      '@type': 'Quotation',
      '@id': `${pageUrl}#customer-quotation`,
      text: story.quote,
      creator: {
        '@type': 'Organization',
        name: story.quoteName || story.company,
      },
      isPartOf: { '@id': `${pageUrl}#case-study` },
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      }}
    />
  );
}
