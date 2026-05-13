import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Common questions about Stock Track PRO — O-licence records, unlimited users, UK-wide coverage, vehicles supported, and contracts.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | Stock Track PRO',
    description:
      'Answers on O-licence compliance software use, users, fleet types, UK coverage, and cancellation.',
    url: 'https://www.stocktrackpro.co.uk/faq',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | Stock Track PRO',
    description: 'Stock Track PRO frequently asked questions for UK fleet operators.',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
