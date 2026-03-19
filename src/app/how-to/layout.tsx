import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How it works | Stock Track PRO',
  description: 'How to get started with Stock Track PRO: sign up on the website, invite your team, and run assets and fleet operations in the companion app.',
  openGraph: {
    title: 'How it works | Stock Track PRO',
    description: 'Website-led onboarding, team invites, and companion app workflow.',
    url: '/how-to',
  },
};

export default function HowToLayout({ children }: { children: React.ReactNode }) {
  return children;
}
