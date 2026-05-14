import { redirect } from 'next/navigation';

// Legacy route — "tickets" was renamed to "support". Redirect preserves any existing bookmarks.
export default function AdminTicketsRedirectPage() {
  redirect('/dashboard/support');
}
