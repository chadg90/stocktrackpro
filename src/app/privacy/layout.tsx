import type { Metadata } from 'next';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for Fleet Track PRO — how we collect, use, and protect personal data for UK fleet management customers.',
  alternates: { canonical: canonicalPath('/privacy') },
  openGraph: {
    title: 'Privacy Policy | Fleet Track PRO',
    description: 'How Fleet Track PRO handles personal data, cookies, and security for fleet operators.',
    url: absolutePageUrl('/privacy'),
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
