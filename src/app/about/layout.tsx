import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'About Stock Track PRO | UK Fleet Compliance Software',
  },
  description:
    'Stock Track PRO is UK fleet management software built for trades and contractors. Learn what we do, who we help, and how the platform works.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Stock Track PRO | UK Fleet Compliance Software',
    description:
      'Stock Track PRO is UK fleet management software built for trades and contractors. Learn what we do, who we help, and how the platform works.',
    url: 'https://www.stocktrackpro.co.uk/about',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
