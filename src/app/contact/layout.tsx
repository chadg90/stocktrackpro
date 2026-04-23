import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Stock Track PRO for support or enquiries about fleet management.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Stock Track PRO',
    description: 'Contact us for support or enquiries. Fleet management for trades and contractors.',
    url: 'https://stocktrackpro.com/contact',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Stock Track PRO',
    description: 'Contact us for support or enquiries.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
