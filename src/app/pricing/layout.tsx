import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Stock Track PRO',
  description: 'Simple, transparent pricing for fleet and asset management. Subscribe with a card. 7-day free trial for new users.',
  openGraph: {
    title: 'Pricing | Stock Track PRO',
    description: 'Simple, transparent pricing for fleet and asset management.',
    url: '/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
