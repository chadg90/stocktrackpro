import type {
  MonthlyCompanyReportInput,
  OpenDefectRow,
  PriorityAction,
} from '@/lib/adminMonthlyCompanyReportPdf';

export const OPEN_DEFECTS_TABLE_CAP = 15;
export const MAX_DEFECT_DESCRIPTION_LENGTH = 180;
export const REPORT_APP_VERSION = '1.0';

export function isStaffExpectedToCheck(role: string | undefined): boolean {
  const normalized = (role || '').toLowerCase();
  return normalized === 'user' || normalized === 'manager';
}

export function truncateReportText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

/** Title-case names while preserving common UK surname prefixes. */
export function titleCaseName(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) return cleaned;
  if (cleaned.includes('@')) return cleaned;

  return cleaned
    .split(' ')
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower.startsWith('mc') && lower.length > 2) {
        return `Mc${lower.charAt(2).toUpperCase()}${lower.slice(3)}`;
      }
      if (lower.startsWith('mac') && lower.length > 3) {
        return `Mac${lower.charAt(3).toUpperCase()}${lower.slice(4)}`;
      }
      if (lower.includes('-')) {
        return lower
          .split('-')
          .map((bit) => bit.charAt(0).toUpperCase() + bit.slice(1))
          .join('-');
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/** Fix missing spaces after commas and tidy punctuation in free text. */
export function polishDescription(text: string): string {
  return text
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .trim();
}

function parseUkDate(value: string): number {
  const parts = value.split('/');
  if (parts.length !== 3) return 0;
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

export function daysOpenFromRaised(raised: string, now = new Date()): number | null {
  const ts = parseUkDate(raised);
  if (!ts) return null;
  return Math.max(0, Math.floor((now.getTime() - ts) / 86400000));
}

export function sortOpenDefectRows(rows: OpenDefectRow[]): OpenDefectRow[] {
  return [...rows].sort((a, b) => {
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
    const daysA = a.daysOpen ?? daysOpenFromRaised(a.raised) ?? 0;
    const daysB = b.daysOpen ?? daysOpenFromRaised(b.raised) ?? 0;
    return daysB - daysA;
  });
}

export function prepareOpenDefectRowsForReport(rows: OpenDefectRow[]): {
  rows: OpenDefectRow[];
  overflowCount: number;
} {
  const openRows = sortOpenDefectRows(rows.filter((row) => row.status === 'open')).map((row) => ({
    ...row,
    description: truncateReportText(polishDescription(row.description), MAX_DEFECT_DESCRIPTION_LENGTH),
    vehicle: row.vehicle.trim().toUpperCase() === row.vehicle.trim() ? row.vehicle.trim() : row.vehicle.trim(),
    daysOpen: row.daysOpen ?? daysOpenFromRaised(row.raised) ?? undefined,
  }));
  return {
    rows: openRows.slice(0, OPEN_DEFECTS_TABLE_CAP),
    overflowCount: Math.max(0, openRows.length - OPEN_DEFECTS_TABLE_CAP),
  };
}

export function formatDaysSinceLastCheck(days: number | null | undefined): string {
  if (days === null || days === undefined) return 'No checks recorded';
  if (days === 0) return 'Last check: today';
  if (days === 1) return 'Last check: 1 day ago';
  return `Last check: ${days} days ago`;
}

export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return '0%';
    return '+100%';
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

export function computeFleetHealthScore(input: {
  complianceRate: number | null;
  inspectionRate: number | null;
  criticalOpenDefects: number;
  openDefects: number;
}): number {
  const compliance = input.complianceRate ?? 0;
  const inspection = input.inspectionRate ?? 0;
  const criticalPenalty = Math.min(40, Math.round(input.criticalOpenDefects) * 15);
  const openPenalty = Math.min(20, Math.round(input.openDefects) * 2);
  const score =
    compliance * 0.35 +
    inspection * 0.35 +
    (100 - criticalPenalty) * 0.2 +
    (100 - openPenalty) * 0.1;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function complianceTrendLabel(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || delta === 0) return 'Stable';
  return delta > 0 ? 'Improving' : 'Declining';
}

export function buildExecutiveSummary(input: MonthlyCompanyReportInput): string {
  const checks = Math.round(input.checksCompleted);
  const prevChecks = Math.round(input.comparison?.previousChecks ?? checks - (input.comparison?.checksDelta ?? 0));
  const checksChange = formatPercentChange(checks, prevChecks);
  const defects = Math.round(input.defectsReported);
  const critical = Math.round(input.criticalOpenDefects);
  const compliance = input.complianceRate ?? 0;
  const staffTotal =
    Math.round(input.usersReportedCount || 0) + Math.round(input.usersNotReportedCount || 0);

  const defectClause =
    defects === 0
      ? 'No defects were reported'
      : critical > 0
        ? `${defects} defect${defects === 1 ? '' : 's'} reported, including ${critical} critical issue${critical === 1 ? '' : 's'} requiring immediate attention`
        : `${defects} defect${defects === 1 ? '' : 's'} reported with no critical issues open`;

  const complianceClause =
    staffTotal > 0
      ? `Driver compliance is ${compliance}%, with ${Math.round(input.usersReportedCount || 0)} of ${staffTotal} staff submitting activity`
      : 'Driver compliance data was unavailable for this period';

  return `${input.monthLabel} saw ${checks} vehicle inspection${checks === 1 ? '' : 's'} completed (${checksChange} vs ${input.comparison?.previousMonthLabel || 'the previous month'}). ${defectClause}. ${complianceClause}.`;
}

export function buildPriorityActions(input: MonthlyCompanyReportInput): PriorityAction[] {
  const critical = Math.round(input.criticalOpenDefects);
  const openDefects = Math.round(input.openDefects || 0);
  const usersNot = Math.round(input.usersNotReportedCount || 0);
  const checksDelta = input.comparison?.checksDelta ?? 0;
  const checks = Math.round(input.checksCompleted);
  const criticalVehicles = (input.openDefectsList || [])
    .filter((row) => row.status === 'open' && row.priority === 'critical')
    .map((row) => row.vehicle)
    .filter(Boolean);
  const uniqueCritical = [...new Set(criticalVehicles)].slice(0, 3);
  const actions: PriorityAction[] = [];

  if (critical > 0) {
    actions.push({
      tier: 'immediate',
      title: 'Immediate',
      detail: uniqueCritical.length
        ? `Repair ${uniqueCritical.join(', ')} before further use and close the defect${critical === 1 ? '' : 's'} in Stock Track PRO.`
        : `Resolve ${critical} critical defect${critical === 1 ? '' : 's'} before further vehicle use.`,
    });
  } else if (openDefects > 0) {
    actions.push({
      tier: 'immediate',
      title: 'Immediate',
      detail: `Schedule repair for ${openDefects} open standard defect${openDefects === 1 ? '' : 's'} and close them once complete.`,
    });
  } else {
    actions.push({
      tier: 'immediate',
      title: 'Immediate',
      detail: 'No open defects at month-end — continue daily checks and clear new issues within SLA.',
    });
  }

  if (usersNot > 0) {
    actions.push({
      tier: 'this_week',
      title: 'This week',
      detail: `Follow up with ${usersNot} staff member${usersNot === 1 ? '' : 's'} who missed inspections this month.`,
    });
  } else if (input.daysSinceLastCheck !== null && input.daysSinceLastCheck !== undefined && input.daysSinceLastCheck >= 14) {
    actions.push({
      tier: 'this_week',
      title: 'This week',
      detail: `Fleet inactive for ${input.daysSinceLastCheck} days — confirm vehicles are in use and checks are being completed.`,
    });
  } else {
    actions.push({
      tier: 'this_week',
      title: 'This week',
      detail: 'Review open defects weekly and assign owners with due dates.',
    });
  }

  if (checksDelta >= 0) {
    actions.push({
      tier: 'continue',
      title: 'Continue',
      detail: `Inspection volume is strong — ${checks} checks completed (${checksDelta >= 0 ? '+' : ''}${Math.round(checksDelta)} vs ${input.comparison?.previousMonthLabel || 'last month'}).`,
    });
  } else {
    actions.push({
      tier: 'continue',
      title: 'Continue',
      detail: `Rebuild inspection frequency — checks fell by ${Math.abs(Math.round(checksDelta))} vs ${input.comparison?.previousMonthLabel || 'last month'}.`,
    });
  }

  return actions.slice(0, 3);
}

/** @deprecated Prefer buildPriorityActions for the premium report layout. */
export function buildRecommendedActions(input: MonthlyCompanyReportInput): string[] {
  return buildPriorityActions(input).map((action) => `${action.title}: ${action.detail}`);
}

export function buildReferenceId(generatedAt: Date): string {
  return `STP-MONTHLY-${generatedAt.toISOString().replace(/[-:.TZ]/g, '').slice(0, 12)}`;
}

export function formatGeneratedAt(generatedAt: Date): string {
  return generatedAt.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
