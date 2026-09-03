import type { Metadata } from 'next';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Cookie policy for Fleet Track PRO — how we use cookies and similar technologies on our UK fleet management website.',
  alternates: { canonical: canonicalPath('/cookies') },
  openGraph: {
    title: 'Cookie Policy | Fleet Track PRO',
    description: 'Information about cookies used on www.fleettrackpro.co.uk.',
    url: absolutePageUrl('/cookies'),
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
