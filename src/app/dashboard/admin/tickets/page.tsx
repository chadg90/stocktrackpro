import { redirect } from 'next/navigation';

export default function AdminTicketsRedirectPage() {
  redirect('/dashboard/support');
}
