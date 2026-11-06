import { permanentRedirect } from 'next/navigation';

export default function InspectionProofRedirect() {
  permanentRedirect('/dashboard/vehicle-documents/');
}
