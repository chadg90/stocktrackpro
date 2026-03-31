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
