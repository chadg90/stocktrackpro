import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: {
    absolute: 'About Stock Track PRO | UK Van Fleet Compliance Software',
  },
  description:
    'Stock Track PRO is UK van fleet management software built for trades and contractors. Learn what we do, who we help, and how the platform works.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Stock Track PRO | UK Van Fleet Compliance Software',
    description:
      'Stock Track PRO is UK van fleet management software built for trades and contractors. Learn what we do, who we help, and how the platform works.',
    url: 'https://www.stocktrackpro.co.uk/about/',
    siteName: 'Stock Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'About Stock Track PRO' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Stock Track PRO | UK Van Fleet Compliance Software',
    description:
      'Stock Track PRO is UK van fleet management software built for trades and contractors. Learn what we do, who we help, and how the platform works.',
    images: ['/og-image.jpg'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/about"
        title="About Stock Track PRO"
        description="UK van fleet management software for trades and contractors — daily inspections, defect reporting, and MOT tracking."
      />
      {children}
    </>
  );
}
