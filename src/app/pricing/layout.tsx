import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    '£8 per vehicle per month (VAT included). Unlimited driver and manager accounts, full defects workflow, MOT tracking — start a 7-day free trial on the web.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Stock Track PRO',
    description:
      'Simple per-vehicle pricing for UK fleet compliance software — inspections, defects, MOT and tax alerts. 7-day free trial.',
    url: 'https://www.stocktrackpro.co.uk/pricing',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Stock Track PRO',
    description: '£8 per vehicle per month — fleet inspection software UK operators can trial free for 7 days.',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
