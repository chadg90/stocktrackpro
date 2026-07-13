import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    '£8 per vehicle per month (VAT included), 5-vehicle minimum. Optional Plant & Machinery from £12 per machine per month (3-machine minimum). 7-day free fleet trial on the web.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Fleet Track PRO',
    description:
      'Fleet from £8 per vehicle per month. Optional Plant & Machinery from £12 per machine. 7-day free trial.',
    url: 'https://www.fleettrackpro.co.uk/pricing/',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO pricing' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Fleet Track PRO',
    description:
      '£8 per vehicle per month, plus optional Plant & Machinery from £12 per machine — 7-day free fleet trial.',
    images: ['/og-image.jpg'],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/pricing"
        title="Pricing"
        description="£8 per vehicle per month for UK van fleet management, plus optional Plant & Machinery from £12 per machine per month."
      />
      {children}
    </>
  );
}
