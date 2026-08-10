/**
 * Per-inspection proof PDF for managers (NHS / compliance).
 * Includes photos, checklist results, defects, declaration.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resolveImageDataUrl, mapPool } from '@/lib/resolveImageDataUrl';
import {
  BLOOD_ORGAN_CHECK_LABELS,
  BLOOD_ORGAN_PHOTO_LABELS,
  BLOOD_ORGAN_SECTION_ORDER,
  BLOOD_ORGAN_SECTION_TITLES,
  CAR_VAN_WALKAROUND_LABELS,
  FLUID_STATUS_LABELS,
  FUEL_LEVEL_LABELS,
} from '@/lib/bloodOrganCheckLabels';
import {
  hasEncodedSignature,
  isSignatureStorageRef,
  signatureEncodedToPngDataUrl,
} from '@/lib/signaturePaths';
const ACCENT: [number, number, number] = [66, 133, 244];
const BLACK: [number, number, number] = [0, 0, 0];
const GRAY: [number, number, number] = [80, 80, 80];
const BODY_SAFE: [number, number, number] = [40, 40, 40];

export type InspectionProofVehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  company_name?: string;
};

export type InspectionProofDoc = {
  id: string;
  inspection_category?: string;
  inspector_name?: string;
  inspected_at?: { toDate?: () => Date; seconds?: number } | string | null;
  mileage?: number;
  overall_condition?: string;
  has_defect?: boolean;
  photo_urls?: Record<string, string | null | undefined>;
  check_results?: Record<
    string,
    {
      result?: string;
      fluid_status?: string;
      reason?: string;
      severity?: string;
      vehicle_status?: string;
      evidence?: { type?: string; url?: string };
    }
  >;
  sections?: Record<string, { status?: string; confirmed_at?: string; confirmed_by?: string }>;
  recorded_values?: { mileage?: number; fuel_level?: number; fuel_or_battery?: string; temperature?: string };
  declaration?: {
    items?: Record<string, boolean>;
    signature_paths?: string;
    confirmed_at?: string;
    confirmed_by?: string;
  };
  walkaround_declaration?: {
    items?: Record<string, boolean>;
    checklist_copy_version?: string;
  };
  defect_type?: string;
  defect_severity?: string;
  defect_description?: string;
  defects?: Array<{ defect_type?: string; defect_severity?: string; defect_description?: string }>;
  template_version?: string;
  inspection_template_id?: string;
};

function toDate(val: unknown): Date | null {
  if (val == null) return null;
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
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

function ensureSpace(doc: jsPDF, y: number, need: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + need > pageH - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

/** Fit image into a box without stretching (letterbox if needed). */
function fitInBox(
  maxW: number,
  maxH: number,
  natW: number,
  natH: number
): { w: number; h: number; ox: number; oy: number } {
  const aw = Math.max(1, natW);
  const ah = Math.max(1, natH);
  const scale = Math.min(maxW / aw, maxH / ah);
  const w = Math.max(1, aw * scale);
  const h = Math.max(1, ah * scale);
  return { w, h, ox: (maxW - w) / 2, oy: (maxH - h) / 2 };
}

function sectionHeading(doc: jsPDF, title: string, y: number): number {
  y = ensureSpace(doc, y, 14);
  doc.setFillColor(...ACCENT);
  doc.rect(14, y - 4, doc.internal.pageSize.getWidth() - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 16, y + 1.5);
  doc.setTextColor(...BLACK);
  return y + 10;
}

export async function exportVehicleInspectionProofPdf(args: {
  vehicle: InspectionProofVehicle;
  inspection: InspectionProofDoc;
  companyName?: string;
}): Promise<void> {
  const { vehicle, inspection, companyName } = args;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 18;

  const isBlood = inspection.inspection_category === 'blood_organ';
  const inspectedAt = formatDateTime(toDate(inspection.inspected_at));
  const reg = (vehicle.registration || 'UNKNOWN').toUpperCase();

  // Header
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Fleet Track PRO', 14, 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Vehicle Inspection Proof Report', 14, 20);
  doc.setTextColor(...BLACK);
  y = 36;

  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text(`Generated ${formatDateTime(new Date())}`, 14, y);
  y += 8;

  y = sectionHeading(doc, 'Vehicle & inspection summary', y);
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    headStyles: { fillColor: ACCENT, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: BODY_SAFE },
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
    body: [
      ['Company', companyName || vehicle.company_name || '—'],
      ['Registration', reg],
      ['Vehicle', [vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'],
      ['Inspection ID', inspection.id],
      ['Inspected at', inspectedAt],
      ['Inspector', inspection.inspector_name || '—'],
      ['Mileage', inspection.mileage != null ? `${inspection.mileage.toLocaleString()} miles` : '—'],
      ...(typeof inspection.recorded_values?.fuel_level === 'number'
        ? [[
            'Fuel level',
            `${FUEL_LEVEL_LABELS[inspection.recorded_values.fuel_level] || inspection.recorded_values.fuel_level} (${inspection.recorded_values.fuel_level}/5)`,
          ]]
        : []),
      ['Overall condition', (inspection.overall_condition || '—').toString()],
      ['Defects reported', inspection.has_defect ? 'Yes' : 'No'],
    ],
  });
  y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y) + 10;

  // Photos
  y = sectionHeading(doc, 'Inspection photos', y);
  const photoEntries = Object.entries(inspection.photo_urls || {}).filter(([, v]) => !!v);
  if (photoEntries.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text('No photos attached to this inspection.', 14, y);
    y += 8;
  } else {
    const colW = (pageW - 28 - 6) / 2;
    const slotH = 48;
    // Prefetch with limited concurrency — faster and more reliable than 6 parallel getBlob calls.
    const resolved = await mapPool(photoEntries, 3, async ([key, path]) => ({
      key,
      img: await resolveImageDataUrl(path as string, { timeoutMs: 20000, maxEdgePx: 640 }),
    }));
    let col = 0;
    for (const { key, img } of resolved) {
      const label = BLOOD_ORGAN_PHOTO_LABELS[key] || key.replace(/_/g, ' ');
      if (col === 0) y = ensureSpace(doc, y, slotH + 14);
      const x = 14 + col * (colW + 6);
      doc.setFontSize(8);
      doc.setTextColor(...BLACK);
      doc.setFont('helvetica', 'bold');
      doc.text(label, x, y);
      if (img) {
        try {
          const fitted = fitInBox(colW, slotH, img.width, img.height);
          doc.addImage(
            img.dataUrl,
            img.format,
            x + fitted.ox,
            y + 2 + fitted.oy,
            fitted.w,
            fitted.h,
            undefined,
            'FAST'
          );
        } catch {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...GRAY);
          doc.text('(Photo could not be embedded)', x, y + 20);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
        doc.text('(Photo unavailable)', x, y + 20);
      }
      col += 1;
      if (col >= 2) {
        col = 0;
        y += slotH + 12;
      }
    }
    if (col !== 0) y += slotH + 12;
  }

  // Checklist
  if (isBlood && inspection.check_results) {
    y = sectionHeading(doc, 'Checklist results', y);
    for (const sectionId of BLOOD_ORGAN_SECTION_ORDER) {
      const rows: string[][] = [];
      for (const [checkId, meta] of Object.entries(BLOOD_ORGAN_CHECK_LABELS)) {
        if (meta.sectionId !== sectionId) continue;
        const result = inspection.check_results[checkId];
        if (!result) continue;
        const fluidLabel =
          result.fluid_status && FLUID_STATUS_LABELS[result.fluid_status];
        const isYesNo =
          checkId === 'cab_lockbox_secure' || checkId === 'cab_lockbox_key_returned';
        const yesNoLabel =
          isYesNo && result.result === 'pass'
            ? 'Yes'
            : isYesNo && result.result === 'fail'
              ? 'No'
              : isYesNo && result.result === 'na'
                ? 'N/A'
                : null;
        const resultLabel = fluidLabel || yesNoLabel || (result.result || '—').toUpperCase();
        const detailParts = [
          result.reason ? `Reason: ${result.reason}` : '',
          result.severity ? `Severity: ${result.severity}` : '',
          result.vehicle_status ? `Status: ${result.vehicle_status.replace(/_/g, ' ')}` : '',
        ].filter(Boolean);
        rows.push([meta.title, resultLabel, detailParts.join(' | ') || '—']);
      }
      if (rows.length === 0) continue;
      y = ensureSpace(doc, y, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BLACK);
      doc.text(BLOOD_ORGAN_SECTION_TITLES[sectionId] || sectionId, 14, y);
      y += 3;
      autoTable(doc, {
        startY: y,
        theme: 'striped',
        head: [['Check', 'Result', 'Notes']],
        headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: BODY_SAFE },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 22 },
          2: { cellWidth: 'auto' },
        },
        body: rows,
      });
      y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y) + 8;
    }

    // Evidence photos from failed checks
    const evidenceItems: Array<{ title: string; path: string }> = [];
    for (const [checkId, result] of Object.entries(inspection.check_results)) {
      if (result?.evidence?.url) {
        evidenceItems.push({
          title: BLOOD_ORGAN_CHECK_LABELS[checkId]?.title || checkId,
          path: result.evidence.url,
        });
      }
    }
    if (evidenceItems.length > 0) {
      y = sectionHeading(doc, 'Failure evidence photos', y);
      for (const item of evidenceItems) {
        y = ensureSpace(doc, y, 55);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(item.title, 14, y);
        y += 3;
        const img = await resolveImageDataUrl(item.path);
        if (img) {
          try {
            const maxW = 90;
            const maxH = 52;
            const fitted = fitInBox(maxW, maxH, img.width, img.height);
            doc.addImage(img.dataUrl, img.format, 14, y, fitted.w, fitted.h, undefined, 'FAST');
            y += fitted.h + 8;
          } catch {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...GRAY);
            doc.text('(Evidence photo could not be embedded)', 14, y + 8);
            y += 14;
          }
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...GRAY);
          doc.text('(Evidence photo unavailable)', 14, y + 8);
          y += 14;
        }
      }
    }
  } else if (inspection.walkaround_declaration?.items) {
    y = sectionHeading(doc, 'Car / Van walkaround checks', y);
    const items = inspection.walkaround_declaration.items;
    const rows = Object.entries(items).map(([id, ok]) => [
      CAR_VAN_WALKAROUND_LABELS[id] || id.replace(/_/g, ' '),
      ok ? 'Confirmed' : 'Not confirmed',
    ]);
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['Check', 'Status']],
      headStyles: { fillColor: [40, 40, 40], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: BODY_SAFE },
      margin: { left: 14, right: 14 },
      body: rows,
    });
    y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y) + 8;
  }

  // Defects summary
  const defectRows: string[][] = [];
  if (Array.isArray(inspection.defects) && inspection.defects.length > 0) {
    for (const d of inspection.defects) {
      defectRows.push([
        d.defect_type || '—',
        d.defect_severity || '—',
        d.defect_description || '—',
      ]);
    }
  } else if (inspection.has_defect && inspection.defect_description) {
    defectRows.push([
      inspection.defect_type || '—',
      inspection.defect_severity || '—',
      inspection.defect_description || '—',
    ]);
  }
  if (defectRows.length > 0) {
    y = sectionHeading(doc, 'Defects', y);
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      head: [['Type', 'Severity', 'Description']],
      headStyles: { fillColor: [180, 40, 40], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: BODY_SAFE },
      margin: { left: 14, right: 14 },
      body: defectRows,
    });
    y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y) + 8;
  }

  // Declaration
  y = sectionHeading(doc, 'Declaration', y);
  doc.setFontSize(9);
  doc.setTextColor(...BLACK);
  if (isBlood && inspection.declaration?.items) {
    const lines = [
      `Physically completed checks: ${inspection.declaration.items.decl_physical ? 'Yes' : 'No'}`,
      `Faults reported accurately: ${inspection.declaration.items.decl_accurate ? 'Yes' : 'No'}`,
      `Signed at: ${inspection.declaration.confirmed_at || '—'}`,
    ];
    for (const line of lines) {
      y = ensureSpace(doc, y, 6);
      doc.text(line, 14, y);
      y += 5;
    }

    const sigRaw = inspection.declaration.signature_paths;
    let signatureEmbedded = false;
    if (hasEncodedSignature(sigRaw)) {
      const png = await signatureEncodedToPngDataUrl(sigRaw, { width: 560, height: 200 });
      if (png) {
        y = ensureSpace(doc, y, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Inspector signature', 14, y);
        y += 3;
        try {
          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(255, 255, 255);
          doc.rect(14, y, 90, 34, 'FD');
          doc.addImage(png, 'PNG', 16, y + 2, 86, 30, undefined, 'FAST');
          signatureEmbedded = true;
          y += 38;
        } catch {
          signatureEmbedded = false;
        }
        doc.setFont('helvetica', 'normal');
      }
    } else if (sigRaw && isSignatureStorageRef(sigRaw)) {
      const img = await resolveImageDataUrl(sigRaw);
      if (img) {
        y = ensureSpace(doc, y, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Inspector signature', 14, y);
        y += 3;
        try {
          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(255, 255, 255);
          doc.rect(14, y, 90, 34, 'FD');
          const fitted = fitInBox(86, 30, img.width, img.height);
          doc.addImage(
            img.dataUrl,
            img.format,
            16 + fitted.ox,
            y + 2 + fitted.oy,
            fitted.w,
            fitted.h,
            undefined,
            'FAST'
          );
          signatureEmbedded = true;
          y += 38;
        } catch {
          signatureEmbedded = false;
        }
        doc.setFont('helvetica', 'normal');
      }
    }

    if (!signatureEmbedded) {
      y = ensureSpace(doc, y, 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(
        sigRaw ? 'Signature captured on device (could not embed image).' : 'No signature recorded.',
        14,
        y
      );
      y += 6;
      doc.setTextColor(...BLACK);
    }
  } else {
    doc.text(
      inspection.walkaround_declaration?.items?.final_confirm
        ? 'Driver walkaround declaration confirmed.'
        : 'No declaration recorded.',
      14,
      y
    );
    y += 6;
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `Fleet Track PRO · Inspection proof · ${reg} · Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  const safeReg = reg.replace(/[^a-zA-Z0-9_-]/g, '');
  const datePart = toDate(inspection.inspected_at);
  const dateStr = datePart
    ? `${datePart.getFullYear()}-${String(datePart.getMonth() + 1).padStart(2, '0')}-${String(datePart.getDate()).padStart(2, '0')}`
    : 'undated';
  doc.save(`FTP-Inspection-Proof-${safeReg}-${dateStr}.pdf`);
}