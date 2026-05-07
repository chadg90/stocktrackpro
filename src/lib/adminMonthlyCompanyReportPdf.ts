import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  comparison?: {
    previousMonthLabel: string;
    checksDelta: number;
    defectsReportedDelta: number;
    defectsResolvedDelta: number;
    resolutionRateDelta: number | null;
  } | null;
  trend?: ReportTrendPoint[];
  openDefectsList?: OpenDefectRow[];
  summaryNote?: string;
};

const BLUE: [number, number, number] = [26, 86, 219];
const SUCCESS: [number, number, number] = [26, 122, 58];
const WARNING: [number, number, number] = [230, 168, 23];
const DANGER: [number, number, number] = [217, 64, 64];
const BLACK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [107, 114, 128];
const LIGHT_GRAY: [number, number, number] = [229, 231, 235];

type PdfRenderOptions = {
  logoDataUrl?: string;
};

function buildReferenceId(input: MonthlyCompanyReportInput): string {
  const stamp = input.generatedAt.toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  return `STP-MONTHLY-${stamp}`;
}

function buildFilename(input: MonthlyCompanyReportInput): string {
  const filenameCompany = input.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filenameMonth = input.monthLabel.toLowerCase().replace(/\s+/g, '-');
  return `stp-monthly-report-${filenameCompany}-${filenameMonth}.pdf`;
}

function renderReportDoc(input: MonthlyCompanyReportInput, options: PdfRenderOptions = {}): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 8;
  const contentX = 12;
  const contentW = pageWidth - 24;
  const referenceId = buildReferenceId(input);
  let y = 12;

  // Header
  const logoX = contentX;
  const logoY = y + 1;
  doc.setFillColor(...BLUE);
  doc.roundedRect(logoX, logoY, 10, 10, 1.8, 1.8, 'F');
  const sq = 1.8;
  const gap = 1.2;
  const gx = logoX + 2.4;
  const gy = logoY + 2.4;
  doc.setFillColor(255, 255, 255);
  doc.rect(gx, gy, sq, sq, 'F');
  doc.setFillColor(220, 232, 255);
  doc.rect(gx + sq + gap, gy, sq, sq, 'F');
  doc.rect(gx, gy + sq + gap, sq, sq, 'F');
  doc.setFillColor(180, 210, 255);
  doc.rect(gx + sq + gap, gy + sq + gap, sq, sq, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BLACK);
  doc.setFontSize(10);
  doc.text('Stock Track PRO', logoX + 13, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('Monthly fleet performance report', logoX + 13, y + 9.5);

  const rightX = contentX + contentW - 2;
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  doc.text(input.companyName, rightX, y + 3.5, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(input.monthLabel, rightX, y + 7, { align: 'right' });
  doc.text(`Ref ${referenceId}`, rightX, y + 10.3, { align: 'right' });
  doc.text(input.generatedAt.toLocaleDateString('en-GB'), rightX, y + 13.6, { align: 'right' });

  y += 17;
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.2);
  doc.line(contentX, y, contentX + contentW, y);
  y += 5;

  // Compliance alert bar
  const critical = Math.round(input.criticalOpenDefects);
  const alertDanger = critical > 0;
  const alertFill: [number, number, number] = alertDanger ? [252, 232, 232] : [255, 243, 205];
  const alertBorder = alertDanger ? DANGER : WARNING;
  const alertText = alertDanger ? [122, 26, 26] as [number, number, number] : [122, 74, 0] as [number, number, number];
  doc.setFillColor(...alertFill);
  doc.setDrawColor(...alertBorder);
  doc.roundedRect(contentX, y, contentW, 10, 1.6, 1.6, 'FD');
  doc.setFillColor(...alertBorder);
  doc.circle(contentX + 3, y + 5, 1.2, 'F');
  doc.setTextColor(...alertText);
  doc.setFontSize(8.8);
  doc.text(
    alertDanger
      ? `Action required - ${critical} critical defect(s) open at month-end`
      : 'All critical defects resolved',
    contentX + 6,
    y + 5.6
  );
  doc.setFontSize(8);
  doc.text(
    alertDanger ? 'Compliance risk: high - See section 3' : 'Compliance risk: amber - monitor open defects',
    contentX + contentW - 2,
    y + 5.6,
    { align: 'right' }
  );
  y += 14;

  const sectionLabel = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(text.toUpperCase(), contentX, y);
    y += 5;
  };

  // Section 1 - KPI cards
  sectionLabel(`1 - Key performance indicators · ${input.monthLabel}`);
  const cardGap = 3;
  const cardW = (contentW - cardGap * 3) / 4;
  const cardH = 18;
  const cards = [
    { label: 'Checks completed', value: Math.round(input.checksCompleted), delta: input.comparison?.checksDelta ?? 0, betterWhenUp: true },
    { label: 'Defects reported', value: Math.round(input.defectsReported), delta: input.comparison?.defectsReportedDelta ?? 0, betterWhenUp: false },
    { label: 'Defects resolved', value: Math.round(input.defectsResolved), delta: input.comparison?.defectsResolvedDelta ?? 0, betterWhenUp: true },
    { label: 'Critical open defects', value: critical, delta: 0, betterWhenUp: false, critical: true },
  ];
  cards.forEach((card, i) => {
    const x = contentX + i * (cardW + cardGap);
    const criticalCard = Boolean(card.critical && card.value > 0);
    doc.setFillColor(...(criticalCard ? ([252, 232, 232] as [number, number, number]) : ([249, 250, 251] as [number, number, number])));
    doc.setDrawColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, cardW, cardH, 1.4, 1.4, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(...(criticalCard ? ([160, 48, 48] as [number, number, number]) : MUTED));
    doc.text(card.label, x + 2.2, y + 4.4);
    doc.setFontSize(14);
    doc.setTextColor(...(criticalCard ? DANGER : BLACK));
    doc.text(String(card.value), x + 2.2, y + 10.8);
    if (!card.critical) {
      const up = card.delta >= 0;
      const good = card.betterWhenUp ? up : !up;
      doc.setFontSize(7.5);
      doc.setTextColor(...(good ? SUCCESS : DANGER));
      doc.text(`${up ? '↑' : '↓'} ${Math.abs(Math.round(card.delta))}`, x + 2.2, y + 15.4);
    }
  });
  y += cardH + 10;

  // Section 2 - trend
  sectionLabel('2 - Trend: checks, defects reported & resolved');
  const legendY = y;
  const legend = [
    { c: BLUE, t: 'Checks' },
    { c: WARNING, t: 'Defects reported' },
    { c: SUCCESS, t: 'Defects resolved' },
  ];
  let lx = contentX;
  legend.forEach((item) => {
    doc.setFillColor(...item.c);
    doc.rect(lx, legendY, 2.6, 2.6, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(item.t, lx + 4, legendY + 2.2);
    lx += 35;
  });
  y += 6;

  const trend = input.trend && input.trend.length ? input.trend.slice(-4) : [{ month: input.monthLabel, checks: input.checksCompleted, defectsReported: input.defectsReported, defectsResolved: input.defectsResolved }];
  const chartX = contentX;
  const chartY = y;
  const chartW = contentW;
  const chartH = 46;
  doc.setDrawColor(...LIGHT_GRAY);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.2, 1.2, 'S');
  const maxVal = Math.max(5, ...trend.map((p) => Math.max(p.checks, p.defectsReported, p.defectsResolved)));
  const step = 5;
  const yMax = Math.ceil(maxVal / step) * step;
  for (let v = 0; v <= yMax; v += step) {
    const yy = chartY + chartH - 5 - (v / yMax) * (chartH - 10);
    doc.setDrawColor(230, 232, 236);
    doc.setLineWidth(0.15);
    doc.line(chartX + 5, yy, chartX + chartW - 2, yy);
    doc.setTextColor(...MUTED);
    doc.setFontSize(6.5);
    doc.text(String(v), chartX + 1.5, yy + 1, { align: 'right' });
  }
  const groupW = (chartW - 14) / trend.length;
  trend.forEach((p, idx) => {
    const gxBase = chartX + 7 + idx * groupW;
    const bw = Math.min(4, groupW / 5);
    const barVals = [
      { v: p.checks, c: BLUE },
      { v: p.defectsReported, c: WARNING },
      { v: p.defectsResolved, c: SUCCESS },
    ];
    barVals.forEach((b, bi) => {
      const h = (b.v / yMax) * (chartH - 12);
      const bx = gxBase + bi * (bw + 0.8);
      const by = chartY + chartH - 5 - h;
      doc.setFillColor(...b.c);
      doc.roundedRect(bx, by, bw, h, 0.6, 0.6, 'F');
    });
    doc.setTextColor(...MUTED);
    doc.setFontSize(7);
    doc.text(p.month.slice(0, 3), gxBase + bw + 1.2, chartY + chartH - 1.5, { align: 'center' });
  });
  y += chartH + 8;

  // Section 3 - open defects
  sectionLabel('3 - Open defects requiring action');
  const openRows = (input.openDefectsList || []).filter((d) => d.status === 'open');
  if (!openRows.length) {
    doc.setFillColor(232, 245, 233);
    doc.setDrawColor(...SUCCESS);
    doc.roundedRect(contentX, y, contentW, 8, 1.4, 1.4, 'FD');
    doc.setTextColor(...SUCCESS);
    doc.setFontSize(8.5);
    doc.text('No open defects at month-end', contentX + 3, y + 5.2);
    y += 12;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Vehicle', 'Defect description', 'Date raised', 'Priority', 'Status']],
      body: openRows.map((row) => [
        row.vehicle,
        row.description,
        row.raised,
        row.priority === 'critical' ? 'Critical' : 'Standard',
        row.status === 'open' ? 'Open' : 'Resolved',
      ]),
      margin: { left: contentX, right: contentX },
      styles: { fontSize: 8, textColor: BLACK, lineColor: LIGHT_GRAY, lineWidth: 0.12 },
      headStyles: { fillColor: [249, 250, 251], textColor: [75, 85, 99], fontStyle: 'normal' },
      columnStyles: { 0: { fontStyle: 'bold' } },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === 3) {
          const criticalBadge = String(data.cell.raw).toLowerCase() === 'critical';
          data.cell.styles.fillColor = criticalBadge ? [252, 232, 232] : [255, 243, 205];
          data.cell.styles.textColor = criticalBadge ? [160, 48, 48] : [122, 74, 0];
        }
        if (data.column.index === 4) {
          const openBadge = String(data.cell.raw).toLowerCase() === 'open';
          data.cell.styles.fillColor = openBadge ? [255, 243, 205] : [232, 245, 233];
          data.cell.styles.textColor = openBadge ? [122, 74, 0] : [26, 122, 58];
        }
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
  }

  // Section 4 - actions
  if (y > pageHeight - 55) {
    doc.addPage();
    y = 14;
  }
  sectionLabel('4 - Recommended actions');
  const actions: string[] = [];
  if (critical > 0) {
    actions.push(`Resolve ${critical} critical defect(s) immediately. Confirm repair and close in Stock Track PRO before further vehicle use.`);
  }
  if ((input.comparison?.checksDelta ?? 0) > 0) {
    actions.push(`Maintain inspection frequency. ${input.monthLabel}'s ${Math.round(input.checksCompleted)} checks (+${Math.round(input.comparison?.checksDelta ?? 0)} on ${input.comparison?.previousMonthLabel || 'last month'}) is a strong result.`);
  } else {
    actions.push(`Inspection frequency dropped by ${Math.abs(Math.round(input.comparison?.checksDelta ?? 0))} this month. Ensure all drivers are completing checks via the Stock Track PRO app.`);
  }
  if ((input.resolutionRate ?? 0) > 100) {
    actions.push(`Monitor resolution backlog. The ${Math.round(input.resolutionRate || 0)}% resolution rate reflects clearance of prior-month defects - aim to keep open defects below 3.`);
  } else {
    actions.push('Review unresolved defects weekly and assign ownership with due dates to prevent carry-over.');
  }
  actions.slice(0, 3).forEach((action, idx) => {
    const rowY = y + idx * 12.5;
    doc.setFillColor(...BLUE);
    doc.circle(contentX + 3.5, rowY + 2.4, 2.8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(String(idx + 1), contentX + 3.5, rowY + 3, { align: 'center' });
    doc.setTextColor(...BLACK);
    doc.setFontSize(8.2);
    const wrapped = doc.splitTextToSize(action, contentW - 10);
    doc.text(wrapped, contentX + 8.5, rowY + 3);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(contentX, rowY + 8.8, contentX + contentW, rowY + 8.8);
  });
  y += 40;

  // Footer
  const footerY = Math.min(pageHeight - 12, y + 4);
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(contentX, footerY - 4, contentX + contentW, footerY - 4);
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text('Confidential - prepared for operational review · stocktrackpro.co.uk', contentX, footerY);
  doc.text('© 2026 Stock Track PRO Ltd', contentX + contentW, footerY, { align: 'right' });

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
