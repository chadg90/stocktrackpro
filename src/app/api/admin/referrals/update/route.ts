import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  REFERRAL_COMMISSION_MONTHS,
  REFERRAL_COMMISSION_PERCENT,
  REFERRAL_PAY_DAY,
} from '@/lib/referralCode';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;

type Action = 'confirm' | 'mark_paid' | 'stop' | 'reactivate' | 'set_unrecognised_code';

async function requireAdmin(request: NextRequest): Promise<{ uid: string } | NextResponse> {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 'admin-referral-update', WINDOW_MS, MAX_REQUESTS)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  const authHeader = request.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
  const profile = await getAdminDb().collection('profiles').doc(uid).get();
  if (!profile.exists || profile.data()?.role !== 'admin') {
    return NextResponse.json({ error: 'Platform admin only' }, { status: 403 });
  }
  return { uid };
}

/**
 * Admin cash-workings updates for captured referrals.
 * No Stripe payouts — records what Chad should pay and when.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: {
    companyId?: string;
    action?: Action;
    month?: string;
    amountGbp?: number;
    note?: string;
    code?: string;
    referrerId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const companyId = typeof body.companyId === 'string' ? body.companyId.trim() : '';
  const action = body.action;
  if (!companyId || !action) {
    return NextResponse.json({ error: 'companyId and action are required' }, { status: 400 });
  }

  const db = getAdminDb();
  const referralRef = db.collection('referrals').doc(companyId);
  const companyRef = db.collection('companies').doc(companyId);
  const [referralSnap, companySnap] = await Promise.all([referralRef.get(), companyRef.get()]);
  if (!referralSnap.exists) {
    return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
  }

  const current = referralSnap.data() || {};
  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: auth.uid,
  };

  if (action === 'confirm') {
    updates.status = 'active';
    updates.confirmedAt = FieldValue.serverTimestamp();
    updates.commissionPercent = REFERRAL_COMMISSION_PERCENT;
    updates.commissionMonths = REFERRAL_COMMISSION_MONTHS;
    updates.payDay = REFERRAL_PAY_DAY;
  } else if (action === 'stop') {
    updates.status = 'stopped';
    updates.stoppedAt = FieldValue.serverTimestamp();
    updates.stopReason =
      typeof body.note === 'string' && body.note.trim()
        ? body.note.trim().slice(0, 500)
        : 'Stopped by admin';
  } else if (action === 'reactivate') {
    updates.status = 'active';
    updates.stoppedAt = FieldValue.delete();
    updates.stopReason = FieldValue.delete();
  } else if (action === 'mark_paid') {
    const month = typeof body.month === 'string' ? body.month.trim() : '';
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'month must be YYYY-MM' }, { status: 400 });
    }
    const amountGbp =
      typeof body.amountGbp === 'number' && Number.isFinite(body.amountGbp)
        ? Math.round(amountGbpSafe(body.amountGbp) * 100) / 100
        : null;
    const payments = Array.isArray(current.payments) ? [...current.payments] : [];
    const idx = payments.findIndex((p: { month?: string }) => p?.month === month);
    const entry = {
      month,
      amountGbp,
      paidAt: new Date().toISOString(),
      paidOn: REFERRAL_PAY_DAY,
      recordedBy: auth.uid,
    };
    if (idx >= 0) payments[idx] = entry;
    else payments.push(entry);
    payments.sort((a: { month: string }, b: { month: string }) => a.month.localeCompare(b.month));
    updates.payments = payments;
    updates.paidMonthsCount = payments.length;
    if (payments.length >= REFERRAL_COMMISSION_MONTHS) {
      updates.status = 'completed';
      updates.completedAt = FieldValue.serverTimestamp();
    } else if (current.status === 'pending' || current.status === 'confirmed') {
      updates.status = 'active';
    }
  } else if (action === 'set_unrecognised_code') {
    // Manual match: set referrer + move unrecognised → pending
    const referrerId = typeof body.referrerId === 'string' ? body.referrerId.trim() : '';
    if (!referrerId) {
      return NextResponse.json({ error: 'referrerId is required' }, { status: 400 });
    }
    updates.referrerId = referrerId;
    updates.status = 'pending';
    updates.matchedAt = FieldValue.serverTimestamp();
    updates.matchedBy = auth.uid;
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const batch = db.batch();
  batch.set(referralRef, updates, { merge: true });
  if (companySnap.exists && (updates.status || updates.referrerId)) {
    const companyReferral = {
      ...(typeof companySnap.data()?.referral === 'object' ? companySnap.data()!.referral : {}),
      ...(updates.status ? { status: updates.status } : {}),
    };
    batch.update(companyRef, { referral: companyReferral });
  }
  await batch.commit();

  return NextResponse.json({ ok: true });
}

function amountGbpSafe(n: number): number {
  if (n < 0) return 0;
  if (n > 100000) return 100000;
  return n;
}
