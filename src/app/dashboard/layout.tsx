import type { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
  // absolute avoids root template appending "| Fleet Track PRO" twice
  title: {
    absolute: 'Manager Dashboard Login | Fleet Track PRO',
  },
  description:
    'Sign in to the Fleet Track PRO manager dashboard to manage vehicles, inspections, defects, team access, and billing.',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: '/dashboard',
  },
  openGraph: {
    title: 'Manager Dashboard Login | Fleet Track PRO',
    description:
      'Sign in to the Fleet Track PRO manager dashboard for fleet inspections, defects, and compliance.',
    url: '/dashboard',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
