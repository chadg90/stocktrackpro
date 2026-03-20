import { redirect } from 'next/navigation';

/** Access codes are retired; team invites are used instead. */
export default function AccessCodesPage() {
  redirect('/dashboard/team');
}
