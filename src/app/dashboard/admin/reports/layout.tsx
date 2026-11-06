import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Admin Reports | Fleet Track PRO' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
