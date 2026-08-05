import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomerCaseStudyPage from '@/components/CustomerCaseStudyPage';
import { getCustomerStory } from '@/content/customerStories';

export const metadata: Metadata = {
  title: 'NEEMT Case Study',
  description:
    'How NEEMT (North-East Emergency Medical Transport) uses Fleet Track PRO for pre-shift VDIs, insurance, services, MOT and tax.',
  alternates: { canonical: '/customers/neemt' },
};

export default function NeemtCaseStudyPage() {
  const story = getCustomerStory('neemt');
  if (!story) notFound();

  return (
    <CustomerCaseStudyPage
      story={story}
      heroImageSrc="/clients/neemt-response-car.jpg"
      heroImageAlt="UK ambulance response car with blue lights at dusk"
    />
  );
}
