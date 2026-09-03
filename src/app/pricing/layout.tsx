import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'UK Fleet Management Software Pricing',
  description:
    'Fleet management software from £8 per vehicle monthly or £84 annually. Minimum 2 vehicles, unlimited users and a 14-day free trial.',
  alternates: { canonical: canonicalPath('/pricing') },
  openGraph: {
    title: 'UK Fleet Management Software Pricing | Fleet Track PRO',
    description:
      'Fleet software from £8 per vehicle monthly, with unlimited users and a 14-day free trial.',
    url: absolutePageUrl('/pricing'),
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO pricing' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Fleet Management Software Pricing | Fleet Track PRO',
    description:
      '£8 per vehicle monthly, unlimited users and a 14-day free fleet trial.',
    images: ['/og-image.jpg'],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/pricing"
        title="UK Fleet Management Software Pricing"
        description="Fleet management software from £8 per vehicle monthly, with unlimited users and a 14-day free trial."
      />
      {children}
    </>
  );
}
