import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Terms and conditions for using Stock Track PRO websites, dashboard, and companion apps — UK fleet management software.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms and Conditions | Stock Track PRO',
    description: 'Legal terms governing use of Stock Track PRO services.',
    url: 'https://www.stocktrackpro.co.uk/terms',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
