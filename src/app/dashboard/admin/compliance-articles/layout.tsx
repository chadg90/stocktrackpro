import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Compliance articles | Fleet Track PRO' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
