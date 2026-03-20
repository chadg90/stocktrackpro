/**
 * Weekly Fleet Health Report — PDF layout for managers (readable names, not raw IDs).
 * Brand: black (#000000) headers, Google blue accents (#4285F4).
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Timestamp } from 'firebase/firestore';

const ACCENT: [number, number, number] = [66, 133, 244]; // #4285F4
const BLACK: [number, number, number] = [0, 0, 0];
const BODY_GRAY: [number, number, number] = [51, 51, 51];

export type FleetHealthVehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  mileage?: number;
  mot_expiry_date?: Timestamp | string | null;
  tax_expiry_date?: Timestamp | string | null;
};

export type FleetHealthDefect = {
  id: string;
  vehicle_id?: string;
  description?: string;
  severity?: string;
  status?: string;
  reported_at?: Timestamp | string | null;
  reported_by?: string;
};

function toDate(val: unknown): Date | null {
  if (val == null) return null;
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as Timestamp).toDate === 'function') {
    try {
      return (val as Timestamp).toDate();
    } catch {
      return null;
    }
  }
  const d = new Date(val as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateShort(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function vehicleLabel(v: FleetHealthVehicle): string {
  const reg = (v.registration || '').trim();
  const mm = [v.make, v.model].filter(Boolean).join(' ').trim();
  if (reg && mm) return `${reg} (${mm})`;
  if (reg) return reg;
  if (mm) return mm;
  return 'Vehicle (no registration on file)';
}

function urgencyForDays(d: number): string {
  if (d < 0) return 'Overdue';
  if (d <= 7) return 'Critical (≤7 days)';
  if (d <= 30) return 'High (≤30 days)';
  return 'Due later';
}

function riskLevel(params: {
  openCriticalOrHigh: boolean;
  complianceUrgent: boolean;
  openMedium: boolean;
}): 'Low' | 'Medium' | 'High' {
  if (params.openCriticalOrHigh || params.complianceUrgent) return 'High';
  if (params.openMedium) return 'Medium';
  return 'Low';
}

function isSafetyDefect(sev?: string): boolean {
  const s = (sev || '').toLowerCase();
  return s === 'critical' || s === 'high';
}

export function exportFleetHealthReportPDF(input: {
  companyName?: string;
  vehicles: FleetHealthVehicle[];
  defects: FleetHealthDefect[];
  getUserDisplayName?: (userId: string | undefined) => string;
}): void {
  const { companyName, vehicles, defects, getUserDisplayName = () => '—' } = input;
  const openDefects = defects.filter((d) => d.status !== 'resolved');

  const complianceRows: { vehicle: string; item: string; expiry: string; days: string; urgency: string }[] = [];
  for (const v of vehicles) {
    const mot = toDate(v.mot_expiry_date);
    const tax = toDate(v.tax_expiry_date);
    const label = vehicleLabel(v);
    for (const [name, dt] of [
      ['MOT', mot],
      ['Road tax', tax],
    ] as const) {
      const d = daysUntil(dt);
      if (d === null) continue;
      if (d > 30) continue;
      complianceRows.push({
        vehicle: label,
        item: name,
        expiry: formatDateShort(dt),
        days: d < 0 ? `${Math.abs(d)} overdue` : `${d} days`,
        urgency: urgencyForDays(d),
      });
    }
  }

  const safetyDefects = openDefects.filter((d) => isSafetyDefect(d.severity));
  const generalDefects = openDefects.filter((d) => !isSafetyDefect(d.severity));

  const totalMileage = vehicles.reduce((s, v) => s + (typeof v.mileage === 'number' && !Number.isNaN(v.mileage) ? v.mileage : 0), 0);

  const sortedByMileage = [...vehicles].sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
  const top3 = sortedByMileage.slice(0, 3).filter((v) => (v.mileage || 0) > 0);
  const idleVehicles = vehicles.filter((v) => !v.mileage || v.mileage === 0);

  const complianceUrgent = complianceRows.some((r) => r.urgency.startsWith('Critical') || r.urgency === 'Overdue');
  const openCriticalOrHigh = safetyDefects.length > 0;
  const openMedium = generalDefects.some((d) => (d.severity || '').toLowerCase() === 'medium');

  const risk = riskLevel({ openCriticalOrHigh, complianceUrgent, openMedium });

  const summary1 = `Fleet: ${vehicles.length} vehicle(s). Recorded odometer total (where mileage is set): ${totalMileage.toLocaleString('en-GB')} miles.`;
  const summary2 = `Open defects: ${openDefects.length} (${safetyDefects.length} safety/roadworthy priority). MOT/Tax items needing attention within 30 days: ${complianceRows.length}.`;
  const summary3 = `Overall risk level: ${risk} — based on open high-severity defects and upcoming or overdue compliance dates.`;

  const actionBullets: string[] = [];
  const firstCritCompliance = complianceRows.find((r) => r.urgency === 'Overdue' || r.urgency.startsWith('Critical'));
  if (firstCritCompliance) {
    actionBullets.push(`Book ${firstCritCompliance.item} for ${firstCritCompliance.vehicle} (expiry ${firstCritCompliance.expiry}).`);
  }
  const firstSafety = safetyDefects[0];
  if (firstSafety) {
    const veh = vehicles.find((x) => x.id === firstSafety.vehicle_id);
    actionBullets.push(
      `Inspect / assign repair for ${(firstSafety.severity || '').toUpperCase()} defect on ${veh ? vehicleLabel(veh) : 'vehicle'}: ${(firstSafety.description || '').slice(0, 80)}${(firstSafety.description || '').length > 80 ? '…' : ''}`
    );
  }
  const secondCompliance = complianceRows.find((r) => r !== firstCritCompliance);
  if (secondCompliance && actionBullets.length < 3) {
    actionBullets.push(`Schedule ${secondCompliance.item} for ${secondCompliance.vehicle} before ${secondCompliance.expiry}.`);
  }
  while (actionBullets.length < 3) {
    if (actionBullets.length === 0) {
      actionBullets.push('Review open defects in Stock Track PRO and close or assign all items older than 7 days.');
    } else if (actionBullets.length === 1) {
      actionBullets.push('Confirm mileage is up to date for all active vehicles after this week’s work.');
    } else {
      actionBullets.push('Run a quick walk-around check on vehicles flagged as idle (0 miles recorded).');
    }
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  const title = 'Weekly Fleet Status Report';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...BLACK);
  doc.text(title, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.text('Stock Track PRO', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY_GRAY);
  const sub = [
    companyName ? `Organisation: ${companyName}` : null,
    `Generated: ${new Date().toLocaleString('en-GB')}`,
  ]
    .filter(Boolean)
    .join(' · ');
  doc.text(sub, margin, y);
  y += 10;

  const section = (label: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BLACK);
    doc.text(label, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BODY_GRAY);
  };

  section('Executive summary');
  const sumLines = doc.splitTextToSize(`${summary1}\n\n${summary2}\n\n${summary3}`, pageW - margin * 2);
  doc.text(sumLines, margin, y);
  y += sumLines.length * 4.2 + 6;

  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  section('Compliance alert — MOT & road tax (next 30 days)');
  if (complianceRows.length === 0) {
    doc.text('No MOT or road tax dates fall within the next 30 days (or dates are not set on vehicles).', margin, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Vehicle', 'Item', 'Expiry', 'Time left', 'Urgency']],
      body: complianceRows.map((r) => [r.vehicle, r.item, r.expiry, r.days, r.urgency]),
      styles: { fontSize: 8, textColor: BODY_GRAY },
      headStyles: { fillColor: ACCENT, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  section('Defect priority');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text('Safety / roadworthy — immediate action', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY_GRAY);
  if (safetyDefects.length === 0) {
    doc.text('None open.', margin, y);
    y += 6;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Vehicle', 'Severity', 'Status', 'Reported', 'Reported by', 'Description']],
      body: safetyDefects.map((d) => {
        const veh = vehicles.find((x) => x.id === d.vehicle_id);
        return [
          veh ? vehicleLabel(veh) : 'Unknown vehicle',
          d.severity || '—',
          d.status || '—',
          formatDateShort(toDate(d.reported_at)),
          getUserDisplayName(d.reported_by),
          (d.description || '—').slice(0, 160),
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: BLACK, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text('General maintenance', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY_GRAY);
  if (generalDefects.length === 0) {
    doc.text('None open.', margin, y);
    y += 6;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Vehicle', 'Severity', 'Status', 'Reported', 'Reported by', 'Description']],
      body: generalDefects.map((d) => {
        const veh = vehicles.find((x) => x.id === d.vehicle_id);
        return [
          veh ? vehicleLabel(veh) : 'Unknown vehicle',
          d.severity || '—',
          d.status || '—',
          formatDateShort(toDate(d.reported_at)),
          getUserDisplayName(d.reported_by),
          (d.description || '—').slice(0, 160),
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: ACCENT, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (y > 220) {
    doc.addPage();
    y = margin;
  }

  section('Mileage analysis');
  autoTable(doc, {
    startY: y,
    head: [['Rank', 'Vehicle', 'Mileage (recorded)']],
    body:
      top3.length > 0
        ? top3.map((v, i) => [`${i + 1}`, vehicleLabel(v), String(v.mileage ?? 0)])
        : [['—', 'No vehicles with mileage > 0', '—']],
    styles: { fontSize: 9 },
    headStyles: { fillColor: BLACK, textColor: 255, fontStyle: 'bold' },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  const idleLine =
    idleVehicles.length > 0
      ? `Idle assets (0 miles recorded): ${idleVehicles.map(vehicleLabel).join('; ')}.`
      : 'No vehicles flagged as idle (all have mileage recorded).';
  const idleWrapped = doc.splitTextToSize(idleLine, pageW - margin * 2);
  doc.text(idleWrapped, margin, y);
  y += idleWrapped.length * 4.5 + 8;

  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  section('Action plan (next working day)');
  doc.setTextColor(...BODY_GRAY);
  actionBullets.slice(0, 3).forEach((b, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${b}`, pageW - margin * 2 - 4);
    doc.text(lines, margin + 4, y);
    y += lines.length * 4.2 + 2;
  });

  doc.save(`fleet-health-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
