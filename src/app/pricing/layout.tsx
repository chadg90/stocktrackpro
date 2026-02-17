import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'View Stock Track PRO plans and pricing. Starter, Team, Business and Enterprise tiers. Start a free trial or subscribe on web or in the app.',
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
