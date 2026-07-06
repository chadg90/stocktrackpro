import { isStaticComplianceSlug } from './static';
import { normalizeComplianceSlug } from './slug';
import type { CmsComplianceArticleInput } from './types';

export type ValidationIssue = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

export function validateComplianceArticleInput(
  body: Partial<CmsComplianceArticleInput>,
  options: { publishing: boolean }
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const title = body.title?.trim() ?? '';
  const metaDescription = body.metaDescription?.trim() ?? '';
  const articleBody = body.bodyMarkdown?.trim() ?? '';
  const slug = normalizeComplianceSlug(body.slug ?? '');

  if (!title) {
    issues.push({ field: 'title', message: 'Title is required', severity: 'error' });
  } else if (title.length < 12) {
    issues.push({ field: 'title', message: 'Title is quite short — aim for a clear, descriptive headline', severity: 'warning' });
  }

  if (!metaDescription) {
    issues.push({ field: 'metaDescription', message: 'Meta description is required', severity: 'error' });
  } else if (metaDescription.length < 80) {
    issues.push({
      field: 'metaDescription',
      message: 'Meta description is short — aim for 80–155 characters for Google snippets',
      severity: options.publishing ? 'error' : 'warning',
    });
  } else if (metaDescription.length > 160) {
    issues.push({
      field: 'metaDescription',
      message: 'Meta description is too long — Google may truncate after ~155 characters',
      severity: options.publishing ? 'error' : 'warning',
    });
  }

  if (!articleBody) {
    issues.push({ field: 'bodyMarkdown', message: 'Article body is required', severity: 'error' });
  } else if (articleBody.length < 300) {
    issues.push({
      field: 'bodyMarkdown',
      message: 'Article body is very short — add more depth before publishing',
      severity: options.publishing ? 'error' : 'warning',
    });
  }

  if (!body.datePublished?.trim()) {
    issues.push({ field: 'datePublished', message: 'Publish date is required', severity: 'error' });
  }

  if (!slug || slug.length < 3) {
    issues.push({ field: 'slug', message: 'Slug must be at least 3 characters', severity: 'error' });
  }
  if (isStaticComplianceSlug(slug)) {
    issues.push({
      field: 'slug',
      message: 'This slug is reserved by a built-in article. Choose a different slug.',
      severity: 'error',
    });
  }

  if (options.publishing) {
    if (!/^##\s+\S/m.test(articleBody)) {
      issues.push({
        field: 'bodyMarkdown',
        message: 'Add at least one ## section heading before publishing',
        severity: 'error',
      });
    }
    if (articleBody.split(/\n{2,}/).filter(Boolean).length < 3) {
      issues.push({
        field: 'bodyMarkdown',
        message: 'Add more paragraphs — published articles should read like a full guide',
        severity: 'error',
      });
    }
    if (!/gov\.uk|hse\.gov\.uk/i.test(articleBody)) {
      issues.push({
        field: 'bodyMarkdown',
        message: 'Link to at least one GOV.UK or HSE source for credibility and SEO',
        severity: 'warning',
      });
    }
    if (!/not legal advice/i.test(articleBody)) {
      issues.push({
        field: 'bodyMarkdown',
        message: 'A legal disclaimer will be added automatically at the end',
        severity: 'warning',
      });
    }
  }

  if (/<script|javascript:/i.test(articleBody)) {
    issues.push({ field: 'bodyMarkdown', message: 'Article body contains disallowed content', severity: 'error' });
  }

  return issues;
}

export function hasBlockingValidationIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

export function firstValidationError(issues: ValidationIssue[]): string | null {
  const blocking = issues.find((issue) => issue.severity === 'error');
  return blocking?.message ?? null;
}
