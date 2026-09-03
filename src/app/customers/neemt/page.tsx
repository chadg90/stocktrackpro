import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomerCaseStudyPage from '@/components/CustomerCaseStudyPage';
import { getCustomerStory } from '@/content/customerStories';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'NEEMT Emergency Vehicle Fleet Case Study',
  description:
    'How NEEMT (North-East Emergency Medical Transport) uses Fleet Track PRO for pre-shift VDIs, service records, MOT and tax.',
  alternates: { canonical: canonicalPath('/customers/neemt') },
  openGraph: {
    title: 'NEEMT Emergency Vehicle Fleet Case Study | Fleet Track PRO',
    description:
      'See how NEEMT manages pre-shift VDIs, photos, service records, MOT and tax for its emergency vehicle fleet.',
    url: absolutePageUrl('/customers/neemt'),
    siteName: 'Fleet Track PRO',
    images: [
      {
        url: '/clients/neemt-response-car.jpg',
        width: 1200,
        height: 630,
        alt: 'NEEMT emergency response vehicle case study',
      },
    ],
    locale: 'en_GB',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEEMT Emergency Vehicle Fleet Case Study | Fleet Track PRO',
    description: 'Pre-shift VDIs and central vehicle records for an emergency medical transport fleet.',
    images: ['/clients/neemt-response-car.jpg'],
  },
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
