import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create your Stock Track PRO company account — 7-day free trial for UK van fleet DVSA walkaround checks, defects, and MOT tracking.',
  alternates: { canonical: '/onboarding' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Sign up | Stock Track PRO',
    description: 'Start your 7-day free trial and invite your team to Stock Track PRO.',
    url: 'https://www.stocktrackpro.co.uk/onboarding',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
