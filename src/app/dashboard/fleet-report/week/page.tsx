import { permanentRedirect } from 'next/navigation';

export default function FleetReportWeekRedirect() {
  permanentRedirect('/dashboard/inspections/');
}
