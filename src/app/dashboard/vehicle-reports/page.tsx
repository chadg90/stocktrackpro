import { permanentRedirect } from 'next/navigation';

export default function VehicleReportsRedirect() {
  permanentRedirect('/dashboard/vehicle-documents/');
}
