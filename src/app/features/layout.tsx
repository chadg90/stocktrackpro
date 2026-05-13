import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Fleet inspection software UK fleets use daily: vehicle defect reporting app workflows, MOT tracking, manager dashboards, and O-licence-ready audit trails — Stock Track PRO.',
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Features | Stock Track PRO',
    description:
      'Inspections, defects, MOT and tax alerts, and manager analytics — national UK fleet compliance software for vans and HGVs.',
    url: 'https://www.stocktrackpro.co.uk/features',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features | Stock Track PRO',
    description:
      'Fleet inspection software UK operators rely on — defects, renewals, and audit-ready records in one platform.',
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
