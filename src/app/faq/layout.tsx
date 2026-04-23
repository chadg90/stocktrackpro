import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Stock Track PRO',
  description: 'Frequently asked questions about Stock Track PRO fleet management.',
  openGraph: {
    title: 'FAQ | Stock Track PRO',
    description: 'Frequently asked questions about Stock Track PRO.',
    url: '/faq',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
