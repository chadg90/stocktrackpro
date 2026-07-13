import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Terms and conditions for using Fleet Track PRO websites, dashboard, and companion apps — UK fleet management software.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms and Conditions | Fleet Track PRO',
    description: 'Legal terms governing use of Fleet Track PRO services.',
    url: 'https://www.fleettrackpro.co.uk/terms',
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
