import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  buildExecutiveSummary,
  buildPriorityActions,
  complianceTrendLabel,
  formatDaysSinceLastCheck,
  formatGeneratedAt,
  formatPercentChange,
  prepareOpenDefectRowsForReport,
  REPORT_APP_VERSION,
  titleCaseName,
} from '@/lib/adminMonthlyCompanyReportHelpers';

export type MonthlyCompanyReportTemplate = 'executive';

export type ReportTrendPoint = {
  month: string;
  checks: number;
  defectsReported: number;
  defectsResolved: number;
};

export type OpenDefectRow = {
  vehicle: string;
  description: string;
  raised: string;
  priority: 'critical' | 'standard';
  status: 'open' | 'resolved';
  daysOpen?: number;
};

export type ReportUserCheckRow = {
  name: string;
  email?: string;
  checksCompleted: number;
  defectsRaised?: number;
  lastInspection?: string;
};

export type ReportUserNoCheckRow = {
  name: string;
  email?: string;
};

export type PriorityAction = {
  tier: 'immediate' | 'this_week' | 'continue';
  title: string;
  detail: string;
};

export type MonthlyCompanyReportInput = {
  companyName: string;
  monthLabel: string;
  generatedAt: Date;
  generatedBy: string;
  template: MonthlyCompanyReportTemplate;
  checksCompleted: number;
  defectsReported: number;
  defectsResolved: number;
  resolutionRate: number | null;
  openDefects: number;
  criticalOpenDefects: number;
  daysSinceLastCheck: number | null;
  inactivityDays?: number | null;
  totalVehicles?: number;
  vehiclesInspected?: number;
  inspectionRate?: number | null;
  avgDefectsPerVehicle?: number | null;
  avgRepairDays?: number | null;
  complianceRate?: number | null;
  fleetHealthScore?: number | null;
  previousComplianceRate?: number | null;
  comparison?: {
    previousMonthLabel: string;
    checksDelta: number;
    defectsReportedDelta: number;
    defectsResolvedDelta: number;
    resolutionRateDelta: number | null;
    previousChecks?: number;
    previousDefectsReported?: number;
    previousDefectsResolved?: number;
  } | null;
  trend?: ReportTrendPoint[];
  openDefectsList?: OpenDefectRow[];
  usersReportedCount?: number;
  usersNotReportedCount?: number;
  usersWithChecks?: ReportUserCheckRow[];
  usersWithoutChecks?: ReportUserNoCheckRow[];
  topInspectorName?: string | null;
  topInspectorChecks?: number | null;
  summaryNote?: string;
};

type RGB = [number, number, number];

// Brand palette — matches the website (#2563eb blue, #111827 ink).
const BLUE: RGB = [37, 99, 235];
const BLUE_DARK: RGB = [29, 78, 216];
const BLUE_TINT: RGB = [239, 246, 255];
const SUCCESS: RGB = [26, 122, 58];
const SUCCESS_TINT: RGB = [232, 245, 233];
const WARNING: RGB = [230, 168, 23];
const WARNING_TINT: RGB = [255, 243, 205];
const WARNING_TEXT: RGB = [122, 74, 0];
const DANGER: RGB = [217, 64, 64];
const DANGER_TINT: RGB = [252, 232, 232];
const DANGER_TEXT: RGB = [122, 26, 26];
const INK: RGB = [17, 24, 39];
const BODY: RGB = [31, 41, 55];
const MUTED: RGB = [107, 114, 128];
const FAINT: RGB = [156, 163, 175];
const LINE: RGB = [229, 231, 235];
const PANEL: RGB = [249, 250, 251];
const WHITE: RGB = [255, 255, 255];

type PdfRenderOptions = {
  /** PNG/JPEG data URL of the Fleet Track PRO logo. Falls back to a drawn mark if absent. */
  logoDataUrl?: string;
};

function buildReferenceId(input: MonthlyCompanyReportInput): string {
  const stamp = input.generatedAt.toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  return `FTP-MONTHLY-${stamp}`;
}

function buildFilename(input: MonthlyCompanyReportInput): string {
  const filenameCompany = input.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filenameMonth = input.monthLabel.toLowerCase().replace(/\s+/g, '-');
  return `ftp-monthly-report-${filenameCompany}-${filenameMonth}.pdf`;
}

/** Standard 14 fonts only cover WinAnsi — strip anything that would print as garbage. */
function sanitizeText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function signed(n: number): string {
  const r = Math.round(n);
  return `${r > 0 ? '+' : ''}${r}`;
}

function pct(n: number | null | undefined): string {
  return n === null || n === undefined ? 'N/A' : `${Math.round(n)}%`;
}

function renderReportDoc(input: MonthlyCompanyReportInput, options: PdfRenderOptions = {}): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentX = margin;
  const contentW = pageW - margin * 2;
  const rightX = contentX + contentW;
  const footerReserve = 22;
  const runningHeaderY = 20;

  const companyName = sanitizeText(input.companyName) || 'Company';
  const monthLabel = sanitizeText(input.monthLabel) || 'Reporting period';
  const referenceId = buildReferenceId(input);
  const generatedLabel = sanitizeText(formatGeneratedAt(input.generatedAt));
  const prevLabel = sanitizeText(input.comparison?.previousMonthLabel || 'Previous month');

  const checks = Math.round(input.checksCompleted);
  const reported = Math.round(input.defectsReported);
  const resolved = Math.round(input.defectsResolved);
  const critical = Math.round(input.criticalOpenDefects);
  const openDefects = Math.round(input.openDefects || 0);
  const prevChecks = Math.round(input.comparison?.previousChecks ?? checks - (input.comparison?.checksDelta ?? 0));
  const prevReported = Math.round(
    input.comparison?.previousDefectsReported ?? reported - (input.comparison?.defectsReportedDelta ?? 0)
  );
  const prevResolved = Math.round(
    input.comparison?.previousDefectsResolved ?? resolved - (input.comparison?.defectsResolvedDelta ?? 0)
  );
  const usersReported = Math.max(0, Math.round(input.usersReportedCount || 0));
  const usersNot = Math.max(0, Math.round(input.usersNotReportedCount || 0));
  const usersTotal = usersReported + usersNot;
  const compliance =
    input.complianceRate ?? (usersTotal > 0 ? Math.round((usersReported / usersTotal) * 100) : 0);
  const previousCompliance = input.previousComplianceRate ?? null;
  const complianceDelta = previousCompliance === null ? null : compliance - previousCompliance;
  const totalVehicles = Math.round(input.totalVehicles || 0);
  const vehiclesInspected = Math.round(input.vehiclesInspected || 0);
  const inspectionRate =
    input.inspectionRate ?? (totalVehicles > 0 ? Math.round((vehiclesInspected / totalVehicles) * 100) : null);
  const avgDefects =
    input.avgDefectsPerVehicle === null || input.avgDefectsPerVehicle === undefined
      ? 'N/A'
      : input.avgDefectsPerVehicle.toFixed(2);
  const avgRepair =
    input.avgRepairDays === null || input.avgRepairDays === undefined ? 'N/A' : `${input.avgRepairDays.toFixed(1)}d`;
  const health = Math.max(0, Math.min(100, Math.round(input.fleetHealthScore ?? 0)));
  const healthColor: RGB = health >= 80 ? SUCCESS : health >= 60 ? [196, 122, 0] : DANGER;
  const healthWord = health >= 80 ? 'Good' : health >= 60 ? 'Needs attention' : 'At risk';
  const usersWithChecks = input.usersWithChecks || [];
  const usersWithoutChecks = input.usersWithoutChecks || [];
  const topName = input.topInspectorName
    ? titleCaseName(input.topInspectorName)
    : usersWithChecks[0]?.name
      ? titleCaseName(usersWithChecks[0].name)
      : null;
  const topChecks = input.topInspectorChecks ?? usersWithChecks[0]?.checksCompleted ?? 0;

  let y = 0;

  // ---------- primitives ----------
  const setFont = (style: 'normal' | 'bold', size: number, color: RGB) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const drawLogo = (x: number, topY: number, height: number): number => {
    if (options.logoDataUrl) {
      try {
        const props = doc.getImageProperties(options.logoDataUrl);
        const ratio = props.width > 0 && props.height > 0 ? props.width / props.height : 2.6;
        const width = height * ratio;
        doc.addImage(options.logoDataUrl, props.fileType || 'PNG', x, topY, width, height, undefined, 'FAST');
        return width;
      } catch {
        // fall through to drawn mark
      }
    }
    // Drawn fallback mark: blue rounded tile + wordmark.
    doc.setFillColor(...BLUE);
    doc.roundedRect(x, topY, height, height, 1.6, 1.6, 'F');
    doc.setFillColor(...WHITE);
    const dot = height * 0.18;
    const cx = x + height / 2;
    const cy = topY + height / 2;
    doc.circle(cx, cy, dot * 0.9, 'F');
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      doc.circle(cx + Math.cos(a) * height * 0.32, cy + Math.sin(a) * height * 0.32, dot * 0.45, 'F');
    }
    setFont('bold', 11, INK);
    doc.text('FLEET TRACK', x + height + 3, topY + height * 0.45);
    setFont('bold', 13, INK);
    doc.text('PRO', x + height + 3, topY + height * 0.95);
    return height + 3 + doc.getTextWidth('FLEET TRACK');
  };

  const runningHeader = () => {
    const logoH = 7;
    drawLogo(contentX, 9, logoH);
    setFont('normal', 8, MUTED);
    doc.text(`${companyName}  |  ${monthLabel}`, rightX, 13.5, { align: 'right' });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(contentX, 18, rightX, 18);
  };

  const newPage = () => {
    doc.addPage();
    runningHeader();
    y = runningHeaderY + 4;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - footerReserve) newPage();
  };

  const sectionLabel = (text: string) => {
    ensureSpace(12);
    setFont('bold', 8.5, BLUE_DARK);
    doc.text(sanitizeText(text).toUpperCase(), contentX, y);
    y += 2;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.5);
    doc.line(contentX, y, contentX + 14, y);
    y += 5;
  };

  const panel = (x: number, top: number, w: number, h: number, fill: RGB = PANEL, stroke: RGB = LINE) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...stroke);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, top, w, h, 1.8, 1.8, 'FD');
  };

  const lastTableY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  const tableDefaults = {
    margin: { left: contentX, right: margin, top: runningHeaderY + 4, bottom: footerReserve },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: BODY,
      lineColor: LINE,
      lineWidth: 0.15,
      cellPadding: { top: 1.8, right: 2, bottom: 1.8, left: 2 },
      valign: 'middle' as const,
      overflow: 'linebreak' as const,
    },
    headStyles: { fillColor: PANEL, textColor: MUTED, fontStyle: 'bold' as const, fontSize: 7.5 },
    alternateRowStyles: { fillColor: WHITE },
    didDrawPage: (data: { pageNumber: number }) => {
      // Only when the table itself spilled onto a fresh page does it need the running header.
      if (data.pageNumber > 1) runningHeader();
    },
  };

  // ======================================================================
  // PAGE 1 — Cover
  // ======================================================================
  y = 12;
  const logoH = 12;
  drawLogo(contentX, y, logoH);
  setFont('normal', 8.5, MUTED);
  doc.text('Monthly fleet performance report', contentX, y + logoH + 5);

  setFont('bold', 13, INK);
  doc.text(companyName, rightX, y + 4.5, { align: 'right', maxWidth: contentW * 0.5 });
  setFont('bold', 10, BLUE);
  doc.text(monthLabel, rightX, y + 10, { align: 'right' });
  setFont('normal', 7.5, FAINT);
  doc.text(`Ref ${referenceId}`, rightX, y + 14.2, { align: 'right' });
  doc.text(`Generated ${generatedLabel}`, rightX, y + 17.8, { align: 'right' });

  y += logoH + 9;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  doc.line(contentX, y, rightX, y);
  y += 7;

  // Cover grid: health score + 4 headline metrics
  const gap = 4;
  const leftW = contentW * 0.46;
  const rightW = contentW - leftW - gap;
  const coverH = 36;

  panel(contentX, y, leftW, coverH, [248, 251, 255]);
  setFont('bold', 7.5, MUTED);
  doc.text('FLEET HEALTH SCORE', contentX + 5, y + 7);
  setFont('bold', 30, healthColor);
  doc.text(String(health), contentX + 5, y + 21);
  const scoreW = doc.getTextWidth(String(health));
  setFont('bold', 11, FAINT);
  doc.text('/100', contentX + 5 + scoreW + 1.5, y + 21);
  setFont('bold', 9, healthColor);
  doc.text(healthWord, contentX + 5, y + 28);
  setFont('normal', 7.5, MUTED);
  const trendText = `Compliance trend: ${complianceTrendLabel(complianceDelta)}${
    complianceDelta !== null && complianceDelta !== 0 ? ` (${signed(complianceDelta)}pp)` : ''
  }`;
  doc.text(trendText, contentX + 5, y + 32.5);

  const mX = contentX + leftW + gap;
  const mW = (rightW - 3) / 2;
  const mH = (coverH - 3) / 2;
  const metrics: Array<{ k: string; v: string; color?: RGB }> = [
    { k: 'Vehicles checked', v: `${vehiclesInspected}/${totalVehicles || '-'}` },
    { k: 'Critical defects open', v: String(critical), color: critical > 0 ? DANGER : SUCCESS },
    { k: 'Top inspector', v: topName || '-' },
    { k: 'Open defects (all)', v: String(openDefects), color: openDefects > 0 ? WARNING_TEXT : SUCCESS },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = mX + col * (mW + 3);
    const top = y + row * (mH + 3);
    panel(x, top, mW, mH);
    setFont('normal', 7, MUTED);
    doc.text(m.k, x + 3, top + 5);
    const isName = m.k === 'Top inspector';
    setFont('bold', isName ? 9.5 : 14, m.color || INK);
    doc.text(sanitizeText(m.v), x + 3, top + 12.2, { maxWidth: mW - 6 });
  });
  y += coverH + 6;

  // Executive summary
  const summary = sanitizeText(input.summaryNote || buildExecutiveSummary(input));
  setFont('normal', 8.8, BODY);
  const summaryLines = doc.splitTextToSize(summary, contentW - 12) as string[];
  const summaryH = 10 + summaryLines.length * 4.3;
  doc.setFillColor(...BLUE_TINT);
  doc.roundedRect(contentX, y, contentW, summaryH, 1.8, 1.8, 'F');
  doc.setFillColor(...BLUE);
  doc.rect(contentX, y + 1.5, 1.4, summaryH - 3, 'F');
  setFont('bold', 7.5, BLUE_DARK);
  doc.text('EXECUTIVE SUMMARY', contentX + 6, y + 5.5);
  setFont('normal', 8.8, BODY);
  doc.text(summaryLines, contentX + 6, y + 10.5);
  y += summaryH + 5;

  // Alert bar
  const alertDanger = critical > 0;
  const alertFill = alertDanger ? DANGER_TINT : openDefects > 0 ? WARNING_TINT : SUCCESS_TINT;
  const alertBorder = alertDanger ? DANGER : openDefects > 0 ? WARNING : SUCCESS;
  const alertText = alertDanger ? DANGER_TEXT : openDefects > 0 ? WARNING_TEXT : SUCCESS;
  panel(contentX, y, contentW, 11, alertFill, alertBorder);
  doc.setFillColor(...alertBorder);
  doc.circle(contentX + 4, y + 5.5, 1.3, 'F');
  setFont('bold', 8.5, alertText);
  doc.text(
    alertDanger
      ? `Action required - ${critical} critical defect${critical === 1 ? '' : 's'} open at month-end`
      : openDefects > 0
        ? `${openDefects} standard defect${openDefects === 1 ? '' : 's'} open - schedule repairs`
        : 'No open defects at month-end',
    contentX + 8,
    y + 5
  );
  setFont('normal', 7.5, alertText);
  doc.text(formatDaysSinceLastCheck(input.daysSinceLastCheck), contentX + 8, y + 8.8);
  doc.text(
    alertDanger ? 'Compliance risk: HIGH' : openDefects > 0 ? 'Compliance risk: MONITOR' : 'Compliance risk: LOW',
    rightX - 3,
    y + 6.5,
    { align: 'right' }
  );
  y += 16;

  // Section 1 — KPI cards
  sectionLabel(`1 - Key performance indicators  |  ${monthLabel}`);
  const cardGap = 3;
  const cardW = (contentW - cardGap * 3) / 4;
  const cardH = 23;
  const cards = [
    { label: 'Checks completed', value: checks, delta: input.comparison?.checksDelta ?? 0, betterWhenUp: true },
    { label: 'Defects reported', value: reported, delta: input.comparison?.defectsReportedDelta ?? 0, betterWhenUp: false },
    { label: 'Defects resolved', value: resolved, delta: input.comparison?.defectsResolvedDelta ?? 0, betterWhenUp: true },
    { label: 'Critical open', value: critical, delta: null as number | null, betterWhenUp: false },
  ];
  cards.forEach((card, i) => {
    const x = contentX + i * (cardW + cardGap);
    const isCriticalCard = card.delta === null;
    const hot = isCriticalCard && card.value > 0;
    panel(x, y, cardW, cardH, hot ? DANGER_TINT : PANEL, hot ? [243, 192, 192] : LINE);
    setFont('normal', 7, hot ? [160, 48, 48] : MUTED);
    doc.text(card.label.toUpperCase(), x + 3, y + 5);
    setFont('bold', 17, hot ? DANGER : INK);
    doc.text(String(card.value), x + 3, y + 13.5);
    setFont('normal', 7, MUTED);
    if (isCriticalCard) {
      doc.text(`${openDefects} open in total`, x + 3, y + 19.5);
    } else {
      const d = card.delta as number;
      const good = card.betterWhenUp ? d >= 0 : d <= 0;
      setFont('bold', 7, d === 0 ? MUTED : good ? SUCCESS : DANGER);
      doc.text(`${signed(d)} vs ${prevLabel}`, x + 3, y + 19.5, { maxWidth: cardW - 6 });
    }
  });
  y += cardH + 4;

  // Secondary KPIs
  const skGap = 2.5;
  const skW = (contentW - skGap * 5) / 6;
  const skH = 15;
  const secondary = [
    { v: String(totalVehicles), t: 'Total vehicles' },
    { v: String(vehiclesInspected), t: 'Vehicles inspected' },
    { v: pct(inspectionRate), t: 'Inspection rate' },
    { v: avgDefects, t: 'Avg defects / vehicle' },
    { v: avgRepair, t: 'Avg repair time' },
    { v: pct(input.resolutionRate), t: 'Resolution rate' },
  ];
  secondary.forEach((item, i) => {
    const x = contentX + i * (skW + skGap);
    panel(x, y, skW, skH, WHITE);
    setFont('bold', 11, INK);
    doc.text(item.v, x + 2.5, y + 7);
    setFont('normal', 6.3, MUTED);
    doc.text(item.t, x + 2.5, y + 11.8, { maxWidth: skW - 5 });
  });
  y += skH + 4;

  // Coverage bar
  panel(contentX, y, contentW, 15);
  setFont('normal', 7.5, MUTED);
  doc.text('Staff reporting coverage', contentX + 3, y + 5);
  setFont('bold', 7.5, INK);
  doc.text(`${usersReported} of ${usersTotal} staff submitted activity (${compliance}%)`, rightX - 3, y + 5, {
    align: 'right',
  });
  const barX = contentX + 3;
  const barY = y + 7.2;
  const barW = contentW - 6;
  doc.setFillColor(...LINE);
  doc.roundedRect(barX, barY, barW, 2.4, 1, 1, 'F');
  doc.setFillColor(...(compliance >= 80 ? SUCCESS : compliance >= 50 ? WARNING : DANGER));
  doc.roundedRect(barX, barY, Math.max(1, (barW * Math.min(100, compliance)) / 100), 2.4, 1, 1, 'F');
  setFont('normal', 6.8, FAINT);
  doc.text(
    usersNot > 0
      ? `${usersNot} staff member${usersNot === 1 ? '' : 's'} did not submit any checks or defects in this period`
      : 'Every expected staff member submitted at least one check or defect this period',
    contentX + 3,
    y + 13
  );
  y += 15;

  // ======================================================================
  // Trend (fills the rest of page 1 when room allows), then comparison, defects, actions
  // ======================================================================
  y += 4;
  ensureSpace(76);
  sectionLabel('2 - Trend: checks, defects reported & resolved (last 4 months)');
  const legend: Array<{ c: RGB; t: string }> = [
    { c: BLUE, t: 'Checks' },
    { c: WARNING, t: 'Defects reported' },
    { c: SUCCESS, t: 'Defects resolved' },
  ];
  let lx = contentX;
  legend.forEach((item) => {
    doc.setFillColor(...item.c);
    doc.roundedRect(lx, y - 2.2, 2.8, 2.8, 0.5, 0.5, 'F');
    setFont('normal', 7.5, MUTED);
    doc.text(item.t, lx + 4.2, y);
    lx += doc.getTextWidth(item.t) + 12;
  });
  y += 4;

  const trend =
    input.trend && input.trend.length
      ? input.trend.slice(-4)
      : [{ month: monthLabel, checks, defectsReported: reported, defectsResolved: resolved }];
  const chartX = contentX;
  const chartY = y;
  const chartW = contentW;
  const chartH = 52;
  const plotLeft = chartX + 10;
  const plotRight = chartX + chartW - 4;
  const plotTop = chartY + 5;
  const plotBottom = chartY + chartH - 8;
  panel(chartX, chartY, chartW, chartH, [251, 253, 255]);
  const maxVal = Math.max(5, ...trend.map((p) => Math.max(p.checks, p.defectsReported, p.defectsResolved)));
  const step = maxVal <= 10 ? 2 : maxVal <= 25 ? 5 : maxVal <= 60 ? 10 : maxVal <= 150 ? 25 : 50;
  const yMax = Math.ceil(maxVal / step) * step;
  for (let v = 0; v <= yMax; v += step) {
    const yy = plotBottom - (v / yMax) * (plotBottom - plotTop);
    doc.setDrawColor(232, 234, 238);
    doc.setLineWidth(0.15);
    doc.line(plotLeft, yy, plotRight, yy);
    setFont('normal', 6.3, FAINT);
    doc.text(String(v), plotLeft - 1.5, yy + 0.9, { align: 'right' });
  }
  const groupW = (plotRight - plotLeft) / trend.length;
  const bw = Math.min(7, groupW / 5);
  trend.forEach((p, idx) => {
    const groupLeft = plotLeft + idx * groupW;
    const clusterW = bw * 3 + 1.6;
    const startX = groupLeft + (groupW - clusterW) / 2;
    const bars: Array<{ v: number; c: RGB }> = [
      { v: p.checks, c: BLUE },
      { v: p.defectsReported, c: WARNING },
      { v: p.defectsResolved, c: SUCCESS },
    ];
    bars.forEach((b, bi) => {
      const h = Math.max(0.8, (b.v / yMax) * (plotBottom - plotTop));
      const bx = startX + bi * (bw + 0.8);
      const by = plotBottom - h;
      doc.setFillColor(...b.c);
      doc.roundedRect(bx, by, bw, h, 0.6, 0.6, 'F');
      if (b.v > 0) {
        setFont('normal', 5.8, MUTED);
        doc.text(String(Math.round(b.v)), bx + bw / 2, by - 1, { align: 'center' });
      }
    });
    setFont('bold', 7, BODY);
    doc.text(sanitizeText(p.month).slice(0, 3), groupLeft + groupW / 2, chartY + chartH - 2.5, { align: 'center' });
  });
  y += chartH + 8;

  // Month-on-month comparison table
  ensureSpace(48);
  sectionLabel(`Month-on-month comparison  |  ${prevLabel} vs ${monthLabel}`);
  const changeCell = (good: boolean, text: string) => ({ content: text, styles: { textColor: good ? SUCCESS : DANGER, fontStyle: 'bold' as const } });
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Metric', prevLabel, monthLabel, 'Change']],
    body: [
      ['Checks completed', String(prevChecks), String(checks), changeCell(checks >= prevChecks, formatPercentChange(checks, prevChecks))],
      ['Defects reported', String(prevReported), String(reported), changeCell(reported <= prevReported, formatPercentChange(reported, prevReported))],
      ['Defects resolved', String(prevResolved), String(resolved), changeCell(resolved >= prevResolved, formatPercentChange(resolved, prevResolved))],
      [
        'Staff compliance',
        pct(previousCompliance),
        `${compliance}%`,
        complianceDelta === null
          ? { content: 'N/A', styles: { textColor: MUTED } }
          : changeCell(complianceDelta >= 0, `${signed(complianceDelta)}pp`),
      ],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right' },
    },
  });
  y = lastTableY() + 9;

  // Section 3 — Open defects
  ensureSpace(40);
  sectionLabel('3 - Open defects requiring action');
  const { rows: openRows, overflowCount } = prepareOpenDefectRowsForReport(input.openDefectsList || []);
  if (!openRows.length) {
    ensureSpace(12);
    panel(contentX, y, contentW, 9, SUCCESS_TINT, SUCCESS);
    setFont('bold', 8.5, SUCCESS);
    doc.text('No open defects at month-end', contentX + 4, y + 5.7);
    y += 14;
  } else {
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Vehicle', 'Defect description', 'Raised', 'Days open', 'Priority', 'Status']],
      body: openRows.map((row) => [
        sanitizeText(row.vehicle),
        sanitizeText(row.description),
        sanitizeText(row.raised),
        row.daysOpen === undefined || row.daysOpen === null ? '-' : `${row.daysOpen}d`,
        row.priority === 'critical' ? 'Critical' : 'Standard',
        row.status === 'open' ? 'Open' : 'Resolved',
      ]),
      styles: { ...tableDefaults.styles, valign: 'top' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 24 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20 },
        3: { cellWidth: 16, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 16, halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === 4) {
          const isCritical = String(data.cell.raw).toLowerCase() === 'critical';
          data.cell.styles.fillColor = isCritical ? DANGER_TINT : WARNING_TINT;
          data.cell.styles.textColor = isCritical ? [160, 48, 48] : WARNING_TEXT;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.column.index === 5) {
          const isOpen = String(data.cell.raw).toLowerCase() === 'open';
          data.cell.styles.fillColor = isOpen ? WARNING_TINT : SUCCESS_TINT;
          data.cell.styles.textColor = isOpen ? WARNING_TEXT : SUCCESS;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.column.index === 3) {
          const days = Number(String(data.cell.raw).replace('d', ''));
          if (Number.isFinite(days) && days >= 14) data.cell.styles.textColor = DANGER;
        }
      },
    });
    y = lastTableY() + 3;
    if (overflowCount > 0) {
      setFont('normal', 7.5, FAINT);
      doc.text(`+ ${overflowCount} more open defect(s) not shown - see Defects in the dashboard`, contentX, y + 3);
      y += 6;
    }
    y += 5;
  }

  // Section 4 — Priority actions
  ensureSpace(50);
  sectionLabel('4 - Priority actions');
  const actions = buildPriorityActions(input);
  actions.forEach((action, idx) => {
    const tierColor: RGB = action.tier === 'immediate' ? DANGER : action.tier === 'this_week' ? [196, 122, 0] : SUCCESS;
    setFont('normal', 8.5, BODY);
    const detailLines = doc.splitTextToSize(sanitizeText(action.detail), contentW - 40) as string[];
    const rowH = Math.max(11, 5 + detailLines.length * 4.2);
    ensureSpace(rowH + 2);
    doc.setFillColor(...tierColor);
    doc.circle(contentX + 3.5, y + 3.2, 3, 'F');
    setFont('bold', 8, WHITE);
    doc.text(String(idx + 1), contentX + 3.5, y + 4.2, { align: 'center' });
    setFont('bold', 8, tierColor);
    doc.text(sanitizeText(action.title).toUpperCase(), contentX + 9.5, y + 4.2);
    setFont('normal', 8.5, BODY);
    doc.text(detailLines, contentX + 36, y + 4.2);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(contentX, y + rowH - 1, rightX, y + rowH - 1);
    y += rowH + 1;
  });

  // ======================================================================
  // Staff activity + report details
  // ======================================================================
  y += 6;
  ensureSpace(90);
  sectionLabel(`5 - Staff check activity  |  ${monthLabel}`);
  setFont('normal', 8, MUTED);
  doc.text('Drivers and managers expected to complete vehicle checks.', contentX, y);
  y += 6;

  const hlW = (contentW - 4) / 2;
  const hlH = 18;
  panel(contentX, y, hlW, hlH);
  setFont('normal', 7, MUTED);
  doc.text('TOP INSPECTOR', contentX + 3, y + 5);
  setFont('bold', 11, INK);
  doc.text(sanitizeText(topName || '-'), contentX + 3, y + 11, { maxWidth: hlW - 6 });
  setFont('normal', 7.5, MUTED);
  doc.text(`${topChecks} inspection${topChecks === 1 ? '' : 's'} completed`, contentX + 3, y + 15.5);

  const hlX2 = contentX + hlW + 4;
  panel(hlX2, y, hlW, hlH, usersNot > 0 ? WARNING_TINT : SUCCESS_TINT, usersNot > 0 ? WARNING : SUCCESS);
  setFont('normal', 7, usersNot > 0 ? WARNING_TEXT : SUCCESS);
  doc.text('STAFF WITH NO CHECKS', hlX2 + 3, y + 5);
  setFont('bold', 14, usersNot > 0 ? WARNING_TEXT : SUCCESS);
  doc.text(String(usersWithoutChecks.length), hlX2 + 3, y + 11.5);
  setFont('normal', 7.5, usersNot > 0 ? WARNING_TEXT : SUCCESS);
  doc.text(
    usersWithoutChecks.length > 0 ? 'follow up this week' : 'all expected staff submitted checks',
    hlX2 + 3,
    y + 15.5
  );
  y += hlH + 7;

  setFont('bold', 9, INK);
  doc.text(`Staff who completed checks (${usersWithChecks.length})`, contentX, y);
  y += 3;
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Driver / manager', 'Checks', 'Defects raised', 'Last inspection']],
    body: usersWithChecks.length
      ? usersWithChecks.map((user) => [
          sanitizeText(titleCaseName(user.name)),
          String(user.checksCompleted),
          String(user.defectsRaised ?? 0),
          sanitizeText(user.lastInspection || '-'),
        ])
      : [[{ content: 'No staff completed checks this month', colSpan: 4, styles: { textColor: FAINT } }]],
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 24, halign: 'right', textColor: BLUE, fontStyle: 'bold' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 36 },
    },
  });
  y = lastTableY() + 9;

  ensureSpace(24);
  setFont('bold', 9, INK);
  doc.text(`No checks this month (${usersWithoutChecks.length})`, contentX, y);
  y += 3;
  const noCheckNames = usersWithoutChecks.map((u) => sanitizeText(titleCaseName(u.name)));
  const twoCol: Array<[string, string]> = [];
  for (let i = 0; i < noCheckNames.length; i += 2) {
    twoCol.push([noCheckNames[i], noCheckNames[i + 1] || '']);
  }
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Driver / manager', 'Driver / manager']],
    body: twoCol.length
      ? twoCol
      : [[{ content: 'All expected staff completed at least one check', colSpan: 2, styles: { textColor: SUCCESS } }]],
    columnStyles: { 0: { cellWidth: contentW / 2 }, 1: { cellWidth: contentW / 2 } },
  });
  y = lastTableY() + 9;

  // Report details
  ensureSpace(34);
  panel(contentX, y, contentW, 28);
  setFont('bold', 7.5, BLUE_DARK);
  doc.text('REPORT DETAILS', contentX + 4, y + 5.5);
  const details: Array<[string, string]> = [
    ['Company', companyName],
    ['Reporting period', monthLabel],
    ['Report reference', referenceId],
    ['Generated', generatedLabel],
    ['Prepared by', sanitizeText(input.generatedBy) || 'Fleet Track PRO'],
    ['Report version', `Fleet Track PRO ${REPORT_APP_VERSION}`],
  ];
  const dColW = contentW / 3;
  details.forEach((d, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = contentX + 4 + col * dColW;
    const top = y + 11 + row * 8;
    setFont('normal', 6.8, MUTED);
    doc.text(d[0], x, top);
    setFont('bold', 8, INK);
    doc.text(d[1], x, top + 3.8, { maxWidth: dColW - 6 });
  });
  y += 32;

  setFont('normal', 7, FAINT);
  const disclaimer = doc.splitTextToSize(
    'Figures are drawn from checks and defects recorded in Fleet Track PRO for the reporting period. This report supports operational review and does not replace statutory inspection, maintenance or record-keeping duties.',
    contentW
  ) as string[];
  ensureSpace(disclaimer.length * 3.6 + 2);
  doc.text(disclaimer, contentX, y);

  // ======================================================================
  // Footer on every page
  // ======================================================================
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p += 1) {
    doc.setPage(p);
    const fy = pageH - 12;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(contentX, fy - 4.5, rightX, fy - 4.5);
    setFont('normal', 7, MUTED);
    doc.text(`Confidential - prepared for ${companyName}  |  fleettrackpro.co.uk`, contentX, fy);
    doc.text(`Page ${p} of ${pageCount}`, rightX, fy, { align: 'right' });
    setFont('normal', 6.5, FAINT);
    doc.text(`Generated ${generatedLabel}  |  Ref ${referenceId}`, contentX, fy + 3.6);
    doc.text(`(c) ${input.generatedAt.getFullYear()} Fleet Track PRO`, rightX, fy + 3.6, { align: 'right' });
  }

  doc.setProperties({
    title: `${companyName} - Monthly fleet performance report - ${monthLabel}`,
    subject: 'Monthly fleet performance report',
    author: 'Fleet Track PRO',
    creator: 'Fleet Track PRO',
  });

  return doc;
}

export function exportAdminMonthlyCompanyReportPDF(
  input: MonthlyCompanyReportInput,
  options: PdfRenderOptions = {}
): void {
  const doc = renderReportDoc(input, options);
  doc.save(buildFilename(input));
}

export function buildAdminMonthlyCompanyReportPdfBytes(
  input: MonthlyCompanyReportInput,
  options: PdfRenderOptions = {}
): Uint8Array {
  const doc = renderReportDoc(input, options);
  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}
