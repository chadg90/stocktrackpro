import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Stock Track PRO',
  description: 'Get in touch with Stock Track PRO. Sales, support, and inquiries for our asset and fleet management solution.',
  openGraph: {
    title: 'Contact | Stock Track PRO',
    description: 'Get in touch with Stock Track PRO for sales and support.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
