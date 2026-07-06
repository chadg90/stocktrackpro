import type { Metadata } from 'next';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Stock Track PRO — UK van fleet management and defect reporting software. Sales and support for commercial van operators.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Stock Track PRO',
    description: 'Get in touch with Stock Track PRO for demos, billing, and van fleet compliance support.',
    url: 'https://www.stocktrackpro.co.uk/contact/',
    siteName: 'Stock Track PRO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Contact Stock Track PRO' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Stock Track PRO',
    description: 'Contact Stock Track PRO for UK van fleet software support and enquiries.',
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
        title="Contact"
        description="Contact Stock Track PRO for UK van fleet management software support, demos, and billing enquiries."
      />
      {children}
    </>
  );
}
