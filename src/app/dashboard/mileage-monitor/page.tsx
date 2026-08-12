import { redirect } from 'next/navigation';

export default function MileageMonitorRedirect() {
  redirect('/dashboard/fleet-report/mileage');
}
