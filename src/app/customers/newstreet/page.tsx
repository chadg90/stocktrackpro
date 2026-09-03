import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomerCaseStudyPage from '@/components/CustomerCaseStudyPage';
import { getCustomerStory } from '@/content/customerStories';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Newstreet Groundworks Fleet Case Study',
  description:
    'How Newstreet Groundwork Services, County Durham, uses Fleet Track PRO across a 35-vehicle fleet for defects, MOT and tax.',
  alternates: { canonical: canonicalPath('/customers/newstreet') },
  openGraph: {
    title: 'Newstreet Groundworks Fleet Case Study | Fleet Track PRO',
    description:
      'See how a County Durham groundworks business manages checks, defects, MOT and tax across a 35-vehicle fleet.',
    url: absolutePageUrl('/customers/newstreet'),
    siteName: 'Fleet Track PRO',
    images: [
      {
        url: '/fleet-operations.jpg',
        width: 1200,
        height: 630,
        alt: 'Newstreet Groundworks fleet case study',
      },
    ],
    locale: 'en_GB',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Newstreet Groundworks Fleet Case Study | Fleet Track PRO',
    description: 'A 35-vehicle groundworks fleet using digital checks, defect workflow and renewal monitoring.',
    images: ['/fleet-operations.jpg'],
  },
};

export default function NewstreetCaseStudyPage() {
  const story = getCustomerStory('newstreet');
  if (!story) notFound();

  return (
    <CustomerCaseStudyPage
      story={story}
      heroImageSrc="/fleet-operations.jpg"
      heroImageAlt="Groundworks and commercial fleet vehicles on site"
    />
  );
}
