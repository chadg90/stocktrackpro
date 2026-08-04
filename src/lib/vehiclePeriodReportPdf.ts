/**
 * Individual vehicle period report PDF (6 or 12 months).
 * Fleet Track PRO branded — matches inspection proof / dashboard theme.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getImageUrlFromApp } from '@/lib/getImageUrl';

const ACCENT: [number, number, number] = [10, 132, 255]; // #0A84FF
const BLACK: [number, number, number] = [15, 23, 42]; // slate-900
const BANNER: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [100, 116, 139]; // slate-500
const BODY_SAFE: [number, number, number] = [30, 41, 59]; // slate-800
const TABLE_HEAD: [number, number, number] = [30, 41, 59];
const DEFECT_HEAD: [number, number, number] = [185, 28, 28];
const STRIPE: [number, number, number] = [248, 250, 252];
const OK_GREEN: [number, number, number] = [22, 163, 74];
const WARN_AMBER: [number, number, number] = [217, 119, 6];
const BAD_RED: [number, number, number] = [185, 28, 28];
const MARGIN = 14;

export type PeriodMonths = 6 | 12;

export type VehiclePeriodVehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  mileage?: number | null;
  mot_expiry_date?: { toDate?: () => Date; seconds?: number } | string | Date | null;
  tax_expiry_date?: { toDate?: () => Date; seconds?: number } | string | Date | null;
  mot_status?: string;
  tax_status?: string;
};

export type VehiclePeriodInspection = {
  id: string;
  inspector_name?: string;
  inspected_at?: { toDate?: () => Date; seconds?: number } | string | Date | null;
  mileage?: number;
  overall_condition?: string;
  has_defect?: boolean;
};

export type VehiclePeriodDefect = {
  id: string;
  defect_type?: string;
  /** Stored on vehicle_defects as `severity` (legacy/alternate: defect_severity). */
  defect_severity?: string;
  severity?: string;
  /** Stored on vehicle_defects as `description` (legacy/alternate: defect_description). */
  defect_description?: string;
  description?: string;
  status?: string;
  reported_at?: { toDate?: () => Date; seconds?: number } | string | Date | null;
};

export type VehiclePeriodDocument = {
  id: string;
  type?: 'mot' | 'service' | 'other' | string;
  title?: string;
  document_date?: { toDate?: () => Date; seconds?: number } | string | Date | null;
  file_name?: string;
  content_type?: string;
  storage_path?: string;
  notes?: string;
};

function toDate(val: unknown): Date | null {
  if (val == null) return null;
  if (val instanceof Date) return Number.isNaN(val.getTime()) ? null : val;
  if (
    typeof val === 'object' &&
    val !== null &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (val as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date((val as { seconds: number }).seconds * 1000);
  }
  const d = new Date(val as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function prettyLabel(raw?: string | null): string {
  const s = (raw || '').toString().trim();
  if (!s) return '—';
  return s
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function defectSeverity(d: VehiclePeriodDefect): string {
  return prettyLabel(d.defect_severity || d.severity);
}

function defectDescription(d: VehiclePeriodDefect): string {
  const text = (d.defect_description || d.description || '').toString().trim();
  return text || '—';
}

function defectType(d: VehiclePeriodDefect): string {
  return prettyLabel(d.defect_type);
}

function statusLabel(raw?: string | null): string {
  return prettyLabel(raw);
}

function docTypeLabel(type?: string): string {
  if (type === 'mot') return 'MOT';
  if (type === 'service') return 'Service history';
  if (type === 'other') return 'Other';
  return type || 'Document';
}

function statusTone(raw?: string | null): [number, number, number] {
  const s = (raw || '').toLowerCase();
  if (!s || s === '—') return GRAY;
  if (
    s.includes('valid') ||
    s.includes('taxed') ||
    s.includes('pass') ||
    s.includes('ok') ||
    s.includes('good') ||
    s.includes('resolved') ||
    s.includes('closed')
  ) {
    return OK_GREEN;
  }
  if (
    s.includes('expir') ||
    s.includes('overdue') ||
    s.includes('fail') ||
    s.includes('untax') ||
    s.includes('critical') ||
    s.includes('open') ||
    s.includes('poor')
  ) {
    return BAD_RED;
  }
  if (s.includes('due') || s.includes('warn') || s.includes('medium') || s.includes('high')) {
    return WARN_AMBER;
  }
  return BODY_SAFE;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 16) {
    doc.addPage();
    return 18;
  }
  return y;
}

function sectionHeading(doc: jsPDF, title: string, y: number, minFollow = 26): number {
  const pageW = doc.internal.pageSize.getWidth();
  y = ensureSpace(doc, y, minFollow);
  doc.setFillColor(...BLACK);
  doc.roundedRect(MARGIN, y - 3.5, pageW - MARGIN * 2, 8, 1.2, 1.2, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(MARGIN, y - 3.5, 2.2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGIN + 5.5, y + 1.8);
  doc.setTextColor(...BLACK);
  return y + 9;
}

function mutedNote(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...GRAY);
  const pageW = doc.internal.pageSize.getWidth();
  const lines = doc.splitTextToSize(text, pageW - MARGIN * 2);
  doc.text(lines, MARGIN, y);
  return y + lines.length * 4.2 + 4;
}

async function imageUrlToDataUrl(url: string): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG' } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const format: 'JPEG' | 'PNG' = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    if (!dataUrl) return null;
    return { dataUrl, format };
  } catch {
    return null;
  }
}

async function loadBrandLogo(): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  const candidates = ['/logo-white.png', '/report-logo-uploaded.png', '/logo.png'];
  for (const path of candidates) {
    const img = await imageUrlToDataUrl(path);
    if (img) return img;
  }
  return null;
}

export function getPeriodBounds(months: PeriodMonths, end: Date = new Date()): { start: Date; end: Date } {
  const endDate = new Date(end);
  const start = new Date(endDate);
  start.setMonth(start.getMonth() - months);
  return { start, end: endDate };
}

function drawKpiCards(
  doc: jsPDF,
  y: number,
  cards: Array<{ label: string; value: string; tone?: [number, number, number] }>
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const gap = 3.5;
  const cardW = (pageW - MARGIN * 2 - gap * (cards.length - 1)) / cards.length;
  const cardH = 16;
  y = ensureSpace(doc, y, cardH + 4);

  cards.forEach((card, i) => {
    const x = MARGIN + i * (cardW + gap);
    doc.setFillColor(...STRIPE);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardW, cardH, 1.8, 1.8, 'FD');
    doc.setFillColor(...ACCENT);
    doc.rect(x, y, 1.6, cardH, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(card.label, x + 4.5, y + 5.5);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(card.tone || BLACK));
    doc.text(card.value, x + 4.5, y + 12.5);
  });

  return y + cardH + 6;
}

function lastTableY(doc: jsPDF, fallback: number): number {
  return ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || fallback) + 7;
}

export async function buildVehiclePeriodReportPdf(args: {
  vehicle: VehiclePeriodVehicle;
  companyName?: string;
  months: PeriodMonths;
  inspections: VehiclePeriodInspection[];
  defects: VehiclePeriodDefect[];
  documents: VehiclePeriodDocument[];
}): Promise<{ blob: Blob; fileName: string }> {
  const { vehicle, companyName, months, inspections, defects, documents } = args;
  const { start, end } = getPeriodBounds(months);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const reg = (vehicle.registration || 'UNKNOWN').toUpperCase();
  const periodLabel = `Last ${months} months`;
  const periodRange = `${formatDate(start)} – ${formatDate(end)}`;
  const vehicleLabel = [vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—';
  const generated = formatDateTime(new Date());
  const logo = await loadBrandLogo();
  const openDefects = defects.filter((d) => {
    const s = (d.status || '').toLowerCase();
    return s !== 'resolved' && s !== 'closed' && s !== 'repaired';
  }).length;
  const inspectionsWithDefects = inspections.filter((i) => i.has_defect).length;

  // —— Header banner ——
  doc.setFillColor(...BANNER);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(0, 30, pageW, 2.2, 'F');

  if (logo) {
    try {
      doc.addImage(logo.dataUrl, logo.format, MARGIN, 6.5, 46, 13.5, undefined, 'FAST');
    } catch {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Fleet Track PRO', MARGIN, 13);
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Fleet Track PRO', MARGIN, 13);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(reg, pageW - MARGIN, 12, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Vehicle Period Report · ${periodLabel}`, pageW - MARGIN, 18.5, { align: 'right' });
  doc.text(periodRange, pageW - MARGIN, 23.5, { align: 'right' });

  let y = 38;

  // —— Intro strip ——
  doc.setFillColor(...STRIPE);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(MARGIN, y, pageW - MARGIN * 2, 13, 1.8, 1.8, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text(companyName || 'Fleet operator', MARGIN + 4, y + 5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(
    `${vehicleLabel} · ${inspections.length} inspection${inspections.length === 1 ? '' : 's'} · ${defects.length} defect${defects.length === 1 ? '' : 's'} (${openDefects} open)`,
    MARGIN + 4,
    y + 10
  );
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(`Generated ${generated}`, pageW - MARGIN - 4, y + 7.5, { align: 'right' });
  y += 18;

  // —— KPI cards ——
  y = drawKpiCards(doc, y, [
    { label: 'Inspections', value: String(inspections.length) },
    {
      label: 'With defects',
      value: String(inspectionsWithDefects),
      tone: inspectionsWithDefects > 0 ? BAD_RED : OK_GREEN,
    },
    {
      label: 'Open defects',
      value: String(openDefects),
      tone: openDefects > 0 ? BAD_RED : OK_GREEN,
    },
    {
      label: 'Documents',
      value: String(documents.length),
    },
  ]);

  // —— Vehicle summary (compact 2-column) ——
  y = sectionHeading(doc, 'Vehicle summary', y, 36);
  const motExpiry = formatDate(toDate(vehicle.mot_expiry_date));
  const taxExpiry = formatDate(toDate(vehicle.tax_expiry_date));
  const motStatus = prettyLabel(vehicle.mot_status);
  const taxStatus = prettyLabel(vehicle.tax_status);
  const mileageText =
    vehicle.mileage != null ? `${Number(vehicle.mileage).toLocaleString()} miles` : '—';

  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: {
      fontSize: 8.5,
      textColor: BODY_SAFE,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 },
      lineColor: [241, 245, 249],
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', textColor: GRAY },
      1: { cellWidth: 60 },
      2: { cellWidth: 28, fontStyle: 'bold', textColor: GRAY },
      3: { cellWidth: 'auto' },
    },
    margin: { left: MARGIN, right: MARGIN },
    body: [
      ['Company', companyName || '—', 'Registration', reg],
      ['Vehicle', vehicleLabel, 'Mileage', mileageText],
      ['Period', `${periodLabel}`, 'Range', periodRange],
      ['MOT expiry', motExpiry, 'MOT status', motStatus],
      ['Tax expiry', taxExpiry, 'Tax status', taxStatus],
    ],
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      if (data.column.index === 3 && data.row.index === 3) {
        data.cell.styles.textColor = statusTone(vehicle.mot_status);
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 3 && data.row.index === 4) {
        data.cell.styles.textColor = statusTone(vehicle.tax_status);
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = lastTableY(doc, y);

  // —— Inspections ——
  y = sectionHeading(doc, `Inspections (${inspections.length})`, y, 30);
  if (inspections.length === 0) {
    y = mutedNote(doc, 'No inspections recorded in this period.', y);
  } else {
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['Date', 'Inspector', 'Mileage', 'Condition', 'Defects']],
      headStyles: {
        fillColor: TABLE_HEAD,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2.5,
      },
      bodyStyles: { fontSize: 8, textColor: BODY_SAFE, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: STRIPE },
      margin: { left: MARGIN, right: MARGIN },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 40 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { cellWidth: 'auto' },
      },
      body: inspections.map((row) => [
        formatDateTime(toDate(row.inspected_at)),
        row.inspector_name || '—',
        row.mileage != null ? Number(row.mileage).toLocaleString() : '—',
        prettyLabel(row.overall_condition),
        row.has_defect ? 'Yes' : 'No',
      ]),
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === 3) {
          data.cell.styles.textColor = statusTone(String(data.cell.raw || ''));
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.column.index === 4) {
          const yes = String(data.cell.raw || '').toLowerCase() === 'yes';
          data.cell.styles.textColor = yes ? BAD_RED : OK_GREEN;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = lastTableY(doc, y);
  }

  // —— Defects ——
  y = sectionHeading(doc, `Defects (${defects.length})`, y, 32);
  if (defects.length === 0) {
    y = mutedNote(doc, 'No defects reported in this period.', y);
  } else {
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['Date', 'Type', 'Severity', 'Status', 'Description']],
      headStyles: {
        fillColor: DEFECT_HEAD,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2.5,
      },
      bodyStyles: { fontSize: 8, textColor: BODY_SAFE, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      margin: { left: MARGIN, right: MARGIN },
      columnStyles: {
        0: { cellWidth: 34 },
        1: { cellWidth: 26 },
        2: { cellWidth: 22 },
        3: { cellWidth: 24 },
        4: { cellWidth: 'auto' },
      },
      body: defects.map((row) => [
        formatDateTime(toDate(row.reported_at)),
        defectType(row),
        defectSeverity(row),
        statusLabel(row.status),
        defectDescription(row),
      ]),
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === 2 || data.column.index === 3) {
          data.cell.styles.textColor = statusTone(String(data.cell.raw || ''));
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = lastTableY(doc, y);
  }

  // —— Documents ——
  y = sectionHeading(doc, `Uploaded documents (${documents.length})`, y, 24);
  if (documents.length === 0) {
    y = mutedNote(
      doc,
      'No MOT, service or other documents dated in this period. Upload documents on this page to include them in future reports.',
      y
    );
  } else {
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['Date', 'Type', 'Title', 'File', 'Notes']],
      headStyles: {
        fillColor: TABLE_HEAD,
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2.5,
      },
      bodyStyles: { fontSize: 8, textColor: BODY_SAFE, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: STRIPE },
      margin: { left: MARGIN, right: MARGIN },
      body: documents.map((row) => [
        formatDate(toDate(row.document_date)),
        docTypeLabel(row.type),
        row.title || '—',
        row.file_name || '—',
        row.notes || '—',
      ]),
    });
    y = lastTableY(doc, y);

    const imageDocs = documents.filter(
      (d) => d.content_type?.startsWith('image/') && d.storage_path
    );
    if (imageDocs.length > 0) {
      y = sectionHeading(doc, 'Document image previews', y, 58);
      for (const item of imageDocs) {
        y = ensureSpace(doc, y, 58);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLACK);
        doc.text(
          `${docTypeLabel(item.type)} · ${item.title || item.file_name || 'Document'} · ${formatDate(toDate(item.document_date))}`,
          MARGIN,
          y
        );
        y += 3;
        const url = await getImageUrlFromApp(item.storage_path);
        if (url) {
          const img = await imageUrlToDataUrl(url);
          if (img) {
            try {
              doc.setDrawColor(226, 232, 240);
              doc.roundedRect(MARGIN, y, 82, 47, 2, 2, 'S');
              doc.addImage(img.dataUrl, img.format, MARGIN + 1, y + 1, 80, 45, undefined, 'FAST');
              y += 52;
            } catch {
              y = mutedNote(doc, '(Preview could not be embedded)', y + 4);
            }
          } else {
            y = mutedNote(doc, '(Preview unavailable)', y + 4);
          }
        } else {
          y = mutedNote(doc, '(Preview unavailable)', y + 4);
        }
      }
    }
  }

  // —— Closing note ——
  y = ensureSpace(doc, y, 16);
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, pageW - MARGIN, y);
  y += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  const disclaimer =
    'Fleet Track PRO — management evidence for operator records; not a statutory roadworthiness certificate, MOT pass, or DVSA inspection outcome. Contents reflect system records at generation time.';
  const lines = doc.splitTextToSize(disclaimer, pageW - MARGIN * 2);
  doc.text(lines, MARGIN, y);

  // —— Page footers ——
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...ACCENT);
    doc.rect(0, pageH - 2.5, pageW, 2.5, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Fleet Track PRO · ${reg} · ${periodLabel} · Page ${i} of ${pageCount}`,
      MARGIN,
      pageH - 5.5
    );
    doc.text('www.fleettrackpro.co.uk', pageW - MARGIN, pageH - 5.5, { align: 'right' });
  }

  const safeReg = reg.replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `FTP-Vehicle-Report-${safeReg}-${months}m.pdf`;
  const blob = doc.output('blob');
  return { blob, fileName };
}

/** Build and immediately download the period report PDF. */
export async function exportVehiclePeriodReportPdf(args: {
  vehicle: VehiclePeriodVehicle;
  companyName?: string;
  months: PeriodMonths;
  inspections: VehiclePeriodInspection[];
  defects: VehiclePeriodDefect[];
  documents: VehiclePeriodDocument[];
}): Promise<void> {
  const { blob, fileName } = await buildVehiclePeriodReportPdf(args);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
