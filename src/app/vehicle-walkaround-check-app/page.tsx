import type { Metadata } from 'next';
import CommercialFeaturePage from '@/components/CommercialFeaturePage';
import { getCommercialFeatureFaqs } from '@/content/commercialFeatureFaqs';
import { absolutePageUrl, canonicalPath } from '@/lib/site';
import { PLATFORM_AVAILABILITY } from '@/lib/brand';

export const dynamic = 'force-static';
export const revalidate = 3600;

const path = '/vehicle-walkaround-check-app';
/** H1 / on-page copy — keep stable; SEO title/description are separate. */
const title = 'Vehicle Walkaround Check App for UK Fleets';
const description =
  `Run structured vehicle walkaround checks — ${PLATFORM_AVAILABILITY} — with required photos, named drivers, timestamps and immediate defect reporting.`;
const seoTitle = 'Walkaround Check App for UK Fleets: Free Trial';
const seoDescription =
  'Walkaround check app for UK fleets. Drivers complete structured vehicle checks with required photos, timestamps and defect reporting. Start a free trial.';

export const metadata: Metadata = {
  title: { absolute: seoTitle },
  description: seoDescription,
  alternates: { canonical: canonicalPath(path) },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: absolutePageUrl(path),
    type: 'website',
    locale: 'en_GB',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
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
      intro="Our vehicle walkaround check app replaces paper inspection sheets with a consistent mobile process for daily vehicle checks — recording who inspected the vehicle, when it happened, what they checked and the photos they supplied."
      benefits={[
        {
          title: 'A consistent daily process',
          description:
            `Drivers follow the same structured inspection flow — ${PLATFORM_AVAILABILITY} — helping managers avoid incomplete or inconsistent paper forms.`,
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
          href: '/compliance-centre/paper-vs-digital-inspection-sheets/',
          label: 'Paper vs digital vehicle inspection sheets',
        },
        {
          href: '/compliance-centre/pre-use-checks-company-vehicles/',
          label: 'Pre-use checks for company vehicles',
        },
        {
          href: '/vehicle-defect-reporting-software/',
          label: 'Vehicle defect reporting software',
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
