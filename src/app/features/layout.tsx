import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fleet Management Features',
  description:
    'UK fleet inspection software for walkaround checks, vehicle defect reporting, MOT and tax tracking, manager dashboards and clear compliance records.',
  alternates: { canonical: canonicalPath('/features') },
  openGraph: {
    title: 'Fleet Management Features | Fleet Track PRO',
    description:
      'Daily vehicle inspections, defects, MOT and tax alerts, and manager analytics — UK fleet compliance software for commercial vehicles.',
    url: absolutePageUrl('/features'),
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO features' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Management Features | Fleet Track PRO',
    description:
      'Fleet inspection software UK operators rely on — defects, renewals, and audit-ready records in one platform.',
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
        description="Fleet inspection software for daily walkaround checks, defect reporting, MOT tracking, and manager dashboards."
      />
      {children}
    </>
  );
}
