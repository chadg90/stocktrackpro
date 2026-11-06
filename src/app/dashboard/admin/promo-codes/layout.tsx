import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Promo Codes | Fleet Track PRO' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
