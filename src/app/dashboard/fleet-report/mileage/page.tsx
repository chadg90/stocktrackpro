import { permanentRedirect } from 'next/navigation';

export default function FleetReportMileageRedirect() {
  permanentRedirect('/dashboard/mileage/');
}
