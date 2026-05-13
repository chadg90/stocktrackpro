import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Stock Track PRO — UK fleet management and defect reporting software. Sales and support for fleet operators.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Stock Track PRO',
    description: 'Get in touch with Stock Track PRO for demos, billing, and fleet compliance support.',
    url: 'https://www.stocktrackpro.co.uk/contact',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Stock Track PRO',
    description: 'Contact Stock Track PRO for UK fleet software support and enquiries.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
