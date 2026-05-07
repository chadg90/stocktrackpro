import { NextRequest, NextResponse } from 'next/server';
import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';
import { buildAdminMonthlyCompanyReportHtmlPdfBytes } from '@/lib/adminMonthlyCompanyReportHtmlPdf';
import { buildReportFilename, normalizeReportInput } from '@/lib/adminMonthlyCompanyReportInput';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const maxDuration = 30;
export const runtime = 'nodejs';

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

export async function POST(request: NextRequest) {
  try {
    await assertAdmin(request);
    const raw = (await request.json()) as MonthlyCompanyReportInput;
    const reportInput = normalizeReportInput(raw);
    const pdfBytes = await buildAdminMonthlyCompanyReportHtmlPdfBytes(reportInput);
    const filename = buildReportFilename(reportInput.companyName, reportInput.monthLabel);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate PDF';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

