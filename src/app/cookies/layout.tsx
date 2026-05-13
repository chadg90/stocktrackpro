import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Cookie policy for Stock Track PRO — how we use cookies and similar technologies on our UK fleet management website.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy | Stock Track PRO',
    description: 'Information about cookies used on stocktrackpro.co.uk.',
    url: 'https://www.stocktrackpro.co.uk/cookies',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
