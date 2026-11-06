import type { Metadata } from 'next';
import CommercialFeaturePage from '@/components/CommercialFeaturePage';
import { getCommercialFeatureFaqs } from '@/content/commercialFeatureFaqs';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

const path = '/vehicle-defect-reporting-software';
/** Visible H1 — unchanged for on-page copy. */
const title = 'Vehicle Defect Reporting Software for UK Fleets';
/** <title> segment (≤42 chars) so template stays ≤60 with brand suffix. */
const documentTitle = 'Vehicle Defect Reporting Software';
const description =
  'Report vehicle defects with photos, severity and timestamps, notify managers and track repair work through to recorded close-out.';

export const metadata: Metadata = {
  title: documentTitle,
  description,
  alternates: { canonical: canonicalPath(path) },
  openGraph: {
    title: `${documentTitle} | Fleet Track PRO`,
    description,
    url: absolutePageUrl(path),
    type: 'website',
    locale: 'en_GB',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${documentTitle} | Fleet Track PRO`,
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
          href: '/compliance-centre/closing-defects-return-to-service/',
          label: 'Closing defects before return to service',
        },
        {
          href: '/compliance-centre/van-fleet-defect-records/',
          label: 'Vehicle defect records and DVSA readiness',
        },
        {
          href: '/vehicle-walkaround-check-app/',
          label: 'Vehicle walkaround check app',
        },
        {
          href: '/features/',
          label: 'Explore every Fleet Track PRO feature',
        },
      ]}
      faqs={getCommercialFeatureFaqs()}
    />
  );
}
