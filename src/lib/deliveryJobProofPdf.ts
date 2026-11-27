/**
 * Road Movement Order proof PDF — themed to Fleet Track PRO marketing palette.
 * Ink #0a1628 · brand blue #1a6fb5 · soft depot surfaces.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resolveImageDataUrl, mapPool, type ResolvedImage } from '@/lib/resolveImageDataUrl';
import {
  hasEncodedSignature,
  isSignatureStorageRef,
  signatureEncodedToPngDataUrl,
} from '@/lib/signaturePaths';
import { DELIVERY_JOB_STATUS_LABELS, type DeliveryJobStatus } from '@/lib/deliveryModule';

/** Matches globals.css --mkt-ink / --brand-blue / --mkt-* */
const INK: [number, number, number] = [10, 22, 40];
const BRAND: [number, number, number] = [26, 111, 181];
const SLATE: [number, number, number] = [69, 86, 108];
const MUTED: [number, number, number] = [100, 116, 139];
const LINE: [number, number, number] = [211, 221, 232];
const SOFT: [number, number, number] = [244, 247, 251];
const SOFT_2: [number, number, number] = [231, 238, 246];
const BODY: [number, number, number] = [10, 22, 40];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [5, 150, 105];
const RED: [number, number, number] = [220, 38, 38];

const MARGIN = 40;
const SECTION_GAP = 22;
const BLOCK_GAP = 14;
const LABEL_GAP = 5;

export type DeliveryJobProofDoc = {
  id: string;
  job_number?: string;
  client_name?: string;
  status?: string;
  collection_item?: string;
  collection_item_misc?: string;
  blue_lights_authorised?: boolean | null;
  assigned_driver_name?: string;
  required_arrival_at?: string;
  collection_hospital?: string;
  collection_postcode?: string;
  collection_ward?: string;
  delivery_hospital?: string;
  delivery_postcode?: string;
  delivery_ward?: string;
  collection_confirmed?: {
    collected_at?: string;
    collection_snod_name?: string;
    box_photo_path?: string;
    serial_photo_path?: string;
    collection_signature_paths?: string;
    hub_informed?: boolean;
  } | null;
  completed?: {
    receiving_snod_name?: string;
    delivery_signature_paths?: string;
    delivery_proof_photo_path?: string;
    hub_informed?: boolean;
    at?: string;
  } | null;
  company_name?: string;
};

function safeName(value: string): string {
  return String(value || 'job')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

function lastTableY(doc: jsPDF, fallback: number): number {
  return ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ||
    fallback) as number;
}

function ensureSpace(doc: jsPDF, y: number, need: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + need > pageH - 44) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/** Clean ink header + brand-blue accent bar (no decorative shapes). */
function drawBrandHeader(doc: jsPDF, pageW: number, height: number): void {
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, height, 'F');
  doc.setFillColor(...BRAND);
  doc.rect(0, height, pageW, 2.5, 'F');
}

async function loadBrandLogo(): Promise<ResolvedImage | null> {
  for (const path of ['/logo-white.png', '/logo.png']) {
    const img = await resolveImageDataUrl(path, { timeoutMs: 3000, maxEdgePx: 480 });
    if (img?.dataUrl) return img;
  }
  return null;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...BRAND);
  doc.roundedRect(MARGIN, y, 2.5, 11, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(title, MARGIN + 10, y + 9);
  return y + 18;
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  valueColor: [number, number, number] = BODY
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...valueColor);
  const lines = doc.splitTextToSize(value || '—', width);
  doc.text(lines, x, y + 12);
  return y + 12 + lines.length * 11;
}

function drawPhoto(
  doc: jsPDF,
  label: string,
  img: ResolvedImage | null | undefined,
  x: number,
  y: number,
  imgW: number,
  imgH: number
): void {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), x, y);
  doc.setDrawColor(...LINE);
  doc.setFillColor(...SOFT);
  doc.roundedRect(x, y + LABEL_GAP, imgW, imgH, 3, 3, 'FD');
  if (img?.dataUrl) {
    try {
      doc.addImage(
        img.dataUrl,
        img.format,
        x + 4,
        y + LABEL_GAP + 4,
        imgW - 8,
        imgH - 8,
        undefined,
        'FAST'
      );
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('Photo unavailable', x + 14, y + LABEL_GAP + imgH / 2 + 2);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Photo unavailable', x + 14, y + LABEL_GAP + imgH / 2 + 2);
  }
}

function drawSignature(
  doc: jsPDF,
  label: string,
  img: ResolvedImage | null,
  y: number,
  pageW: number
): number {
  if (!img?.dataUrl) return y;
  const boxW = Math.min(260, pageW - MARGIN * 2);
  const boxH = 68;
  y = ensureSpace(doc, y, boxH + 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...LINE);
  doc.setFillColor(...SOFT);
  doc.roundedRect(MARGIN, y + LABEL_GAP, boxW, boxH, 3, 3, 'FD');
  try {
    doc.addImage(
      img.dataUrl,
      img.format,
      MARGIN + 8,
      y + LABEL_GAP + 6,
      boxW - 16,
      boxH - 12,
      undefined,
      'FAST'
    );
  } catch {
    /* ignore */
  }
  return y + LABEL_GAP + boxH + BLOCK_GAP;
}

async function signatureToImage(encoded?: string | null): Promise<ResolvedImage | null> {
  const raw = String(encoded || '').trim();
  if (!raw) return null;
  if (isSignatureStorageRef(raw)) {
    return resolveImageDataUrl(raw, { timeoutMs: 10000, maxEdgePx: 640 });
  }
  if (!hasEncodedSignature(raw)) return null;
  const dataUrl = await signatureEncodedToPngDataUrl(raw);
  if (!dataUrl) return null;
  return { dataUrl, format: 'PNG', width: 560, height: 200 };
}

/** Build the RMO proof PDF as a blob (for preview or download). */
export async function buildDeliveryJobProofPdf(
  job: DeliveryJobProofDoc
): Promise<{ blob: Blob; fileName: string }> {
  const confirmed = job.collection_confirmed || null;
  const completed = job.completed || null;

  // Resolve logo + photos + signatures in parallel before drawing (keeps View PDF snappy).
  const photoPaths = [
    confirmed?.box_photo_path,
    confirmed?.serial_photo_path,
    completed?.delivery_proof_photo_path,
  ].filter(Boolean) as string[];

  const [logo, photoData, collectionSig, deliverySig] = await Promise.all([
    loadBrandLogo(),
    mapPool(photoPaths, 3, async (path) => ({
      path,
      img: await resolveImageDataUrl(path, { timeoutMs: 10000, maxEdgePx: 640 }),
    })),
    signatureToImage(confirmed?.collection_signature_paths),
    signatureToImage(completed?.delivery_signature_paths),
  ]);
  const photoMap = new Map(photoData.map((p) => [p.path, p.img]));

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;
  const headerH = 72;

  drawBrandHeader(doc, pageW, headerH);

  if (logo?.dataUrl) {
    try {
      const logoH = 26;
      const logoW = Math.min(140, (logo.width / Math.max(logo.height, 1)) * logoH);
      doc.addImage(logo.dataUrl, logo.format, MARGIN, 18, logoW, logoH, undefined, 'FAST');
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...WHITE);
      doc.text('Fleet Track PRO', MARGIN, 30);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...WHITE);
    doc.text('Fleet Track PRO', MARGIN, 30);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 198, 214);
  doc.text('Road Movement Order · Proof of collection & delivery', MARGIN, 54);

  const jobNumber = String(job.job_number || job.id || '—');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('JOB', pageW - MARGIN, 26, { align: 'right' });
  doc.setFontSize(12);
  doc.setTextColor(...WHITE);
  doc.text(jobNumber, pageW - MARGIN, 42, { align: 'right' });

  let y = headerH + 18;

  const itemLabel = [job.collection_item, job.collection_item_misc ? `(${job.collection_item_misc})` : '']
    .filter(Boolean)
    .join(' ');
  const status = String(job.status || '') as DeliveryJobStatus;
  const statusLabel = DELIVERY_JOB_STATUS_LABELS[status] || String(job.status || '—');
  const blueLights =
    typeof job.blue_lights_authorised === 'boolean'
      ? job.blue_lights_authorised
        ? 'Authorised'
        : 'Not authorised'
      : '—';
  const blueColor: [number, number, number] =
    typeof job.blue_lights_authorised === 'boolean'
      ? job.blue_lights_authorised
        ? GREEN
        : RED
      : BODY;

  // Summary card — measured height for even padding
  const cardX = MARGIN;
  const cardW = contentW;
  const cardTop = y;
  const pad = 16;
  const colGap = 20;
  const colW = (cardW - pad * 2 - colGap) / 2;
  const leftX = cardX + pad;
  const rightX = leftX + colW + colGap;

  const driverLines = doc.splitTextToSize(String(job.assigned_driver_name || '—'), colW).length;
  const arrivalLines = doc.splitTextToSize(String(job.required_arrival_at || '—'), colW).length;
  const blueLines = doc.splitTextToSize(blueLights, colW).length;
  const companyLines = job.company_name
    ? doc.splitTextToSize(String(job.company_name), colW).length
    : 0;
  const row1H = 12 + Math.max(driverLines, arrivalLines) * 11;
  const row2H = 12 + Math.max(blueLines, companyLines || 1) * 11;
  const titleBlockH = 36;
  const cardH = pad + titleBlockH + 10 + row1H + 12 + row2H + pad;

  doc.setFillColor(...SOFT);
  doc.setDrawColor(...LINE);
  doc.roundedRect(cardX, cardTop, cardW, cardH, 6, 6, 'FD');
  doc.setFillColor(...SOFT_2);
  doc.roundedRect(cardX, cardTop, cardW, 6, 6, 6, 'F');
  doc.setFillColor(...SOFT);
  doc.rect(cardX, cardTop + 4, cardW, 6, 'F');

  y = cardTop + pad + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  const clientLines = doc.splitTextToSize(String(job.client_name || '—'), cardW - pad * 2 - 90);
  doc.text(clientLines[0] || '—', leftX, y);

  const chipLabel = statusLabel;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const chipW = Math.max(52, doc.getTextWidth(chipLabel) + 14);
  const chipX = cardX + cardW - pad - chipW;
  doc.setFillColor(...BRAND);
  doc.roundedRect(chipX, y - 10, chipW, 15, 2.5, 2.5, 'F');
  doc.setTextColor(...WHITE);
  doc.text(chipLabel, chipX + chipW / 2, y - 0.5, { align: 'center' });

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SLATE);
  doc.text(itemLabel || '—', leftX, y);

  y = cardTop + pad + titleBlockH;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  doc.line(leftX, y, cardX + cardW - pad, y);
  y += 12;

  drawLabelValue(doc, 'Driver', String(job.assigned_driver_name || '—'), leftX, y, colW);
  drawLabelValue(doc, 'Required arrival', String(job.required_arrival_at || '—'), rightX, y, colW);
  y += row1H + 8;
  drawLabelValue(doc, 'Blue lights', blueLights, leftX, y, colW, blueColor);
  if (job.company_name) {
    drawLabelValue(doc, 'Company', String(job.company_name), rightX, y, colW);
  }

  y = cardTop + cardH + SECTION_GAP;
  y = drawSectionTitle(doc, 'Route', y);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: 'grid',
    headStyles: {
      fillColor: INK,
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
    },
    styles: {
      fontSize: 9,
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
      textColor: BODY,
      lineColor: LINE,
      lineWidth: 0.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: SOFT, cellWidth: 72, textColor: SLATE, fontSize: 8 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 72 },
      3: { cellWidth: 88 },
    },
    head: [['', 'Hospital', 'Postcode', 'Ward / unit']],
    body: [
      [
        'Collect from',
        String(job.collection_hospital || '—'),
        String(job.collection_postcode || '—'),
        String(job.collection_ward || '—'),
      ],
      [
        'Deliver to',
        String(job.delivery_hospital || '—'),
        String(job.delivery_postcode || '—'),
        String(job.delivery_ward || '—'),
      ],
    ],
  });
  y = lastTableY(doc, y) + SECTION_GAP;

  if (confirmed) {
    y = ensureSpace(doc, y, 100);
    y = drawSectionTitle(doc, 'Collection', y);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: { top: 2.5, right: 6, bottom: 2.5, left: 0 },
        textColor: BODY,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 110, textColor: MUTED, fontSize: 7.5 },
        1: { cellWidth: 'auto' },
      },
      body: [
        ['Collected at', String(confirmed.collected_at || '—')],
        ['Collection SNOD', String(confirmed.collection_snod_name || '—')],
        ['Hub informed', confirmed.hub_informed ? 'Yes' : '—'],
      ],
    });
    y = lastTableY(doc, y) + BLOCK_GAP;

    if (confirmed.box_photo_path || confirmed.serial_photo_path) {
      const imgW = (contentW - 14) / 2;
      const imgH = Math.round(imgW * 0.72);
      y = ensureSpace(doc, y, imgH + 28);
      let x = MARGIN;
      if (confirmed.box_photo_path) {
        drawPhoto(doc, 'Box photo', photoMap.get(confirmed.box_photo_path), x, y, imgW, imgH);
        x += imgW + 14;
      }
      if (confirmed.serial_photo_path) {
        drawPhoto(doc, 'Serial photo', photoMap.get(confirmed.serial_photo_path), x, y, imgW, imgH);
      }
      y += LABEL_GAP + imgH + BLOCK_GAP;
    }

    y = drawSignature(doc, 'Collection signature', collectionSig, y, pageW);
  }

  if (completed) {
    y = ensureSpace(doc, y, 100);
    y = drawSectionTitle(doc, 'Delivery', y);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: { top: 2.5, right: 6, bottom: 2.5, left: 0 },
        textColor: BODY,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 110, textColor: MUTED, fontSize: 7.5 },
        1: { cellWidth: 'auto' },
      },
      body: [
        ['Receiving SNOD', String(completed.receiving_snod_name || '—')],
        ['Completed at', String(completed.at || '—')],
        ['Hub informed', completed.hub_informed ? 'Yes' : '—'],
      ],
    });
    y = lastTableY(doc, y) + BLOCK_GAP;

    if (completed.delivery_proof_photo_path) {
      const imgW = Math.min(240, contentW * 0.48);
      const imgH = Math.round(imgW * 0.72);
      y = ensureSpace(doc, y, imgH + 28);
      drawPhoto(
        doc,
        'Delivery proof photo',
        photoMap.get(completed.delivery_proof_photo_path),
        MARGIN,
        y,
        imgW,
        imgH
      );
      y += LABEL_GAP + imgH + BLOCK_GAP;
    }

    y = drawSignature(doc, 'Delivery signature', deliverySig, y, pageW);
  }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, pageH - 30, pageW - MARGIN, pageH - 30);
    doc.setFillColor(...BRAND);
    doc.rect(MARGIN, pageH - 30, 24, 1.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      `Generated ${new Date().toLocaleString('en-GB')} · Fleet Track PRO`,
      MARGIN,
      pageH - 16
    );
    doc.text(`Page ${i} of ${total}`, pageW - MARGIN, pageH - 16, { align: 'right' });
  }

  const fileName = `FTP-RMO-Proof-${safeName(jobNumber)}.pdf`;
  const blob = doc.output('blob');
  return { blob, fileName };
}

/** Build PDF and trigger a direct download. */
export async function exportDeliveryJobProofPdf(job: DeliveryJobProofDoc): Promise<void> {
  const { blob, fileName } = await buildDeliveryJobProofPdf(job);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
