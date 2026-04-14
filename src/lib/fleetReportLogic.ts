import { format, startOfWeek, endOfWeek, differenceInCalendarDays } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

export type FleetVehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  status?: string;
  mileage?: number;
};

export type FleetUser = {
  id: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  displayName?: string;
  name?: string;
};

export type FleetInspection = {
  id: string;
  vehicle_id?: string;
  inspected_at?: Timestamp | string;
  inspected_by?: string;
  mileage?: number;
  has_defect?: boolean;
  notes?: string;
};

export type FleetDefect = {
  id: string;
  vehicle_id?: string;
  reported_by?: string;
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
  description?: string;
  reporter_contact_phone?: string;
  severity?: string;
  status?: string;
};

export function toJsDate(value?: Timestamp | string | null): Date | null {
  if (value == null) return null;
  try {
    if (typeof value === 'object' && value && 'toDate' in value) {
      return (value as Timestamp).toDate();
    }
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatFleetDate(value?: Timestamp | string | null): string {
  const d = toJsDate(value);
  return d ? format(d, 'yyyy-MM-dd HH:mm') : '—';
}

export function getUserLabel(u: FleetUser | undefined, fallbackId: string): string {
  if (!u) return fallbackId || '—';
  const fn = u.first_name || '';
  const ln = u.last_name || '';
  const combined = `${fn} ${ln}`.trim();
  if (combined) return combined;
  if (u.display_name?.trim()) return u.display_name.trim();
  if (u.displayName?.trim()) return u.displayName.trim();
  if (u.name?.trim()) return u.name.trim();
  if (u.email) return u.email;
  return u.id;
}

/** UK-style week: Monday start */
export function getCurrentWeekBounds(now = new Date()): { start: Date; end: Date } {
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return { start, end };
}

export type MileageRow = {
  'Inspection ID': string;
  Registration: string;
  'Inspected At': string;
  Mileage: string | number;
  'Previous Mileage': string;
  'Delta Miles': string;
  'Days Since Prev': string;
  'Anomaly Flag': string;
  'Anomaly Detail': string;
  Inspector: string;
};

const MAX_DAILY_MILES = 450;
const ROLLBACK_THRESHOLD = -40;

export function buildMileageInspectionRows(
  inspections: FleetInspection[],
  vehicles: FleetVehicle[],
  users: FleetUser[]
): MileageRow[] {
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const byVehicle: Record<string, FleetInspection[]> = {};
  for (const i of inspections) {
    const vid = i.vehicle_id;
    if (!vid) continue;
    if (!byVehicle[vid]) byVehicle[vid] = [];
    byVehicle[vid].push(i);
  }

  const rows: MileageRow[] = [];

  for (const vid of Object.keys(byVehicle)) {
    const list = byVehicle[vid].slice().sort((a, b) => {
      const da = toJsDate(a.inspected_at)?.getTime() ?? 0;
      const db = toJsDate(b.inspected_at)?.getTime() ?? 0;
      return da - db;
    });

    let prevM: number | null = null;
    let prevDate: Date | null = null;

    for (const i of list) {
      const v = vehicleMap[vid];
      const reg = v?.registration || vid;
      const at = toJsDate(i.inspected_at);
      const m = typeof i.mileage === 'number' && !Number.isNaN(i.mileage) ? i.mileage : null;
      const inspector = getUserLabel(userMap[i.inspected_by || ''], i.inspected_by || '');

      let flag = '';
      let detail = '';
      let deltaStr = '—';
      let daysStr = '—';
      let prevStr = '—';

      if (m != null && prevM != null && at && prevDate) {
        const delta = m - prevM;
        const days = Math.max(1, differenceInCalendarDays(at, prevDate));
        deltaStr = String(delta);
        daysStr = String(differenceInCalendarDays(at, prevDate));
        prevStr = String(prevM);

        if (delta < ROLLBACK_THRESHOLD) {
          flag = 'Yes';
          detail = 'Odometer decreased vs previous inspection (possible rollback or data error)';
        } else if (delta / days > MAX_DAILY_MILES) {
          flag = 'Yes';
          detail = `High implied daily mileage (${Math.round(delta / days)} mi/day vs cap ${MAX_DAILY_MILES})`;
        }
      } else if (m == null && prevM != null) {
        flag = 'Review';
        detail = 'Mileage missing while previous reading exists';
      }

      rows.push({
        'Inspection ID': i.id,
        Registration: reg,
        'Inspected At': formatFleetDate(i.inspected_at),
        Mileage: m ?? '—',
        'Previous Mileage': prevStr,
        'Delta Miles': deltaStr,
        'Days Since Prev': daysStr,
        'Anomaly Flag': flag || 'No',
        'Anomaly Detail': detail || '—',
        Inspector: inspector,
      });

      if (m != null) {
        prevM = m;
        prevDate = at;
      } else if (at) {
        prevDate = at;
      }
    }
  }

  return rows.sort((a, b) => (a['Inspected At'] < b['Inspected At'] ? 1 : -1));
}

export function filterInspectionsInWeek(
  inspections: FleetInspection[],
  start: Date,
  end: Date
): FleetInspection[] {
  return inspections.filter((i) => {
    const d = toJsDate(i.inspected_at);
    if (!d) return false;
    return d >= start && d <= end;
  });
}

export type UserComplianceRow = {
  'User ID': string;
  User: string;
  Email: string;
  Role: string;
  'Inspections This Week': number;
  Status: string;
};

export function buildUserCompliance(
  users: FleetUser[],
  weekInspections: FleetInspection[]
): UserComplianceRow[] {
  const counts: Record<string, number> = {};
  for (const i of weekInspections) {
    const uid = i.inspected_by;
    if (!uid) continue;
    counts[uid] = (counts[uid] || 0) + 1;
  }

  const staff = users.filter((u) => u.role === 'user' || u.role === 'manager');

  return staff.map((u) => {
    const n = counts[u.id] || 0;
    return {
      'User ID': u.id,
      User: getUserLabel(u, u.id),
      Email: u.email || '—',
      Role: u.role || '—',
      'Inspections This Week': n,
      Status: n > 0 ? 'Checked this week' : 'No inspection logged this week',
    };
  });
}

export type VehicleWeekRow = {
  'Vehicle ID': string;
  Registration: string;
  'Make / Model': string;
  Status: string;
  'Inspected This Week': string;
  'Last Inspection': string;
  'Inspector (last in week)': string;
};

export function buildVehicleWeekCompliance(
  vehicles: FleetVehicle[],
  weekInspections: FleetInspection[],
  users: FleetUser[]
): VehicleWeekRow[] {
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const fleetList = vehicles.filter((v) => {
    const s = (v.status || 'active').toLowerCase();
    return s !== 'archived' && s !== 'sold';
  });

  return fleetList.map((v) => {
    const vis = weekInspections.filter((i) => i.vehicle_id === v.id);
    const sorted = vis
      .slice()
      .sort((a, b) => (toJsDate(b.inspected_at)?.getTime() ?? 0) - (toJsDate(a.inspected_at)?.getTime() ?? 0));
    const last = sorted[0];
    return {
      'Vehicle ID': v.id,
      Registration: v.registration || v.id,
      'Make / Model': [v.make, v.model].filter(Boolean).join(' ') || '—',
      Status: v.status || 'active',
      'Inspected This Week': vis.length > 0 ? 'Yes' : 'No',
      'Last Inspection': last ? formatFleetDate(last.inspected_at) : '—',
      'Inspector (last in week)': last
        ? getUserLabel(userMap[last.inspected_by || ''], last.inspected_by || '')
        : '—',
    };
  });
}

export function buildFleetReportExcelSheets(
  vehicles: FleetVehicle[],
  users: FleetUser[],
  inspections: FleetInspection[],
  defects: FleetDefect[]
): { name: string; data: Record<string, string | number>[] }[] {
  const { start, end } = getCurrentWeekBounds();
  const weekInsp = filterInspectionsInWeek(inspections, start, end);

  const mileageRows = buildMileageInspectionRows(inspections, vehicles, users);
  const anomalyOnly = mileageRows.filter((r) => r['Anomaly Flag'] === 'Yes' || r['Anomaly Flag'] === 'Review');

  const outstanding = defects.filter((d) => d.status !== 'resolved');
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]));

  const defectRows = defects.map((d) => ({
    'Defect ID': d.id,
    Registration: vehicleMap[d.vehicle_id || '']?.registration || d.vehicle_id || '—',
    Description: d.description || '—',
    'Reporter contact phone': d.reporter_contact_phone || '—',
    Severity: d.severity || '—',
    Status: d.status || '—',
    'Reported At': formatFleetDate(d.reported_at),
    'Reported By': getUserLabel(userMap[d.reported_by || ''], d.reported_by || ''),
    'Resolved At': formatFleetDate(d.resolved_at),
  }));

  const weekRows = weekInsp
    .slice()
    .sort((a, b) => (toJsDate(b.inspected_at)?.getTime() ?? 0) - (toJsDate(a.inspected_at)?.getTime() ?? 0))
    .map((i) => ({
      'Inspection ID': i.id,
      Registration: vehicleMap[i.vehicle_id || '']?.registration || i.vehicle_id || '—',
      'Inspected At': formatFleetDate(i.inspected_at),
      Mileage: i.mileage ?? '—',
      'Has Defect': i.has_defect ? 'Yes' : 'No',
      Inspector: getUserLabel(userMap[i.inspected_by || ''], i.inspected_by || ''),
      Notes: (i.notes || '').slice(0, 500),
    }));

  const userComp = buildUserCompliance(users, weekInsp);
  const vehComp = buildVehicleWeekCompliance(vehicles, weekInsp, users);

  const summary = [
    {
      Metric: 'Report generated',
      Value: format(new Date(), 'yyyy-MM-dd HH:mm'),
    },
    {
      Metric: 'Week range (Mon–Sun)',
      Value: `${format(start, 'yyyy-MM-dd')} → ${format(end, 'yyyy-MM-dd')}`,
    },
    { Metric: 'Total inspections (loaded period)', Value: inspections.length },
    { Metric: 'Inspections this week', Value: weekInsp.length },
    { Metric: 'Open / outstanding defects', Value: outstanding.length },
    { Metric: 'Mileage rows (all loaded)', Value: mileageRows.length },
    { Metric: 'Mileage anomalies flagged', Value: anomalyOnly.length },
  ];

  return [
    { name: 'Summary', data: summary },
    { name: 'Mileage all inspections', data: mileageRows as unknown as Record<string, string | number>[] },
    { name: 'Mileage anomalies', data: anomalyOnly as unknown as Record<string, string | number>[] },
    { name: 'Defects all', data: defectRows },
    {
      name: 'Defects outstanding',
      data: outstanding.map((d) => ({
        'Defect ID': d.id,
        Registration: vehicleMap[d.vehicle_id || '']?.registration || d.vehicle_id || '—',
        Description: d.description || '—',
        'Reporter contact phone': d.reporter_contact_phone || '—',
        Severity: d.severity || '—',
        Status: d.status || '—',
        'Reported At': formatFleetDate(d.reported_at),
        'Reported By': getUserLabel(userMap[d.reported_by || ''], d.reported_by || ''),
      })),
    },
    { name: 'Week inspections', data: weekRows },
    { name: 'User compliance week', data: userComp as unknown as Record<string, string | number>[] },
    { name: 'Vehicle compliance week', data: vehComp as unknown as Record<string, string | number>[] },
  ];
}
