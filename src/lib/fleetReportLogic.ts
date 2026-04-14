import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
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

export type MileageMonitorRow = {
  vehicleId: string;
  registration: string;
  inspectionCount: number;
  validMileageCount: number;
  latestMileage: number | null;
  latestInspectionAt: string;
  daysSinceLastInspection: number | null;
  currentWeekMiles: number;
  lastWeekMiles: number;
  scoredWeekMiles: number;
  scoredWeekLabel: string;
  avgWeeklyMiles: number;
  baselineWeeklyMiles: number;
  dataWeeks: number;
  currentWeekReadings: number;
  anomalyLevel: 'normal' | 'watch' | 'high' | 'critical' | 'insufficient' | 'stale';
  anomalyReason: string;
  recommendedAction: string;
  riskScore: number;
  confidence: 'low' | 'medium' | 'high';
};

const MAX_DAILY_MILES = 450;
const ROLLBACK_THRESHOLD = -40;

function toMileageNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed.replace(/,/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

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
      const m = toMileageNumber(i.mileage);
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

function weekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

export function buildMileageMonitoringRows(
  inspections: FleetInspection[],
  vehicles: FleetVehicle[],
  now: Date = new Date()
): MileageMonitorRow[] {
  const byVehicle: Record<string, FleetInspection[]> = {};
  for (const i of inspections) {
    const vid = i.vehicle_id;
    if (!vid) continue;
    if (!byVehicle[vid]) byVehicle[vid] = [];
    byVehicle[vid].push(i);
  }

  const recentWeekKeys = Array.from({ length: 8 }, (_, i) =>
    weekKey(subWeeks(now, i))
  );
  const currentWeekKey = recentWeekKeys[0];
  const lastWeekKey = recentWeekKeys[1];

  const rows: MileageMonitorRow[] = vehicles.map((vehicle) => {
    const list = (byVehicle[vehicle.id] || []).slice().sort((a, b) => {
      const da = toJsDate(a.inspected_at)?.getTime() ?? 0;
      const db = toJsDate(b.inspected_at)?.getTime() ?? 0;
      return da - db;
    });
    const latest = list[list.length - 1];
    const latestMileage = latest ? toMileageNumber(latest.mileage) : null;
    const latestInspectionDate = latest ? toJsDate(latest.inspected_at) : null;
    const latestInspectionAt = latest ? formatFleetDate(latest.inspected_at) : '—';
    const daysSinceLastInspection =
      latestInspectionDate != null ? Math.max(0, differenceInCalendarDays(now, latestInspectionDate)) : null;

    const weeklyMiles: Record<string, number> = {};
    const weeklyReadings: Record<string, number> = {};
    let rollbackCount = 0;
    let unrealisticJumpCount = 0;

    for (const insp of list) {
      const at = toJsDate(insp.inspected_at);
      if (!at) continue;
      const m = toMileageNumber(insp.mileage);
      if (m == null) continue;
      const key = weekKey(at);
      weeklyReadings[key] = (weeklyReadings[key] || 0) + 1;
    }

    let prevM: number | null = null;
    let prevDate: Date | null = null;
    for (const insp of list) {
      const at = toJsDate(insp.inspected_at);
      const m = toMileageNumber(insp.mileage);
      if (!at || m == null) continue;
      if (prevM != null && prevDate) {
        const delta = m - prevM;
        const days = Math.max(1, differenceInCalendarDays(at, prevDate));
        if (delta < ROLLBACK_THRESHOLD) {
          rollbackCount += 1;
        } else if (delta > 2500 || delta / days > 700) {
          unrealisticJumpCount += 1;
        } else if (delta >= 0) {
          const rawDays = differenceInCalendarDays(at, prevDate);
          if (rawDays <= 0) {
            const key = weekKey(at);
            weeklyMiles[key] = (weeklyMiles[key] || 0) + delta;
          } else {
            // Distribute miles over elapsed days to avoid overcounting a single week
            // when inspections are sporadic.
            const milesPerDay = delta / rawDays;
            let cursor = startOfDay(addDays(prevDate, 1));
            const endDay = startOfDay(at);
            while (cursor <= endDay) {
              const key = weekKey(cursor);
              weeklyMiles[key] = (weeklyMiles[key] || 0) + milesPerDay;
              cursor = addDays(cursor, 1);
            }
          }
        }
      }
      prevM = m;
      prevDate = at;
    }

    const currentWeekMiles = Math.round(weeklyMiles[currentWeekKey] || 0);
    const lastWeekMiles = Math.round(weeklyMiles[lastWeekKey] || 0);
    const currentWeekReadings = weeklyReadings[currentWeekKey] || 0;
    const validMileageCount = list.reduce((count, insp) => {
      return toMileageNumber(insp.mileage) != null ? count + 1 : count;
    }, 0);
    const priorWeekMiles = recentWeekKeys
      .slice(1, 7)
      .map((key) => weeklyMiles[key] || 0)
      .filter((m) => m > 0);
    const allRecentWeekMiles = recentWeekKeys
      .map((key) => weeklyMiles[key] || 0)
      .filter((m) => m > 0);
    const baselineWeeklyMiles = Math.round(median(priorWeekMiles));
    const avgWeeklyMiles = allRecentWeekMiles.length
      ? Math.round(allRecentWeekMiles.reduce((sum, m) => sum + m, 0) / allRecentWeekMiles.length)
      : 0;
    const dataWeeks = recentWeekKeys.filter((key) => (weeklyMiles[key] || 0) > 0).length;
    const latestWeekWithMiles =
      recentWeekKeys.find((key) => (weeklyMiles[key] || 0) > 0) || null;
    const scoredWeekKey = currentWeekReadings > 0 ? currentWeekKey : latestWeekWithMiles;
    const scoredWeekMiles = scoredWeekKey ? Math.round(weeklyMiles[scoredWeekKey] || 0) : 0;
    const scoredWeekLabel =
      scoredWeekKey === currentWeekKey
        ? 'Current week'
        : scoredWeekKey
          ? `Week of ${scoredWeekKey}`
          : 'No week data';

    let anomalyLevel: MileageMonitorRow['anomalyLevel'] = 'normal';
    let anomalyReason = 'Within normal range for recent usage pattern.';

    if (rollbackCount > 0) {
      anomalyLevel = 'critical';
      anomalyReason = 'Odometer rollback pattern detected in recent inspection history.';
    } else if (unrealisticJumpCount > 0) {
      anomalyLevel = 'high';
      anomalyReason = 'Very large mileage jump detected; review readings or vehicle usage.';
    } else if (validMileageCount === 0) {
      anomalyLevel = 'insufficient';
      anomalyReason = 'No valid mileage readings logged yet.';
    } else if (validMileageCount === 1) {
      anomalyLevel = 'insufficient';
      anomalyReason = 'Only one mileage reading logged; at least two checks are needed to calculate movement.';
    } else if (baselineWeeklyMiles > 0) {
      const ratio = scoredWeekMiles / baselineWeeklyMiles;
      const uplift = scoredWeekMiles - baselineWeeklyMiles;
      if (ratio >= 2.2 && uplift >= 150) {
        anomalyLevel = 'critical';
        anomalyReason = 'Mileage in the scored week is well above baseline.';
      } else if (ratio >= 1.7 && uplift >= 100) {
        anomalyLevel = 'high';
        anomalyReason = 'Mileage in the scored week is significantly above baseline.';
      } else if (ratio >= 1.35 && uplift >= 60) {
        anomalyLevel = 'watch';
        anomalyReason = 'Mileage in the scored week is above expected trend.';
      }
    } else if (scoredWeekMiles >= 250) {
      anomalyLevel = 'watch';
      anomalyReason = 'No baseline yet; scored week mileage is high for a new pattern.';
    }

    if (
      anomalyLevel === 'normal' &&
      currentWeekReadings === 0 &&
      validMileageCount >= 2
    ) {
      anomalyLevel = 'stale';
      anomalyReason =
        daysSinceLastInspection != null
          ? `No current-week mileage check. Last inspection was ${daysSinceLastInspection} day(s) ago.`
          : 'No current-week mileage check.';
    }

    let confidence: MileageMonitorRow['confidence'] = 'low';
    if (dataWeeks >= 6 && validMileageCount >= 8) confidence = 'high';
    else if (dataWeeks >= 3 && validMileageCount >= 4) confidence = 'medium';

    let recommendedAction = 'No action needed.';
    if (anomalyLevel === 'critical') {
      recommendedAction = 'Investigate immediately and verify odometer/photos against job activity.';
    } else if (anomalyLevel === 'high') {
      recommendedAction = 'Review route and allocation details with the manager this week.';
    } else if (anomalyLevel === 'watch') {
      recommendedAction = 'Monitor next check-in to confirm if this is a one-off increase.';
    } else if (anomalyLevel === 'stale') {
      recommendedAction = 'Request a fresh vehicle inspection this week.';
    } else if (anomalyLevel === 'insufficient') {
      recommendedAction = 'Collect at least two valid mileage readings to score reliably.';
    }

    const baseScoreByLevel: Record<MileageMonitorRow['anomalyLevel'], number> = {
      critical: 95,
      high: 80,
      watch: 62,
      stale: 40,
      insufficient: 24,
      normal: 8,
    };
    const confidenceDelta = confidence === 'high' ? 5 : confidence === 'medium' ? 0 : -8;
    const stalenessBoost =
      anomalyLevel === 'stale' && daysSinceLastInspection != null && daysSinceLastInspection >= 14 ? 10 : 0;
    const riskScore = Math.max(
      0,
      Math.min(100, baseScoreByLevel[anomalyLevel] + confidenceDelta + stalenessBoost)
    );

    return {
      vehicleId: vehicle.id,
      registration: vehicle.registration || vehicle.id,
      inspectionCount: list.length,
      validMileageCount,
      latestMileage,
      latestInspectionAt,
      daysSinceLastInspection,
      currentWeekMiles,
      lastWeekMiles,
      scoredWeekMiles,
      scoredWeekLabel,
      avgWeeklyMiles,
      baselineWeeklyMiles,
      dataWeeks,
      currentWeekReadings,
      anomalyLevel,
      anomalyReason,
      recommendedAction,
      riskScore,
      confidence,
    };
  });

  const severityRank: Record<MileageMonitorRow['anomalyLevel'], number> = {
    critical: 0,
    high: 1,
    watch: 2,
    stale: 3,
    insufficient: 4,
    normal: 5,
  };

  return rows.sort((a, b) => {
    const sev = severityRank[a.anomalyLevel] - severityRank[b.anomalyLevel];
    if (sev !== 0) return sev;
    const risk = b.riskScore - a.riskScore;
    if (risk !== 0) return risk;
    return b.currentWeekMiles - a.currentWeekMiles;
  });
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
