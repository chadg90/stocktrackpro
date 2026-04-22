import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Stock Track PRO pricing — £8 per vehicle per month or £84 per vehicle per year. All features included. Start a 7-day free trial and subscribe on the web.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Stock Track PRO',
    description: 'View plans and pricing. Starter, Team, Business and Enterprise. Free trial available.',
    url: 'https://stocktrackpro.com/pricing',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | Stock Track PRO',
    description: 'View plans and pricing. Starter, Team, Business and Enterprise. Free trial available.',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
