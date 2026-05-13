import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for Stock Track PRO — how we collect, use, and protect personal data for UK fleet management customers.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | Stock Track PRO',
    description: 'How Stock Track PRO handles personal data, cookies, and security for fleet operators.',
    url: 'https://www.stocktrackpro.co.uk/privacy',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
