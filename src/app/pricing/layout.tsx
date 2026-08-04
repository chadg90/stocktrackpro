import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    '£8 per vehicle per month, 2-vehicle minimum. 7-day free fleet trial on the web.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Fleet Track PRO',
    description:
      'Fleet from £8 per vehicle per month. 7-day free trial.',
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
      '£8 per vehicle per month — 7-day free fleet trial.',
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
        description="£8 per vehicle per month for UK fleet management. 7-day free trial."
      />
      {children}
    </>
  );
}
