import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import FirebaseClientProvider from '@/components/FirebaseClientProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function InviteLayout({ children }: { children: ReactNode }) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
