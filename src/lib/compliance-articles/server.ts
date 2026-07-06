import type { DocumentData } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { normalizeComplianceSlug } from './slug';
import { getStaticComplianceArticles } from './static';
import type { CmsComplianceArticle, ComplianceArticleMeta } from './types';

export { normalizeComplianceSlug };

const COLLECTION = 'compliance_articles';

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return undefined;
}

function mapDoc(id: string, data: DocumentData): CmsComplianceArticle {
  return {
    slug: id,
    title: String(data.title ?? ''),
    metaDescription: String(data.metaDescription ?? ''),
    bodyMarkdown: String(data.bodyMarkdown ?? ''),
    datePublished: String(data.datePublished ?? new Date().toISOString()),
    dateModified: data.dateModified ? String(data.dateModified) : undefined,
    published: data.published === true,
    source: 'cms',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
  };
}

export async function getPublishedCmsArticles(): Promise<CmsComplianceArticle[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection(COLLECTION).where('published', '==', true).get();
    return snap.docs
      .map((doc) => mapDoc(doc.id, doc.data()))
      .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
  } catch (error) {
    console.error('[compliance-articles] getPublishedCmsArticles failed:', error);
    return [];
  }
}

export async function getCmsArticleBySlug(slug: string): Promise<CmsComplianceArticle | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection(COLLECTION).doc(slug).get();
    if (!snap.exists) return null;
    const article = mapDoc(snap.id, snap.data()!);
    if (!article.published) return null;
    return article;
  } catch (error) {
    console.error('[compliance-articles] getCmsArticleBySlug failed:', error);
    return null;
  }
}

export async function getAllCmsArticlesForAdmin(): Promise<CmsComplianceArticle[]> {
  const db = getAdminDb();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs
    .map((doc) => mapDoc(doc.id, doc.data()))
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
}

export function mergePublishedComplianceArticles(
  cmsArticles: ComplianceArticleMeta[]
): ComplianceArticleMeta[] {
  const staticArticles = getStaticComplianceArticles();
  return [...staticArticles, ...cmsArticles].sort(
    (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
  );
}

export async function getAllPublishedComplianceArticles(): Promise<ComplianceArticleMeta[]> {
  const cms = await getPublishedCmsArticles();
  return mergePublishedComplianceArticles(cms);
}
