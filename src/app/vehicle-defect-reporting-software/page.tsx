import type { Metadata } from 'next';
import CommercialFeaturePage from '@/components/CommercialFeaturePage';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

const path = '/vehicle-defect-reporting-software';
const title = 'Vehicle Defect Reporting Software for UK Fleets';
const description =
  'Report vehicle defects with photos, severity and timestamps, notify managers and track repair work through to recorded close-out.';

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

export default function VehicleDefectReportingSoftwarePage() {
  return (
    <CommercialFeaturePage
      path={path}
      eyebrow="Defect reporting and close-out"
      title={title}
      description={description}
      intro="Move vehicle defects out of group chats and spreadsheets. Fleet Track PRO keeps the report, notification, repair status and resolution together in one vehicle history."
      benefits={[
        {
          title: 'Clear reports at the source',
          description:
            'Drivers record the problem, severity, description and available photo evidence when the defect is identified.',
        },
        {
          title: 'Immediate manager visibility',
          description:
            'Managers are notified when a defect is raised, while the vehicle status makes outstanding maintenance visible across the fleet.',
        },
        {
          title: 'Close-out with accountability',
          description:
            'Track work through open, scheduled, waiting-for-parts and completed states, with recorded activity tied to the people involved.',
        },
      ]}
      workflowTitle="From reported defect to recorded resolution"
      workflow={[
        'A driver identifies and records a defect during an inspection, including its description and severity.',
        'The manager receives the defect information and the vehicle is shown as requiring attention.',
        'A manager or fitter using the manager role updates the job as it is scheduled, repaired or waiting for parts.',
        'The defect is resolved when the work is complete; the vehicle cannot return to active while another open defect remains.',
      ]}
      evidenceTitle="Keep the complete decision trail"
      evidence="A useful defect record should show what was reported, when it was seen, who assessed it and what happened before the vehicle returned to service. Fleet Track PRO keeps those operational records together, while responsibility for competent assessment and safe release remains with the business."
      related={[
        {
          href: '/compliance-centre/closing-defects-return-to-service',
          label: 'Closing defects before return to service',
        },
        {
          href: '/compliance-centre/van-fleet-defect-records',
          label: 'Vehicle defect records and DVSA readiness',
        },
        {
          href: '/vehicle-walkaround-check-app',
          label: 'Vehicle walkaround check app',
        },
        {
          href: '/features',
          label: 'Explore every Fleet Track PRO feature',
        },
      ]}
      faqs={[
        {
          question: 'Who is notified when a driver reports a defect?',
          answer:
            'Fleet Track PRO notifies managers and makes the defect visible in the fleet workflow so it can be reviewed and assigned appropriately.',
        },
        {
          question: 'Can a fitter update repair progress?',
          answer:
            'Yes. A fitter using the manager role can use My Jobs and update the defect through scheduled, waiting-for-parts and completed stages.',
        },
        {
          question: 'Does closing a defect automatically make the vehicle active?',
          answer:
            'The vehicle can return to active when the defect is resolved, but Fleet Track PRO prevents that automatic return if another open defect still exists.',
        },
      ]}
    />
  );
}
