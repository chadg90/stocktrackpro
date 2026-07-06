import {
  COMPLIANCE_ARTICLES,
  complianceArticleBySlug,
  type ComplianceArticle,
} from '@/content/complianceArticles';
import type { ComplianceArticleMeta } from './types';

export const STATIC_COMPLIANCE_SLUGS = new Set(COMPLIANCE_ARTICLES.map((a) => a.slug));

export function getStaticComplianceArticles(): ComplianceArticleMeta[] {
  return COMPLIANCE_ARTICLES.map((article) => ({
    slug: article.slug,
    title: article.title,
    metaDescription: article.metaDescription,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    source: 'static' as const,
  }));
}

export function getStaticComplianceArticle(slug: string): ComplianceArticle | undefined {
  return complianceArticleBySlug(slug);
}

export function isStaticComplianceSlug(slug: string): boolean {
  return STATIC_COMPLIANCE_SLUGS.has(slug);
}
