import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';

export function sanitizeText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u0100-\u017F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function normalizeReportInput(input: MonthlyCompanyReportInput): MonthlyCompanyReportInput {
  return {
    ...input,
    companyName: sanitizeText(input.companyName),
    monthLabel: sanitizeText(input.monthLabel),
    openDefectsList: (input.openDefectsList || []).map((row) => ({
      ...row,
      vehicle: sanitizeText(row.vehicle),
      description: sanitizeText(row.description),
      raised: sanitizeText(row.raised),
    })),
  };
}

export function buildReportFilename(companyName: string, monthLabel: string): string {
  const slugCompany = sanitizeText(companyName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const [month, year] = sanitizeText(monthLabel).split(' ');
  const monthPart = (month || 'month').toLowerCase();
  const yearPart = (year || 'year').toLowerCase();
  return `stp-monthly-report-${slugCompany}-${monthPart}-${yearPart}.pdf`;
}

