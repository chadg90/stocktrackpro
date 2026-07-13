import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create your Fleet Track PRO company account — 7-day free trial for UK van fleet DVSA walkaround checks, defects, and MOT tracking.',
  alternates: { canonical: '/onboarding' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Sign up | Fleet Track PRO',
    description: 'Start your 7-day free trial and invite your team to Fleet Track PRO.',
    url: 'https://www.fleettrackpro.co.uk/onboarding',
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
