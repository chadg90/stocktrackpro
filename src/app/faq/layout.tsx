import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Common questions about Fleet Track PRO — van fleet compliance, user allowances, UK-wide coverage, vehicles supported, and contracts.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | Fleet Track PRO',
    description:
      'Answers on van fleet compliance software use, user allowances, fleet types, UK coverage, and cancellation.',
    url: 'https://www.fleettrackpro.co.uk/faq/',
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO FAQ' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Fleet Track PRO',
    description: 'Fleet Track PRO frequently asked questions for UK van fleet operators.',
    images: ['/og-image.jpg'],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/faq"
        title="FAQ"
        description="Frequently asked questions about Fleet Track PRO van fleet management software, pricing, and setup."
      />
      {children}
    </>
  );
}
