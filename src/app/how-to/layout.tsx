import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How it works | Stock Track PRO',
  description: 'How to get started with Stock Track PRO: set up your company, add assets and vehicles, and manage your team.',
  openGraph: {
    title: 'How it works | Stock Track PRO',
    description: 'How to get started with Stock Track PRO.',
    url: '/how-to',
  },
};

export default function HowToLayout({ children }: { children: React.ReactNode }) {
  return children;
}
