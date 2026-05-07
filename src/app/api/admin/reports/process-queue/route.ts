import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Timestamp } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { buildAdminMonthlyCompanyReportPdfBytes, type MonthlyCompanyReportTemplate } from '@/lib/adminMonthlyCompanyReportPdf';

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set');
  }
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function monthToRange(monthValue: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = monthValue.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

function formatMonthLabel(monthValue: string): string {
  const [yearStr, monthStr] = monthValue.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function getRecentMonthValues(monthValue: string, count: number): string[] {
  const [yearStr, monthStr] = monthValue.split('-');
  const base = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const values: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const dt = new Date(base);
    dt.setMonth(dt.getMonth() - i);
    values.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  }
  return values;
}

function isWithinRange(value: Timestamp | string | undefined, start: Date, end: Date): boolean {
  if (!value) return false;
  const dt = value instanceof Timestamp ? value.toDate() : new Date(value);
  if (Number.isNaN(dt.getTime())) return false;
  return dt >= start && dt < end;
}

async function assertAdmin(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    throw new Error('Unauthorized');
  }

  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  const db = getAdminDb();
  const profileSnap = await db.collection('profiles').doc(decoded.uid).get();
  if (!profileSnap.exists || profileSnap.data()?.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return decoded.uid;
}

async function buildMonthlyStats(companyId: string, month: string): Promise<{
  checksCompleted: number;
  defectsReported: number;
  defectsResolved: number;
  resolutionRate: number | null;
  openDefects: number;
  criticalOpenDefects: number;
  inactivityDays: number | null;
  usersReportedCount: number;
  usersNotReportedCount: number;
  trend: Array<{ month: string; checks: number; defectsReported: number; defectsResolved: number }>;
  openDefectsList: Array<{
    vehicle: string;
    description: string;
    raised: string;
    priority: 'critical' | 'standard';
    status: 'open' | 'resolved';
  }>;
}> {
  const db = getAdminDb();
  const { start, end } = monthToRange(month);
  const startTs = Timestamp.fromDate(start);
  const endTs = Timestamp.fromDate(end);

  const [checksSnap, reportedSnap, resolvedSnap, allDefectsSnap, latestInspectionSnap, allInspectionsSnap, profilesSnap, vehiclesSnap] = await Promise.all([
    db
      .collection('vehicle_inspections')
      .where('company_id', '==', companyId)
      .where('inspected_at', '>=', startTs)
      .where('inspected_at', '<', endTs)
      .get(),
    db
      .collection('vehicle_defects')
      .where('company_id', '==', companyId)
      .where('reported_at', '>=', startTs)
      .where('reported_at', '<', endTs)
      .get(),
    db
      .collection('vehicle_defects')
      .where('company_id', '==', companyId)
      .where('resolved_at', '>=', startTs)
      .where('resolved_at', '<', endTs)
      .get(),
    db.collection('vehicle_defects').where('company_id', '==', companyId).get(),
    db
      .collection('vehicle_inspections')
      .where('company_id', '==', companyId)
      .orderBy('inspected_at', 'desc')
      .limit(1)
      .get(),
    db.collection('vehicle_inspections').where('company_id', '==', companyId).get(),
    db.collection('profiles').where('company_id', '==', companyId).get(),
    db.collection('vehicles').where('company_id', '==', companyId).get(),
  ]);

  const checksCompleted = checksSnap.size;
  const defectsReported = reportedSnap.size;
  const defectsResolved = resolvedSnap.size;
  const resolutionRate = defectsReported > 0 ? Math.round((defectsResolved / defectsReported) * 100) : null;

  const openDefects = allDefectsSnap.docs
    .map((doc) => doc.data() as {
      status?: string;
      severity?: string;
      vehicle_registration?: string;
      registration?: string;
      vehicle_id?: string;
      description?: string;
      defect?: string;
      notes?: string;
      reported_at?: Timestamp | string;
      reported_by?: string;
    })
    .filter((defect) => defect.status !== 'resolved');
  const criticalOpenDefects = openDefects.filter((defect) => {
    const sev = (defect.severity || '').toLowerCase();
    return sev === 'critical' || sev === 'high';
  }).length;

  const latestInspectionData = latestInspectionSnap.docs[0]?.data() as { inspected_at?: Timestamp } | undefined;
  const latestDate = latestInspectionData?.inspected_at?.toDate?.();
  const inactivityDays = latestDate ? Math.floor((Date.now() - latestDate.getTime()) / 86400000) : null;
  const profilesById: Record<string, { first_name?: string; last_name?: string; display_name?: string; email?: string }> = {};
  profilesSnap.docs.forEach((profileDoc) => {
    profilesById[profileDoc.id] = profileDoc.data() as {
      first_name?: string;
      last_name?: string;
      display_name?: string;
      email?: string;
    };
  });
  const vehiclesById: Record<string, { registration?: string; make?: string; model?: string }> = {};
  vehiclesSnap.docs.forEach((vehicleDoc) => {
    vehiclesById[vehicleDoc.id] = vehicleDoc.data() as { registration?: string; make?: string; model?: string };
  });

  const allInspections = allInspectionsSnap.docs.map((docSnap) =>
    docSnap.data() as { inspected_at?: Timestamp | string; inspected_by?: string }
  );
  const allDefects = allDefectsSnap.docs.map((docSnap) =>
    docSnap.data() as {
      reported_at?: Timestamp | string;
      resolved_at?: Timestamp | string;
      reported_by?: string;
    }
  );
  const inspectionsInMonth = allInspections.filter((inspection) =>
    isWithinRange(inspection.inspected_at, start, end)
  );
  const defectsInMonth = allDefects.filter((defect) => isWithinRange(defect.reported_at, start, end));
  const reportingUsers = new Set<string>();
  inspectionsInMonth.forEach((inspection) => {
    if (inspection.inspected_by) reportingUsers.add(inspection.inspected_by);
  });
  defectsInMonth.forEach((defect) => {
    if (defect.reported_by) reportingUsers.add(defect.reported_by);
  });
  const usersReportedCount = reportingUsers.size;
  const usersNotReportedCount = Math.max(0, profilesSnap.size - usersReportedCount);

  const openDefectsList = openDefects.map((defect) => {
    const mappedVehicle = defect.vehicle_id ? vehiclesById[defect.vehicle_id] : undefined;
    const reporter = defect.reported_by ? profilesById[defect.reported_by] : undefined;
    const reporterName = reporter
      ? reporter.display_name ||
        `${reporter.first_name || ''} ${reporter.last_name || ''}`.trim() ||
        reporter.email ||
        ''
      : '';
    const raised = defect.reported_at
      ? (defect.reported_at instanceof Timestamp
          ? defect.reported_at.toDate()
          : new Date(defect.reported_at)
        ).toLocaleDateString('en-GB')
      : 'Unknown date';
    const baseDescription = defect.description || defect.defect || defect.notes || 'Defect reported';
    const priority: 'critical' | 'standard' =
      (defect.severity || '').toLowerCase() === 'critical' || (defect.severity || '').toLowerCase() === 'high'
        ? 'critical'
        : 'standard';

    return {
      vehicle:
        defect.vehicle_registration ||
        defect.registration ||
        mappedVehicle?.registration ||
        (mappedVehicle?.make || mappedVehicle?.model
          ? `${mappedVehicle?.make || ''} ${mappedVehicle?.model || ''}`.trim()
          : '') ||
        'Unknown vehicle',
      description: reporterName ? `${baseDescription} (reported by ${reporterName})` : baseDescription,
      raised,
      priority,
      status: 'open' as const,
    };
  });

  const trend = getRecentMonthValues(month, 4).map((monthValue) => {
    const range = monthToRange(monthValue);
    const checks = allInspections.filter((inspection) =>
      isWithinRange(inspection.inspected_at, range.start, range.end)
    ).length;
    const defectsReported = allDefects.filter((defect) =>
      isWithinRange(defect.reported_at, range.start, range.end)
    ).length;
    const defectsResolved = allDefects.filter((defect) =>
      isWithinRange(defect.resolved_at, range.start, range.end)
    ).length;
    return {
      month: formatMonthLabel(monthValue),
      checks,
      defectsReported,
      defectsResolved,
    };
  });

  return {
    checksCompleted,
    defectsReported,
    defectsResolved,
    resolutionRate,
    openDefects: openDefects.length,
    criticalOpenDefects,
    inactivityDays,
    usersReportedCount,
    usersNotReportedCount,
    trend,
    openDefectsList,
  };
}

function loadServerLogoDataUrl(): string | undefined {
  const logoPath = join(process.cwd(), 'public', 'logo.png');
  if (!existsSync(logoPath)) return undefined;
  try {
    const raw = readFileSync(logoPath);
    return `data:image/png;base64,${raw.toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertAdmin(request);
    const db = getAdminDb();
    const transporter = getTransporter();

    const queuedSnap = await db
      .collection('admin_report_dispatch_queue')
      .where('status', '==', 'queued')
      .orderBy('created_at', 'asc')
      .limit(20)
      .get();

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const queueDoc of queuedSnap.docs) {
      processed += 1;
      const queueData = queueDoc.data() as {
        company_id?: string;
        month?: string;
        template?: string;
        recipient_email?: string;
      };
      const companyId = queueData.company_id || '';
      const month = queueData.month || '';
      const recipientEmail = queueData.recipient_email || '';
      const template = (queueData.template || 'executive') as MonthlyCompanyReportTemplate;

      if (!companyId || !month || !recipientEmail) {
        failed += 1;
        await queueDoc.ref.update({
          status: 'failed',
          last_error: 'Missing company/month/recipient',
          updated_at: Timestamp.now(),
        });
        continue;
      }

      try {
        const [companySnap, stats] = await Promise.all([
          db.collection('companies').doc(companyId).get(),
          buildMonthlyStats(companyId, month),
        ]);
        const companyName = companySnap.exists ? companySnap.data()?.name || companyId : companyId;
        const monthLabel = formatMonthLabel(month);
        const reportBytes = buildAdminMonthlyCompanyReportPdfBytes(
          {
            companyName,
            monthLabel,
            generatedAt: new Date(),
            generatedBy: 'Stock Track PRO Admin Processor',
            template,
            checksCompleted: stats.checksCompleted,
            defectsReported: stats.defectsReported,
            defectsResolved: stats.defectsResolved,
            resolutionRate: stats.resolutionRate,
            openDefects: stats.openDefects,
            criticalOpenDefects: stats.criticalOpenDefects,
            daysSinceLastCheck: stats.inactivityDays,
            inactivityDays: stats.inactivityDays,
            usersReportedCount: stats.usersReportedCount,
            usersNotReportedCount: stats.usersNotReportedCount,
            trend: stats.trend,
            openDefectsList: stats.openDefectsList,
            summaryNote:
              `Automated monthly dispatch for ${companyName}. ` +
              `Checks: ${stats.checksCompleted}, defects reported: ${stats.defectsReported}, defects resolved: ${stats.defectsResolved}.`,
          },
          { logoDataUrl: loadServerLogoDataUrl() }
        );
        const reportFilename = `stp-monthly-report-${companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')}-${month}.pdf`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: recipientEmail,
          subject: `Stock Track PRO monthly report - ${companyName} - ${monthLabel}`,
          text:
            `Monthly performance summary for ${companyName} (${monthLabel})\n\n` +
            `Template: ${template}\n` +
            `Checks completed: ${stats.checksCompleted}\n` +
            `Defects reported: ${stats.defectsReported}\n` +
            `Defects resolved: ${stats.defectsResolved}\n` +
            `Resolution rate: ${stats.resolutionRate === null ? 'N/A' : `${stats.resolutionRate}%`}\n\n` +
            `Attached: monthly PDF report.\n` +
            `Generated by Stock Track PRO Admin Panel.`,
          attachments: [
            {
              filename: reportFilename,
              content: Buffer.from(reportBytes),
              contentType: 'application/pdf',
            },
          ],
        });

        await queueDoc.ref.update({
          status: 'sent',
          sent_at: Timestamp.now(),
          last_error: null,
          updated_at: Timestamp.now(),
        });

        await db.collection('admin_report_dispatch_logs').add({
          queue_id: queueDoc.id,
          company_id: companyId,
          company_name: companyName,
          month,
          month_label: monthLabel,
          template,
          recipient_email: recipientEmail,
          stats,
          sent_at: Timestamp.now(),
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : 'Unknown send failure';
        await queueDoc.ref.update({
          status: 'failed',
          last_error: message,
          updated_at: Timestamp.now(),
        });
      }
    }

    return NextResponse.json({ processed, sent, failed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process queue';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
