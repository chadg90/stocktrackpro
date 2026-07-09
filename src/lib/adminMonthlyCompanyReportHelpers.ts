import type { MonthlyCompanyReportInput, OpenDefectRow } from '@/lib/adminMonthlyCompanyReportPdf';

export const OPEN_DEFECTS_TABLE_CAP = 15;
export const MAX_DEFECT_DESCRIPTION_LENGTH = 180;

export function isStaffExpectedToCheck(role: string | undefined): boolean {
  const normalized = (role || '').toLowerCase();
  return normalized === 'user' || normalized === 'manager';
}

export function truncateReportText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
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

export function sortOpenDefectRows(rows: OpenDefectRow[]): OpenDefectRow[] {
  return [...rows].sort((a, b) => {
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
    return parseUkDate(a.raised) - parseUkDate(b.raised);
  });
}

export function prepareOpenDefectRowsForReport(rows: OpenDefectRow[]): {
  rows: OpenDefectRow[];
  overflowCount: number;
} {
  const openRows = sortOpenDefectRows(rows.filter((row) => row.status === 'open')).map((row) => ({
    ...row,
    description: truncateReportText(row.description, MAX_DEFECT_DESCRIPTION_LENGTH),
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

export function buildRecommendedActions(input: MonthlyCompanyReportInput): string[] {
  const critical = Math.round(input.criticalOpenDefects);
  const openDefects = Math.round(input.openDefects || 0);
  const usersNotReported = Math.round(input.usersNotReportedCount || 0);
  const checksDelta = input.comparison?.checksDelta ?? 0;
  const prev = input.comparison?.previousMonthLabel || 'last month';
  const month = input.monthLabel;
  const checks = Math.round(input.checksCompleted);
  const candidates: string[] = [];

  if (critical > 0) {
    candidates.push(
      `Resolve ${critical} critical defect(s) immediately. Confirm repair and close in Stock Track PRO before further vehicle use.`
    );
  } else if (openDefects > 0) {
    candidates.push(
      `No critical defects open, but ${openDefects} standard defect(s) remain — schedule repairs and close them in Stock Track PRO.`
    );
  } else {
    candidates.push('Continue daily checks and resolve raised defects within agreed SLA.');
  }

  if (input.daysSinceLastCheck !== null && input.daysSinceLastCheck !== undefined && input.daysSinceLastCheck >= 14) {
    candidates.push(
      `Fleet inactive for ${input.daysSinceLastCheck} days — confirm vehicles are in use and checks are being completed via the app.`
    );
  }

  if (usersNotReported > 0) {
    candidates.push(
      `Follow up with ${usersNotReported} staff member(s) who submitted no checks or defects in ${month}.`
    );
  }

  if (checksDelta >= 0) {
    candidates.push(
      `Maintain inspection frequency. ${month}'s ${checks} checks (+${Math.round(checksDelta)} on ${prev}) is a strong result.`
    );
  } else {
    candidates.push(
      `Inspection frequency dropped by ${Math.abs(Math.round(checksDelta))} this month. Ensure all drivers are completing checks via Stock Track PRO.`
    );
  }

  if ((input.resolutionRate ?? 0) > 100) {
    candidates.push(
      `Monitor resolution backlog. The ${Math.round(input.resolutionRate || 0)}% resolution rate reflects clearance of prior-month defects — aim to keep open defects below 3.`
    );
  } else {
    candidates.push('Review unresolved defects weekly and assign owners with due dates.');
  }

  const unique: string[] = [];
  for (const action of candidates) {
    if (!unique.includes(action)) unique.push(action);
    if (unique.length >= 3) break;
  }
  return unique;
}
