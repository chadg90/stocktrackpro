import { redirect } from 'next/navigation';

export default async function DisabledAssetsRoute() {
  redirect('/dashboard/fleet');
}
