import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Compliance Centre',
  description:
    'UK van fleet compliance articles — defect records, digital vehicle inspections, MOT tracking, and plant machinery guidance for commercial operators.',
  alternates: { canonical: '/compliance-centre' },
  openGraph: {
    title: 'Compliance Centre | Fleet Track PRO',
    description:
      'Articles on van fleet defect records, digital vehicle inspections, MOT tracking, and plant machinery compliance for UK operators.',
    url: 'https://www.fleettrackpro.co.uk/compliance-centre/',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO Compliance Centre' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compliance Centre | Fleet Track PRO',
    description:
      'Articles on van fleet defect records, digital vehicle inspections, MOT tracking, and plant machinery compliance for UK operators.',
    images: ['/og-image.jpg'],
  },
};

export default function ComplianceCentreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/compliance-centre"
        title="Compliance Centre"
        description="UK van fleet compliance guidance — defect records, digital inspections, MOT tracking, and plant machinery records."
      />
      {children}
    </>
  );
}
