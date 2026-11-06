import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { normalizeReferralCode, isReferralCodeFormatValid } from '@/lib/referralCode';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;

async function requireAdmin(request: NextRequest): Promise<{ uid: string } | NextResponse> {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 'admin-referral-codes', WINDOW_MS, MAX_REQUESTS)) {
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

/** Create or update an invite-only referral code (Admin SDK). */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  let body: { code?: string; referrerId?: string; referrerLabel?: string; active?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const code = normalizeReferralCode(body.code);
  if (!isReferralCodeFormatValid(code) || code.length < 3) {
    return NextResponse.json(
      { error: 'Code must be 3–20 characters: letters, numbers, or hyphens' },
      { status: 400 }
    );
  }
  const referrerId = typeof body.referrerId === 'string' ? body.referrerId.trim() : '';
  if (!referrerId || referrerId.length > 128) {
    return NextResponse.json({ error: 'referrerId is required' }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection('referralCodes').doc(code);
  const existing = await ref.get();
  const payload = {
    code,
    referrerId,
    referrerLabel:
      typeof body.referrerLabel === 'string' && body.referrerLabel.trim()
        ? body.referrerLabel.trim().slice(0, 120)
        : null,
    active: body.active === false ? false : true,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: auth.uid,
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp(), createdBy: auth.uid }),
  };
  await ref.set(payload, { merge: true });
  return NextResponse.json({ ok: true, code });
}
