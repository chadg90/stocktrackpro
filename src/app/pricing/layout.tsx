import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    '£8 per vehicle per month (VAT included), with a 5-vehicle minimum. Van fleet inspections, defect workflow, MOT tracking — start a 7-day free trial on the web.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Stock Track PRO',
    description:
      'Simple per-vehicle pricing for UK van fleet compliance software — inspections, defects, MOT and tax alerts. 7-day free trial.',
    url: 'https://www.stocktrackpro.co.uk/pricing/',
    siteName: 'Stock Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Stock Track PRO pricing' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Stock Track PRO',
    description: '£8 per vehicle per month — van fleet inspection software UK operators can trial free for 7 days.',
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
        description="£8 per vehicle per month for UK van fleet management — inspections, defects, MOT tracking, and unlimited team members."
      />
      {children}
    </>
  );
}
