import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fleet Software Sales and Support',
  description:
    'Contact Fleet Track PRO for UK fleet software sales, onboarding and support with inspections, defects, MOT monitoring or billing.',
  alternates: { canonical: canonicalPath('/contact') },
  openGraph: {
    title: 'Fleet Software Sales and Support | Fleet Track PRO',
    description: 'Contact our UK team about fleet software, onboarding, inspections, defects, MOT monitoring or billing.',
    url: absolutePageUrl('/contact'),
    siteName: 'Fleet Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Contact Fleet Track PRO' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Software Sales and Support | Fleet Track PRO',
    description: 'Contact Fleet Track PRO for UK fleet software support and enquiries.',
    images: ['/og-image.jpg'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingWebPageJsonLd
        path="/contact"
        title="Fleet Software Sales and Support"
        description="Contact Fleet Track PRO for UK fleet management software support, demos, and billing enquiries."
      />
      {children}
    </>
  );
}
