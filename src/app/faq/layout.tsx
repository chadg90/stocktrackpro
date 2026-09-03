import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fleet Management Software FAQs',
  description:
    'Answers about Fleet Track PRO pricing, setup, walkaround checks, defect reporting, MOT and tax reminders, mobile apps and cancellation.',
  alternates: { canonical: canonicalPath('/faq') },
  openGraph: {
    title: 'Fleet Management Software FAQs | Fleet Track PRO',
    description:
      'Answers about fleet software pricing, setup, walkaround checks, defects, MOT and tax reminders, mobile apps and cancellation.',
    url: absolutePageUrl('/faq'),
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO FAQ' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Management Software FAQs | Fleet Track PRO',
    description: 'Fleet Track PRO frequently asked questions for UK fleet operators.',
    images: ['/og-image.jpg'],
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/faq"
        title="Fleet Management Software FAQs"
        description="Frequently asked questions about Fleet Track PRO pricing, setup, vehicle checks, defects, MOT reminders and mobile apps."
      />
      {children}
    </>
  );
}
