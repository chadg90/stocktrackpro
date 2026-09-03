import type { Metadata } from 'next';
import CommercialFeaturePage from '@/components/CommercialFeaturePage';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

const path = '/fleet-mot-tax-reminders';
const title = 'Fleet MOT and Tax Reminder Software';
const description =
  'Monitor fleet MOT dates and vehicle tax status using DVLA data, with dashboard visibility and advance reminders for managers.';

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

export default function FleetMotTaxRemindersPage() {
  return (
    <CommercialFeaturePage
      path={path}
      eyebrow="MOT and vehicle tax monitoring"
      title={title}
      description={description}
      intro="Keep MOT dates and tax status beside the rest of each vehicle’s fleet record. Managers can refresh DVLA information on demand and see approaching or expired items without maintaining a separate spreadsheet."
      benefits={[
        {
          title: 'DVLA-backed vehicle data',
          description:
            'Add a vehicle by registration and refresh its available MOT, tax and vehicle details from DVLA data when needed.',
        },
        {
          title: 'Fleet-wide visibility',
          description:
            'Managers can see renewal status alongside inspections, mileage and defects instead of checking separate files or calendars.',
        },
        {
          title: 'Advance manager reminders',
          description:
            'Seven-day MOT and tax warnings help managers identify approaching dates and plan the next action before expiry.',
        },
      ]}
      workflowTitle="How MOT and tax monitoring works"
      workflow={[
        'Add the vehicle by registration so its available DVLA details can populate the fleet record.',
        'Review MOT dates and tax status from the vehicle card or manager dashboard.',
        'Refresh an individual vehicle from DVLA data when you need the latest available status.',
        'Use the advance warning as a prompt to verify the position and arrange the required renewal or vehicle action.',
      ]}
      evidenceTitle="Reminders support the process — they do not replace checks"
      evidence="External data can be delayed or unavailable, so the registered keeper or operator remains responsible for checking the official MOT and tax position and acting before a vehicle is used. Fleet Track PRO provides operational visibility and reminders, not a legal guarantee."
      related={[
        {
          href: '/compliance-centre/mot-expiry-tracking-for-fleets',
          label: 'How to track MOT expiry dates across a fleet',
        },
        {
          href: '/vehicle-walkaround-check-app',
          label: 'Vehicle walkaround check app',
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
          question: 'Where does the MOT and tax information come from?',
          answer:
            'Fleet Track PRO uses available DVLA vehicle data and lets managers refresh an individual vehicle on demand.',
        },
        {
          question: 'When are managers warned about approaching dates?',
          answer:
            'The platform provides seven-day warnings for approaching MOT and tax dates so managers can review the vehicle before expiry.',
        },
        {
          question: 'Can Fleet Track PRO renew MOT or vehicle tax?',
          answer:
            'No. Fleet Track PRO monitors and displays available status information. The operator must arrange the MOT or complete the appropriate tax action through the official process.',
        },
      ]}
    />
  );
}
