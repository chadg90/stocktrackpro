import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Fleet Management Features',
  description:
    'Van fleet inspection software UK operators use daily: walkaround checks, vehicle defect reporting, MOT tracking, manager dashboards, and DVSA-ready records — Fleet Track PRO.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Fleet Management Features | Fleet Track PRO',
    description:
      'Daily van inspections, defects, MOT and tax alerts, and manager analytics — UK fleet compliance software for commercial vans.',
    url: 'https://www.fleettrackpro.co.uk/features/',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO features' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Management Features | Fleet Track PRO',
    description:
      'Van fleet inspection software UK operators rely on — defects, renewals, and audit-ready records in one platform.',
    images: ['/og-image.jpg'],
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/features"
        title="Fleet Management Features"
        description="Van fleet inspection software for daily walkaround checks, defect reporting, MOT tracking, and manager dashboards."
      />
      {children}
    </>
  );
}
