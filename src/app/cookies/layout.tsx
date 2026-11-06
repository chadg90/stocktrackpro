import type { Metadata } from 'next';
import { absolutePageUrl, canonicalPath } from '@/lib/site';
import { LEGAL_OG_IMAGES, LEGAL_TWITTER_IMAGES } from '@/lib/seo/legalOgImage';

export const dynamic = 'force-static';
export const revalidate = 3600;

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
    images: [...LEGAL_OG_IMAGES],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | Fleet Track PRO',
    images: [...LEGAL_TWITTER_IMAGES],
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
