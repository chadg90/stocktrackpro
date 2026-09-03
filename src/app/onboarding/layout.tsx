import type { Metadata } from 'next';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create your Fleet Track PRO company account — 14-day free trial for UK fleet DVSA walkaround checks, defects, and MOT tracking.',
  alternates: { canonical: canonicalPath('/onboarding') },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Sign up | Fleet Track PRO',
    description: 'Start your 14-day free trial and invite your team to Fleet Track PRO.',
    url: absolutePageUrl('/onboarding'),
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
