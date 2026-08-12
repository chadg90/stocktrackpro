import { redirect } from 'next/navigation';

export default async function DisabledLocationsRoute() {
  redirect('/dashboard/fleet');
}
