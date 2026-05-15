/**
 * Plant & Machinery Module — Notification helpers
 *
 * Sends email (nodemailer) + Expo push notifications for 9 trigger types:
 * 1. loler_due_soon      — LOLER exam due within warning window
 * 2. loler_overdue       — LOLER exam past due date
 * 3. puwer_due_soon      — PUWER inspection due within window
 * 4. puwer_overdue       — PUWER inspection overdue
 * 5. service_due_soon    — Service due within window
 * 6. service_overdue     — Service overdue
 * 7. hire_expiring       — Hire agreement ending within 7 days
 * 8. prohibition_issued  — Machine prohibited from use
 * 9. inspection_fail     — Inspection result is "fail"
 */

import nodemailer from 'nodemailer';
import type { PlantAlertType } from '@/types/plant';
import type { Firestore } from 'firebase-admin/firestore';

type PlantNotificationPayload = {
  db: Firestore;
  companyId: string;
  machineName: string;
  machineAssetNumber: string;
  alertType: PlantAlertType;
  dueDate?: string;
  reason?: string;          // For prohibition_issued
  inspectionRef?: string;   // For inspection_fail
};

type CompanyManager = {
  uid: string;
  email?: string;
  expoPushToken?: string;
  name?: string;
};

const ALERT_LABELS: Record<PlantAlertType, string> = {
  loler_due_soon: 'LOLER Examination Due Soon',
  loler_overdue: 'LOLER Examination Overdue',
  puwer_due_soon: 'PUWER Inspection Due Soon',
  puwer_overdue: 'PUWER Inspection Overdue',
  service_due_soon: 'Service Due Soon',
  service_overdue: 'Service Overdue',
  hire_expiring: 'Hire Agreement Expiring',
  prohibition_issued: 'Machine Prohibited from Use',
  inspection_fail: 'Inspection Failed',
};

function alertMessage(payload: PlantNotificationPayload): string {
  const { machineName, machineAssetNumber, alertType, dueDate, reason, inspectionRef } = payload;
  const base = `${machineName} (${machineAssetNumber})`;
  switch (alertType) {
    case 'loler_due_soon': return `${base} — LOLER thorough examination due ${dueDate ?? 'soon'}. Schedule inspection to remain compliant.`;
    case 'loler_overdue': return `${base} — LOLER thorough examination is OVERDUE${dueDate ? ` (was due ${dueDate})` : ''}. Immediate action required.`;
    case 'puwer_due_soon': return `${base} — PUWER inspection due ${dueDate ?? 'soon'}. Schedule inspection to remain compliant.`;
    case 'puwer_overdue': return `${base} — PUWER inspection is OVERDUE${dueDate ? ` (was due ${dueDate})` : ''}. Immediate action required.`;
    case 'service_due_soon': return `${base} — Service due ${dueDate ?? 'soon'}.`;
    case 'service_overdue': return `${base} — Service is OVERDUE${dueDate ? ` (was due ${dueDate})` : ''}.`;
    case 'hire_expiring': return `${base} — Hire agreement expires ${dueDate ?? 'soon'}. Arrange return or renewal.`;
    case 'prohibition_issued': return `${base} has been PROHIBITED from use. Reason: ${reason ?? 'See machine register.'}`;
    case 'inspection_fail': return `${base} — Inspection ${inspectionRef ?? ''} FAILED. Review defects and take corrective action.`;
    default: return `${base} — Plant compliance alert.`;
  }
}

async function getCompanyManagers(db: Firestore, companyId: string): Promise<CompanyManager[]> {
  const snap = await db
    .collection('profiles')
    .where('company_id', '==', companyId)
    .where('role', 'in', ['admin', 'manager'])
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email,
      expoPushToken: data.expoPushToken,
      name: data.name ?? data.displayName ?? data.first_name ?? undefined,
    };
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  if (!from || !process.env.SMTP_HOST) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({ from, to, subject, html });
}

async function sendExpoPush(tokens: string[], title: string, body: string): Promise<void> {
  if (tokens.length === 0) return;
  const messages = tokens.map((to) => ({ to, title, body, sound: 'default' }));
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.error('[plantNotifications] Expo push failed:', err);
  }
}

function buildEmailHtml(payload: PlantNotificationPayload, message: string): string {
  const label = ALERT_LABELS[payload.alertType];
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `
    <div style="font-family: -apple-system, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; border-radius: 12px; overflow: hidden;">
      <div style="background: #000; padding: 20px 24px; border-bottom: 1px solid #1e3a5f;">
        <span style="font-size: 14px; font-weight: bold; color: #fff;">Stock Track PRO</span>
        <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">Plant &amp; Machinery</span>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 16px; font-weight: bold; color: #fff; margin: 0 0 8px 0;">${escapeHtml(label)}</p>
        <p style="font-size: 14px; color: #94a3b8; margin: 0 0 16px 0;">${escapeHtml(message)}</p>
        <a href="https://www.stocktrackpro.co.uk/dashboard/machines" 
           style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;">
          View Machine Register
        </a>
      </div>
      <div style="padding: 12px 24px; border-top: 1px solid #1e3a5f; font-size: 11px; color: #475569;">
        You are receiving this because you are a manager or admin on Stock Track PRO.<br>
        To unsubscribe from compliance alerts, contact support.
      </div>
    </div>
  `.trim();
}

/**
 * Send a plant compliance notification to all managers/admins in the company.
 * Fires email + push in parallel. Non-blocking — errors are logged but not thrown.
 */
export async function sendPlantNotification(payload: PlantNotificationPayload): Promise<void> {
  try {
    const managers = await getCompanyManagers(payload.db, payload.companyId);
    if (managers.length === 0) return;

    const label = ALERT_LABELS[payload.alertType];
    const message = alertMessage(payload);
    const subject = `[Stock Track PRO] ${label} — ${payload.machineName}`;
    const html = buildEmailHtml(payload, message);

    const pushTokens = managers.map((m) => m.expoPushToken).filter((t): t is string => !!t);
    const emailAddresses = managers.map((m) => m.email).filter((e): e is string => !!e);

    await Promise.allSettled([
      ...emailAddresses.map((email) => sendEmail(email, subject, html)),
      sendExpoPush(pushTokens, label, message),
    ]);

    // Log notification to Firestore for audit
    await payload.db.collection('notification_logs').add({
      company_id: payload.companyId,
      alert_type: payload.alertType,
      machine_name: payload.machineName,
      machine_asset_number: payload.machineAssetNumber,
      sent_to: managers.map((m) => m.uid),
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[plantNotifications] sendPlantNotification error:', err);
  }
}
