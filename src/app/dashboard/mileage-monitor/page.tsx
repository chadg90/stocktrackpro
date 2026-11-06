import { permanentRedirect } from 'next/navigation';

export default function MileageMonitorRedirect() {
  permanentRedirect('/dashboard/mileage/');
}
