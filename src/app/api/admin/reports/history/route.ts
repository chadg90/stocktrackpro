import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

async function assertAdmin(request: NextRequest): Promise<void> {
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
}

export async function GET(request: NextRequest) {
  try {
    await assertAdmin(request);
    const db = getAdminDb();
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get('limit') || '20');
    const max = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;

    const logsSnap = await db
      .collection('admin_report_dispatch_logs')
      .orderBy('sent_at', 'desc')
      .limit(max)
      .get();

    const rows = logsSnap.docs.map((doc) => {
      const data = doc.data() as {
        company_id?: string;
        company_name?: string;
        month?: string;
        month_label?: string;
        template?: string;
        recipient_email?: string;
        stats?: Record<string, unknown>;
        sent_at?: { toDate?: () => Date };
      };
      return {
        id: doc.id,
        company_id: data.company_id || '',
        company_name: data.company_name || data.company_id || '',
        month: data.month || '',
        month_label: data.month_label || data.month || '',
        template: data.template || '',
        recipient_email: data.recipient_email || '',
        stats: data.stats || {},
        sent_at: data.sent_at?.toDate ? data.sent_at.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ items: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load history';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
