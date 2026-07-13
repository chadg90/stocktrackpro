import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Cookie policy for Fleet Track PRO — how we use cookies and similar technologies on our UK fleet management website.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy | Fleet Track PRO',
    description: 'Information about cookies used on www.fleettrackpro.co.uk.',
    url: 'https://www.fleettrackpro.co.uk/cookies',
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
