import { startOfDay, subMonths, subDays } from 'date-fns';

/** DVSA-style compliance window for activity / inspection history queries */
export const DVSA_HISTORY_MONTHS = 15;

export function fifteenMonthsAgoStart(): Date {
  return startOfDay(subMonths(new Date(), DVSA_HISTORY_MONTHS));
}

/**
 * Earliest instant to query for “all time” UI ranges — never older than DVSA window.
 * For fixed day ranges (7/30/90), uses that range (always more recent than 15 months).
 */
export function activityHistoryStartFromDashboardRange(
  dateRange: string,
  now: Date = new Date()
): Date {
  const compliance = fifteenMonthsAgoStart();
  if (dateRange === 'all') return compliance;
  const days = parseInt(dateRange, 10);
  if (Number.isNaN(days) || days <= 0) return compliance;
  return startOfDay(subDays(now, days));
}

/** Cap for tool_history reads on dashboard / analytics (was 2500). */
export const TOOL_HISTORY_ANALYTICS_CAP = 1200;

/** Cap for vehicle_inspections downloads on dashboard home / fleet report. */
export const INSPECTION_ANALYTICS_CAP = 2500;

/** Cap for vehicle_defects downloads on dashboard home / fleet report. */
export const DEFECT_ANALYTICS_CAP = 2500;

/** Cap for date-bounded admin monthly report inspection/defect fetches. */
export const ADMIN_REPORT_QUERY_CAP = 5000;
