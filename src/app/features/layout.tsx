import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features | Stock Track PRO',
  description: 'QR tracking, vehicle inspections, defect workflow, fleet and asset management. Built for trades and contractors.',
  openGraph: {
    title: 'Features | Stock Track PRO',
    description: 'QR tracking, vehicle inspections, fleet and asset management.',
    url: '/features',
  },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
