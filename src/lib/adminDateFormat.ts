/**
 * Consistent admin-area date formatting: DD/MM/YYYY, and HH:mm when a time is needed.
 */

function toValidDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    try {
      const d = (value as { toDate: () => Date }).toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format as DD/MM/YYYY. */
export function formatAdminDate(value: unknown, fallback = '—'): string {
  const d = toValidDate(value);
  if (!d) return fallback;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Format as DD/MM/YYYY HH:mm (24-hour). */
export function formatAdminDateTime(value: unknown, fallback = '—'): string {
  const d = toValidDate(value);
  if (!d) return fallback;
  return `${formatAdminDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Format a YYYY-MM-DD calendar day as DD/MM/YYYY. */
export function formatAdminDayId(dayId: string, fallback = '—'): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayId)) return fallback;
  const [y, m, d] = dayId.split('-');
  return `${d}/${m}/${y}`;
}
