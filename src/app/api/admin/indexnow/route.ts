import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/api/assert-admin';
import {
  getMarketingUrlsForIndexNow,
  submitUrlsToIndexNow,
} from '@/lib/indexnow';

export const runtime = 'nodejs';

/**
 * Admin-only: submit marketing URLs to IndexNow (Bing + partners).
 * POST body optional: { "urls": ["https://…"] } — otherwise submits the full public set.
 */
export async function POST(request: NextRequest) {
  try {
    await assertAdmin(request);

    let urls: string[] | undefined;
    try {
      const body = (await request.json()) as { urls?: string[] };
      if (Array.isArray(body.urls) && body.urls.length > 0) {
        urls = body.urls.filter((u) => typeof u === 'string');
      }
    } catch {
      // empty body is fine — submit full marketing set
    }

    const urlList = urls?.length ? urls : await getMarketingUrlsForIndexNow();
    const result = await submitUrlsToIndexNow(urlList);

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'IndexNow failed';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
