import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomerCaseStudyPage from '@/components/CustomerCaseStudyPage';
import { getCustomerStory } from '@/content/customerStories';

export const metadata: Metadata = {
  title: 'Newstreet Groundworks Case Study',
  description:
    'How Newstreet Groundwork Services, County Durham, uses Fleet Track PRO across a 25-vehicle fleet for defects, MOT and tax.',
  alternates: { canonical: '/customers/newstreet' },
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
