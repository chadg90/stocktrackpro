import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Companies | Fleet Track PRO',
  },
};

export default function CompaniesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
