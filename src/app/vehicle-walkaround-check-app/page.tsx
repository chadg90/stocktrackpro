import type { Metadata } from 'next';
import CommercialFeaturePage from '@/components/CommercialFeaturePage';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

const path = '/vehicle-walkaround-check-app';
const title = 'Vehicle Walkaround Check App for UK Fleets';
const description =
  'Run structured vehicle walkaround checks from iOS or Android with required photos, named drivers, timestamps and immediate defect reporting.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: canonicalPath(path) },
  openGraph: {
    title: `${title} | Fleet Track PRO`,
    description,
    url: absolutePageUrl(path),
    type: 'website',
    locale: 'en_GB',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | Fleet Track PRO`,
    description,
    images: ['/og-image.jpg'],
  },
};

export default function VehicleWalkaroundCheckAppPage() {
  return (
    <CommercialFeaturePage
      path={path}
      eyebrow="Digital vehicle inspections"
      title={title}
      description={description}
      intro="Replace paper inspection sheets with a consistent mobile check that records who inspected the vehicle, when it happened, what they checked and the photos they supplied."
      benefits={[
        {
          title: 'A consistent daily process',
          description:
            'Drivers follow the same structured inspection flow on iOS or Android, helping managers avoid incomplete or inconsistent paper forms.',
        },
        {
          title: 'Six required photos',
          description:
            'The walkaround captures the front, rear, both sides, interior and odometer so each submission contains useful visual evidence.',
        },
        {
          title: 'Named and timestamped',
          description:
            'Every completed check is linked to the user and time of submission, creating a searchable inspection history for each vehicle.',
        },
      ]}
      workflowTitle="How a digital walkaround check works"
      workflow={[
        'The driver opens the assigned vehicle in the Fleet Track PRO mobile app before use.',
        'They complete the structured checklist and supply each required walkaround and odometer photo.',
        'Any problem is described and reported as a defect during the inspection.',
        'The manager can review the completed check, photos, mileage and any resulting defect workflow.',
      ]}
      evidenceTitle="Better records than loose paper sheets"
      evidence="Digital checks make records easier to retrieve by vehicle, driver and date. They support a consistent roadworthiness process but do not replace driver training, competent defect assessment or the operator’s legal responsibilities."
      related={[
        {
          href: '/compliance-centre/paper-vs-digital-inspection-sheets',
          label: 'Paper vs digital vehicle inspection sheets',
        },
        {
          href: '/compliance-centre/pre-use-checks-company-vehicles',
          label: 'Pre-use checks for company vehicles',
        },
        {
          href: '/vehicle-defect-reporting-software',
          label: 'Vehicle defect reporting software',
        },
        {
          href: '/features',
          label: 'Explore every Fleet Track PRO feature',
        },
      ]}
      faqs={[
        {
          question: 'Can drivers complete checks from a mobile phone?',
          answer:
            'Yes. Drivers use the Fleet Track PRO app on iOS or Android to complete the checklist, take required photos and report defects.',
        },
        {
          question: 'Does the app prove that a vehicle is roadworthy?',
          answer:
            'No software can guarantee roadworthiness. The app creates a clearer record of the check and reported issues; the operator must still use trained people and act on defects appropriately.',
        },
        {
          question: 'Can managers view previous inspections?',
          answer:
            'Yes. Managers can review inspection and defect history from the web dashboard, including the vehicle, named user, time and recorded evidence.',
        },
      ]}
    />
  );
}
