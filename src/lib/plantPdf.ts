/**
 * Plant & Machinery Module — PDF generation
 * Produces a compliant inspection certificate for LOLER, PUWER, Service, and Hire Check.
 * Uses jsPDF + jspdf-autotable (already a project dependency).
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PlantInspection } from '@/types/plant';

// Brand colours
const BLACK: [number, number, number] = [0, 0, 0];
const ACCENT: [number, number, number] = [66, 133, 244];   // blue
const BODY_GRAY: [number, number, number] = [51, 51, 51];
const LIGHT_GRAY: [number, number, number] = [240, 240, 240];
const RED: [number, number, number] = [220, 38, 38];
const GREEN: [number, number, number] = [22, 163, 74];
const YELLOW: [number, number, number] = [202, 138, 4];

function formatDate(val: unknown): string {
  if (!val) return '—';
  try {
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(val);
  }
}

function titleForType(type: string): string {
  switch (type) {
    case 'LOLER': return 'LOLER Thorough Examination Report';
    case 'PUWER': return 'PUWER Inspection Report';
    case 'service': return 'Plant Service Record';
    case 'hire_check': return 'Hire Equipment Condition Report';
    default: return 'Plant Inspection Report';
  }
}

function regulationNote(type: string): string {
  switch (type) {
    case 'LOLER':
      return 'Produced in accordance with the Lifting Operations and Lifting Equipment Regulations 1998 (LOLER). ' +
        'This report constitutes the written record of thorough examination required under Regulation 10.';
    case 'PUWER':
      return 'Produced in accordance with the Provision and Use of Work Equipment Regulations 1998 (PUWER). ' +
        'This inspection record fulfils the periodic inspection requirement under Regulation 6.';
    case 'service':
      return 'Plant service record. Retain as part of the equipment maintenance history.';
    case 'hire_check':
      return 'Hire equipment condition report. Both parties should retain a signed copy.';
    default:
      return '';
  }
}

function outcomeColor(outcome: string): [number, number, number] {
  if (outcome === 'pass') return GREEN;
  if (outcome === 'fail') return RED;
  return YELLOW;
}

function defectSeverityColor(severity: string): [number, number, number] {
  if (severity === 'immediate') return RED;
  if (severity === 'monitor') return YELLOW;
  return BODY_GRAY;
}

export function generatePlantInspectionPdf(inspection: PlantInspection): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ── Header band ──────────────────────────────────────────────
  pdf.setFillColor(...BLACK);
  pdf.rect(0, 0, pageW, 30, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Stock Track PRO', margin, 12);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Plant & Machinery Compliance', margin, 19);

  pdf.setTextColor(...ACCENT);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(titleForType(inspection.inspection_type), pageW - margin, 12, { align: 'right' });

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Ref: ${inspection.reference_number}`, pageW - margin, 19, { align: 'right' });
  pdf.text(`Issued: ${formatDate(new Date().toISOString())}`, pageW - margin, 25, { align: 'right' });

  // ── Outcome badge ─────────────────────────────────────────────
  const outcomeY = 38;
  const outcomeLabel = inspection.outcome.toUpperCase();
  const [or, og, ob] = outcomeColor(inspection.outcome);
  pdf.setFillColor(or, og, ob);
  pdf.roundedRect(margin, outcomeY - 5, 40, 12, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(outcomeLabel, margin + 20, outcomeY + 2.5, { align: 'center' });

  // ── Section: Machine Details ──────────────────────────────────
  let y = 60;

  pdf.setTextColor(...ACCENT);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MACHINE DETAILS', margin, y);
  y += 3;
  pdf.setDrawColor(...ACCENT);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + contentW, y);
  y += 6;

  const machineRows: [string, string][] = [
    ['Machine Name', inspection.machine_name],
    ['Asset Number', inspection.machine_asset_number],
    ['Regulation Type', inspection.regulation_type],
    ['Inspection Type', inspection.inspection_type],
  ];

  autoTable(pdf, {
    startY: y,
    head: [],
    body: machineRows,
    theme: 'plain',
    styles: { fontSize: 9, textColor: BODY_GRAY, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: BLACK, cellWidth: 45 },
      1: { textColor: BODY_GRAY },
    },
    margin: { left: margin, right: margin },
  });

  y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ── Section: Inspection Details ───────────────────────────────
  pdf.setTextColor(...ACCENT);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INSPECTION DETAILS', margin, y);
  y += 3;
  pdf.line(margin, y, margin + contentW, y);
  y += 6;

  const inspectionRows: [string, string][] = [
    ['Date of Inspection', formatDate(inspection.inspected_at as string)],
    ['Inspector Name', inspection.inspector_name],
    ['Qualification', inspection.inspector_qualification ?? '—'],
    ['Site', inspection.site_name ?? '—'],
    ['Next Inspection Due', formatDate(inspection.next_inspection_due as string)],
  ];

  autoTable(pdf, {
    startY: y,
    head: [],
    body: inspectionRows,
    theme: 'plain',
    styles: { fontSize: 9, textColor: BODY_GRAY, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: BLACK, cellWidth: 45 },
    },
    margin: { left: margin, right: margin },
  });

  y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ── Section: Notes ────────────────────────────────────────────
  if (inspection.notes) {
    pdf.setTextColor(...ACCENT);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTES', margin, y);
    y += 3;
    pdf.line(margin, y, margin + contentW, y);
    y += 5;

    pdf.setTextColor(...BODY_GRAY);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(inspection.notes, contentW);
    pdf.text(lines, margin, y);
    y += lines.length * 5 + 6;
  }

  // ── Section: Defects ──────────────────────────────────────────
  if (inspection.defects && inspection.defects.length > 0) {
    pdf.setTextColor(...ACCENT);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`DEFECTS IDENTIFIED (${inspection.defects.length})`, margin, y);
    y += 3;
    pdf.setDrawColor(220, 38, 38);
    pdf.line(margin, y, margin + contentW, y);
    pdf.setDrawColor(...ACCENT);
    y += 6;

    autoTable(pdf, {
      startY: y,
      head: [['Severity', 'Part', 'Description']],
      body: inspection.defects.map((d) => [d.severity, d.part_name, d.description]),
      theme: 'striped',
      headStyles: { fillColor: RED, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 8, textColor: BODY_GRAY, cellPadding: 2 },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          cellWidth: 28,
        },
        1: { cellWidth: 40 },
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          const severity = String(data.cell.raw);
          const [sr, sg, sb] = defectSeverityColor(severity);
          data.cell.styles.textColor = [sr, sg, sb];
        }
      },
      margin: { left: margin, right: margin },
    });

    y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // ── Section: Signature ────────────────────────────────────────
  // Reserve space for signature if we're close to bottom
  if (y > 230) {
    pdf.addPage();
    y = 20;
  }

  pdf.setTextColor(...ACCENT);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INSPECTOR DECLARATION', margin, y);
  y += 3;
  pdf.line(margin, y, margin + contentW, y);
  y += 8;

  pdf.setTextColor(...BODY_GRAY);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const declaration = 'I confirm that I have carried out this inspection in accordance with the relevant statutory requirements and that the information recorded in this report is accurate to the best of my knowledge.';
  const declLines = pdf.splitTextToSize(declaration, contentW);
  pdf.text(declLines, margin, y);
  y += declLines.length * 4 + 10;

  if (inspection.inspector_signature_url) {
    try {
      pdf.addImage(inspection.inspector_signature_url, 'PNG', margin, y, 60, 20);
      y += 24;
    } catch {
      // Skip signature image on error
    }
  } else {
    // Signature line placeholder
    pdf.setDrawColor(...BODY_GRAY);
    pdf.line(margin, y + 12, margin + 70, y + 12);
    pdf.setFontSize(7);
    pdf.text('Inspector Signature', margin, y + 17);
    pdf.line(margin + 90, y + 12, margin + 170, y + 12);
    pdf.text('Date', margin + 90, y + 17);
    y += 24;
  }

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
  pdf.text(inspection.inspector_name, margin, y);
  if (inspection.inspector_qualification) {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...BODY_GRAY);
    pdf.text(inspection.inspector_qualification, margin, y + 4);
  }

  // ── Regulation footer ─────────────────────────────────────────
  const footerNote = regulationNote(inspection.inspection_type);
  if (footerNote) {
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(...LIGHT_GRAY);
    pdf.rect(margin, pageH - 28, contentW, 20, 'F');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    const noteLines = pdf.splitTextToSize(footerNote, contentW - 6);
    pdf.text(noteLines, margin + 3, pageH - 22);
  }

  // ── Page numbers ──────────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Stock Track PRO — Plant & Machinery Compliance | ${inspection.reference_number} | Page ${i} of ${totalPages}`,
      pageW / 2,
      pdf.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  return pdf;
}

/** Download a plant inspection PDF in the browser */
export function downloadPlantInspectionPdf(inspection: PlantInspection): void {
  const pdf = generatePlantInspectionPdf(inspection);
  const filename = `${inspection.reference_number.replace(/[^A-Z0-9-]/gi, '_')}_${inspection.inspection_type}.pdf`;
  pdf.save(filename);
}
