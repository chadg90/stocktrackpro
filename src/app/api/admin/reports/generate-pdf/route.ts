import { NextRequest, NextResponse } from 'next/server';
import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';
import { buildAdminMonthlyCompanyReportHtmlPdfBytes } from '@/lib/adminMonthlyCompanyReportHtmlPdf';
import { buildReportFilename } from '@/lib/adminMonthlyCompanyReportInput';
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

function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n|\r|\n/g, '<br>')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u0100-\u017F<>\/\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeReportInput(raw: MonthlyCompanyReportInput): MonthlyCompanyReportInput {
  const generatedAtRaw = (raw as unknown as { generatedAt?: Date | string }).generatedAt;
  const generatedAt =
    generatedAtRaw instanceof Date
      ? generatedAtRaw
      : generatedAtRaw
        ? new Date(generatedAtRaw)
        : new Date();
  const safeGeneratedAt = Number.isNaN(generatedAt.getTime()) ? new Date() : generatedAt;

  return {
    ...raw,
    generatedAt: safeGeneratedAt,
    companyName: sanitizeText(raw.companyName || ''),
    monthLabel: sanitizeText(raw.monthLabel || ''),
    openDefectsList: (raw.openDefectsList || []).map((row) => ({
      ...row,
      vehicle: sanitizeText(row.vehicle || ''),
      description: sanitizeText(row.description || ''),
      raised: sanitizeText(row.raised || ''),
    })),
  };
}

export async function POST(request: NextRequest) {
  try {
    await assertAdmin(request);
    const payload = (await request.json()) as MonthlyCompanyReportInput;
    const reportInput = normalizeReportInput(payload);
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

