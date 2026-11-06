import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Subscription | Fleet Track PRO',
  },
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
