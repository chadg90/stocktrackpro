import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { MonthlyCompanyReportInput } from '@/lib/adminMonthlyCompanyReportPdf';
import { buildAdminMonthlyCompanyReportPdfBytes } from '@/lib/adminMonthlyCompanyReportPdf';
import { buildReportFilename } from '@/lib/adminMonthlyCompanyReportInput';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const maxDuration = 30;
export const runtime = 'nodejs';

// PDF rendering is CPU-heavy; cap per-IP generation to prevent spam/abuse.
const PDF_WINDOW_MS = 60_000;
const PDF_MAX_REQUESTS = 10;

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

let cachedLogoDataUrl: string | null | undefined;

/** Fleet Track PRO logo for the PDF header. Cached per instance; absent logo falls back to a drawn mark. */
async function loadLogoDataUrl(): Promise<string | undefined> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl ?? undefined;
  try {
    const bytes = await readFile(join(process.cwd(), 'public', 'report-logo-uploaded.png'));
    cachedLogoDataUrl = `data:image/png;base64,${bytes.toString('base64')}`;
  } catch (error) {
    console.warn('Admin report: logo not found, using drawn fallback', error instanceof Error ? error.message : error);
    cachedLogoDataUrl = null;
  }
  return cachedLogoDataUrl ?? undefined;
}

function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u0100-\u017F\s]/g, '')
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
    const ip = getClientIp(request);
    if (!rateLimit(ip, 'admin-generate-pdf', PDF_WINDOW_MS, PDF_MAX_REQUESTS)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    await assertAdmin(request);
    const payload = (await request.json()) as MonthlyCompanyReportInput;
    const reportInput = normalizeReportInput(payload);
    // App Hosting / Cloud Run does not ship Chromium system libs (libnspr4 etc.),
    // so Puppeteer/@sparticuz/chromium fails at launch. Use jsPDF instead.
    const logoDataUrl = await loadLogoDataUrl();
    const pdfBytes = buildAdminMonthlyCompanyReportPdfBytes(reportInput, { logoDataUrl });
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

