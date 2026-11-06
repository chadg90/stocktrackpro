import { permanentRedirect } from 'next/navigation';

export default function FleetReportComplianceRedirect() {
  permanentRedirect('/dashboard/fleet-report/who-checked/');
}
