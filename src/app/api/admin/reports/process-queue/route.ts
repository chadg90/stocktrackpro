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
}> {
  const db = getAdminDb();
  const { start, end } = monthToRange(month);
  const startTs = Timestamp.fromDate(start);
  const endTs = Timestamp.fromDate(end);

  const [checksSnap, reportedSnap, resolvedSnap, allDefectsSnap, latestInspectionSnap] = await Promise.all([
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
  ]);

  const checksCompleted = checksSnap.size;
  const defectsReported = reportedSnap.size;
  const defectsResolved = resolvedSnap.size;
  const resolutionRate = defectsReported > 0 ? Math.round((defectsResolved / defectsReported) * 100) : null;

  const openDefects = allDefectsSnap.docs
    .map((doc) => doc.data() as { status?: string; severity?: string })
    .filter((defect) => defect.status !== 'resolved');
  const criticalOpenDefects = openDefects.filter((defect) => {
    const sev = (defect.severity || '').toLowerCase();
    return sev === 'critical' || sev === 'high';
  }).length;

  const latestInspectionData = latestInspectionSnap.docs[0]?.data() as { inspected_at?: Timestamp } | undefined;
  const latestDate = latestInspectionData?.inspected_at?.toDate?.();
  const inactivityDays = latestDate ? Math.floor((Date.now() - latestDate.getTime()) / 86400000) : null;

  return {
    checksCompleted,
    defectsReported,
    defectsResolved,
    resolutionRate,
    openDefects: openDefects.length,
    criticalOpenDefects,
    inactivityDays,
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
