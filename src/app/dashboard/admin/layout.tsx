import type { Metadata } from 'next';
import AdminGate from './AdminGate';

export const metadata: Metadata = {
  title: {
    absolute: 'Admin home | Fleet Track PRO',
  },
};

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
