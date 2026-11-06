import type { Metadata } from 'next';
import { absolutePageUrl, canonicalPath } from '@/lib/site';
import { LEGAL_OG_IMAGES, LEGAL_TWITTER_IMAGES } from '@/lib/seo/legalOgImage';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Terms and conditions for using Fleet Track PRO websites, dashboard, and companion apps — UK fleet management software.',
  alternates: { canonical: canonicalPath('/terms') },
  openGraph: {
    title: 'Terms and Conditions | Fleet Track PRO',
    description: 'Legal terms governing use of Fleet Track PRO services.',
    url: absolutePageUrl('/terms'),
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
    images: [...LEGAL_OG_IMAGES],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions | Fleet Track PRO',
    images: [...LEGAL_TWITTER_IMAGES],
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
