import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { monthlyRevenueGbp, type AdminCompanyPlanFields } from '@/lib/adminCompanyMetrics';

export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

async function requireAdmin(request: NextRequest): Promise<{ uid: string } | NextResponse> {
  const ip = getClientIp(request);
  if (!rateLimit(ip, 'admin-mrr', WINDOW_MS, MAX_REQUESTS)) {
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

/** Sum of each paying company's monthly amount (loyalty price, or list price with annual ÷ 12). */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const db = getAdminDb();
  const companiesSnap = await db.collection('companies').get();
  let mrrGbp = 0;
  for (const docSnap of companiesSnap.docs) {
    mrrGbp += monthlyRevenueGbp(docSnap.data() as AdminCompanyPlanFields);
  }

  return NextResponse.json({ mrrGbp: Math.round(mrrGbp * 100) / 100 });
}
