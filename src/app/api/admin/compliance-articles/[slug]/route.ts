import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/api/assert-admin';
import { isStaticComplianceSlug } from '@/lib/compliance-articles/static';
import { normalizeComplianceSlug } from '@/lib/compliance-articles/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { notifyIndexNowForPaths } from '@/lib/indexnow';

export const runtime = 'nodejs';

const COLLECTION = 'compliance_articles';

function revalidateCompliancePaths(slug: string) {
  revalidatePath('/compliance-centre');
  revalidatePath(`/compliance-centre/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await assertAdmin(request);
    const { slug: rawSlug } = await params;
    const slug = normalizeComplianceSlug(rawSlug);

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    if (isStaticComplianceSlug(slug)) {
      return NextResponse.json({ error: 'Built-in articles cannot be deleted.' }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection(COLLECTION).doc(slug).delete();

    revalidateCompliancePaths(slug);
    void notifyIndexNowForPaths(['/compliance-centre', `/compliance-centre/${slug}`]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete article';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
