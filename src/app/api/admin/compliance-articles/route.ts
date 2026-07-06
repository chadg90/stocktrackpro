import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { assertAdmin } from '@/lib/api/assert-admin';
import {
  getAllCmsArticlesForAdmin,
  normalizeComplianceSlug,
} from '@/lib/compliance-articles/server';
import { polishComplianceMarkdown } from '@/lib/compliance-articles/polish';
import {
  firstValidationError,
  hasBlockingValidationIssues,
  validateComplianceArticleInput,
} from '@/lib/compliance-articles/validate';
import { getAdminDb } from '@/lib/firebase-admin';
import type { CmsComplianceArticleInput } from '@/lib/compliance-articles/types';

export const runtime = 'nodejs';

const COLLECTION = 'compliance_articles';

function revalidateCompliancePaths(slug: string) {
  revalidatePath('/compliance-centre');
  revalidatePath(`/compliance-centre/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
}

export async function GET(request: NextRequest) {
  try {
    await assertAdmin(request);
    const articles = await getAllCmsArticlesForAdmin();
    return NextResponse.json({ articles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load articles';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUid = await assertAdmin(request);
    const body = (await request.json()) as Partial<CmsComplianceArticleInput> & { originalSlug?: string };

    const publishing = body.published === true;
    const validationIssues = validateComplianceArticleInput(body, { publishing });
    const validationError = firstValidationError(validationIssues);
    if (validationError) {
      return NextResponse.json({ error: validationError, issues: validationIssues }, { status: 400 });
    }
    if (publishing && hasBlockingValidationIssues(validationIssues)) {
      return NextResponse.json({ error: 'Fix validation issues before publishing.', issues: validationIssues }, { status: 400 });
    }

    const slug = normalizeComplianceSlug(body.slug!);
    const db = getAdminDb();
    const originalSlug = body.originalSlug ? normalizeComplianceSlug(body.originalSlug) : '';
    const isNew = !originalSlug;

    const docRef = db.collection(COLLECTION).doc(slug);
    const existingDoc = await docRef.get();

    if (isNew && existingDoc.exists) {
      return NextResponse.json({ error: 'An article with this slug already exists.' }, { status: 409 });
    }

    if (!isNew && originalSlug !== slug) {
      const targetExists = await docRef.get();
      if (targetExists.exists) {
        return NextResponse.json({ error: 'An article with this slug already exists.' }, { status: 409 });
      }
      await db.collection(COLLECTION).doc(originalSlug).delete();
    }

    const payload = {
      title: body.title!.trim(),
      metaDescription: body.metaDescription!.trim(),
      bodyMarkdown: polishComplianceMarkdown(body.bodyMarkdown!.trim(), publishing),
      datePublished: body.datePublished!,
      dateModified: body.dateModified ?? body.datePublished!,
      published: body.published === true,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isNew) {
      await docRef.set({
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: adminUid,
      });
    } else {
      await docRef.set(
        {
          ...payload,
          createdAt: existingDoc.data()?.createdAt ?? FieldValue.serverTimestamp(),
          createdBy: existingDoc.data()?.createdBy ?? adminUid,
        },
        { merge: true }
      );
    }

    revalidateCompliancePaths(slug);
    if (originalSlug && originalSlug !== slug) {
      revalidateCompliancePaths(originalSlug);
    }

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save article';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
