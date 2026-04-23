import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Stock Track PRO features: fleet management, vehicle inspections, defect workflow, MOT and tax monitoring, and team management.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Features | Stock Track PRO',
    description: 'Fleet management, inspections, defect workflow, MOT and tax monitoring, and team management for trades and contractors.',
    url: 'https://stocktrackpro.com/features',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features | Stock Track PRO',
    description: 'Fleet management, inspections, defect workflow, and team management.',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
