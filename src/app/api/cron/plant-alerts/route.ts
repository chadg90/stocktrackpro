/**
 * GET /api/cron/plant-alerts
 * Vercel cron job — runs daily at 08:00 UTC.
 * Scans all companies with has_plant_module=true and sends alerts for:
 * - LOLER due in ≤14 days or overdue
 * - PUWER due in ≤14 days or overdue
 * - Service due in ≤14 days or overdue
 * - Hire agreements expiring in ≤7 days
 *
 * Secured by CRON_SECRET header (set as Vercel env var).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { sendPlantNotification } from '@/lib/plantNotifications';

const LOLER_WARN_DAYS = 14;
const SERVICE_WARN_DAYS = 14;
const HIRE_WARN_DAYS = 7;

function daysUntil(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const now = new Date();
  return Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
  }

  const db = getAdminDb();
  let alertsSent = 0;
  let errors = 0;

  try {
    // Get all companies with plant module active
    const orgsSnap = await db
      .collection('organisations')
      .where('has_plant_module', '==', true)
      .where('plant_module_status', '==', 'active')
      .get();

    for (const orgDoc of orgsSnap.docs) {
      const companyId = orgDoc.id;

      const machinesSnap = await db
        .collection('plant_machines')
        .where('company_id', '==', companyId)
        .where('status', '!=', 'retired')
        .get();

      for (const machineDoc of machinesSnap.docs) {
        const m = machineDoc.data();
        const name = m.name as string;
        const assetNumber = m.asset_number as string;
        const basePayload = { db, companyId, machineName: name, machineAssetNumber: assetNumber };

        // LOLER
        if (m.next_loler_due) {
          const days = daysUntil(m.next_loler_due);
          if (days !== null) {
            try {
              if (days < 0) {
                await sendPlantNotification({ ...basePayload, alertType: 'loler_overdue', dueDate: m.next_loler_due });
                alertsSent++;
              } else if (days <= LOLER_WARN_DAYS) {
                await sendPlantNotification({ ...basePayload, alertType: 'loler_due_soon', dueDate: m.next_loler_due });
                alertsSent++;
              }
            } catch { errors++; }
          }
        }

        // PUWER
        if (m.next_puwer_due) {
          const days = daysUntil(m.next_puwer_due);
          if (days !== null) {
            try {
              if (days < 0) {
                await sendPlantNotification({ ...basePayload, alertType: 'puwer_overdue', dueDate: m.next_puwer_due });
                alertsSent++;
              } else if (days <= LOLER_WARN_DAYS) {
                await sendPlantNotification({ ...basePayload, alertType: 'puwer_due_soon', dueDate: m.next_puwer_due });
                alertsSent++;
              }
            } catch { errors++; }
          }
        }

        // Service
        if (m.next_service_due) {
          const days = daysUntil(m.next_service_due);
          if (days !== null) {
            try {
              if (days < 0) {
                await sendPlantNotification({ ...basePayload, alertType: 'service_overdue', dueDate: m.next_service_due });
                alertsSent++;
              } else if (days <= SERVICE_WARN_DAYS) {
                await sendPlantNotification({ ...basePayload, alertType: 'service_due_soon', dueDate: m.next_service_due });
                alertsSent++;
              }
            } catch { errors++; }
          }
        }

        // Hire expiry
        if (m.is_hired && m.hire_end) {
          const days = daysUntil(m.hire_end);
          if (days !== null && days >= 0 && days <= HIRE_WARN_DAYS) {
            try {
              await sendPlantNotification({ ...basePayload, alertType: 'hire_expiring', dueDate: m.hire_end });
              alertsSent++;
            } catch { errors++; }
          }
        }
      }
    }

    return NextResponse.json({ ok: true, alertsSent, errors });
  } catch (err) {
    console.error('[GET /api/cron/plant-alerts]', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
