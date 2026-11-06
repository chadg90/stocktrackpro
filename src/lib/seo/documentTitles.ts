import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/brand';

/** Document title hard limit (Google SERP display). Includes brand suffix when applied. */
export const MAX_DOCUMENT_TITLE_LENGTH = 60;

export const DOCUMENT_TITLE_SUFFIX = ` | ${SITE_NAME}`;

/** Suffix length including leading space+pipe (e.g. " | Fleet Track PRO" = 18). */
export const DOCUMENT_TITLE_SUFFIX_LENGTH = DOCUMENT_TITLE_SUFFIX.length;

/**
 * Max length for a title *segment* when using the root `template: '%s | Fleet Track PRO'`.
 */
export const MAX_TITLE_SEGMENT_LENGTH = MAX_DOCUMENT_TITLE_LENGTH - DOCUMENT_TITLE_SUFFIX_LENGTH;

type ComplianceTitleOverride =
  | { prefix: string; segment: string; absolute?: undefined }
  | { prefix: string; absolute: string; segment?: undefined };

/**
 * SEO <title> overrides for compliance articles (H1 unchanged).
 * Matched by slug prefix (longest prefix wins).
 * Use `absolute` when the full SERP title must omit the brand suffix to stay ≤ 60.
 */
const COMPLIANCE_TITLE_BY_PREFIX: ComplianceTitleOverride[] = [
  { prefix: 'is-there-a-legal-requirement', segment: 'Legal Requirement for Van Checks' },
  { prefix: 'traffic-commissioner', segment: 'Traffic Commissioner Fleet Guidance' },
  { prefix: 'fleet-managers-stop', segment: 'Fleet Managers: Roadside Stops' },
  { prefix: 'are-daily-van-checks', segment: 'Are Daily Van Checks Mandatory?' },
  {
    prefix: 'penalty-points-for-no-mot',
    absolute: 'No MOT: £1,000 Fine, No Points (2026 Update)',
  },
  {
    prefix: 'how-long-to-keep',
    absolute: 'How Long to Keep Vehicle Check Records? (15 Months)',
  },
  {
    // Keep <title> aligned with the article H1 (trimmed to SERP limit).
    prefix: 'van-drivers-hours',
    absolute: "Van Drivers' Hours: GB Domestic Rules for Vans (2026)",
  },
  {
    prefix: 'drivers-hours',
    absolute: "Van Drivers' Hours: GB Domestic Rules for Vans (2026)",
  },
  { prefix: 'nil-defect', segment: 'Nil-Defect Reports for Fleet Checks' },
  { prefix: 'closing-defects', segment: 'Closing Defects Before Return to Service' },
  { prefix: 'mot-expiry', segment: 'MOT Expiry Tracking for Fleets' },
  // Other static articles — keep ≤ 42 chars so template stays ≤ 60
  { prefix: 'van-fleet-defect-records', segment: 'Fleet Defect Records DVSA Expects' },
  { prefix: 'paper-vs-digital-inspection-sheets', segment: 'Paper vs Digital Inspection Sheets' },
  { prefix: 'pre-use-checks-company-vehicles', segment: 'Pre-Use Vehicle Checks for Drivers' },
  { prefix: 'digital-defect-records-dvsa-scrutiny', segment: 'Digital Defect Records for DVSA' },
  { prefix: 'preparing-for-dvsa-roadside-check', segment: 'DVSA Roadside Check Evidence' },
];

function assertSegmentLength(segment: string, label: string) {
  if (segment.length > MAX_TITLE_SEGMENT_LENGTH) {
    throw new Error(
      `SEO title segment too long for ${label}: ${segment.length} > ${MAX_TITLE_SEGMENT_LENGTH} ("${segment}")`
    );
  }
}

function assertAbsoluteLength(absolute: string, label: string) {
  if (absolute.length > MAX_DOCUMENT_TITLE_LENGTH) {
    throw new Error(
      `SEO absolute title too long for ${label}: ${absolute.length} > ${MAX_DOCUMENT_TITLE_LENGTH} ("${absolute}")`
    );
  }
}

for (const row of COMPLIANCE_TITLE_BY_PREFIX) {
  if ('absolute' in row && row.absolute) {
    assertAbsoluteLength(row.absolute, row.prefix);
  } else if ('segment' in row && row.segment) {
    assertSegmentLength(row.segment, row.prefix);
  }
}

function matchComplianceTitleOverride(slug: string): ComplianceTitleOverride | undefined {
  return COMPLIANCE_TITLE_BY_PREFIX.filter((row) => slug.startsWith(row.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];
}

export function withBrandSuffix(segment: string): string {
  return `${segment}${DOCUMENT_TITLE_SUFFIX}`;
}

export function documentTitleLength(fullTitle: string): number {
  return fullTitle.length;
}

/**
 * Build Next.js `metadata.title` for a segment that uses the root template.
 * If the composed title would exceed 60 chars, returns `{ absolute }` trimmed.
 */
export function metadataTitleFromSegment(segment: string): NonNullable<Metadata['title']> {
  const full = withBrandSuffix(segment);
  if (full.length <= MAX_DOCUMENT_TITLE_LENGTH) return segment;
  return { absolute: full.slice(0, MAX_DOCUMENT_TITLE_LENGTH).trimEnd() };
}

/** Resolve compliance article <title> text for checks / OG (not H1). */
export function complianceTitleSegment(slug: string, fallbackTitle: string): string {
  const match = matchComplianceTitleOverride(slug);
  if (match?.absolute) return match.absolute;
  if (match?.segment) return match.segment;

  if (fallbackTitle.length <= MAX_TITLE_SEGMENT_LENGTH) return fallbackTitle;

  // Last resort: trim on a word boundary for unmapped CMS titles.
  const trimmed = fallbackTitle.slice(0, MAX_TITLE_SEGMENT_LENGTH);
  const boundary = trimmed.lastIndexOf(' ');
  return (boundary > 20 ? trimmed.slice(0, boundary) : trimmed).trimEnd();
}

export function complianceMetadataTitle(slug: string, h1Title: string): NonNullable<Metadata['title']> {
  const match = matchComplianceTitleOverride(slug);
  if (match?.absolute) return { absolute: match.absolute };
  return metadataTitleFromSegment(complianceTitleSegment(slug, h1Title));
}

/** Full document title string (for CI / checks). */
export function resolveFullDocumentTitle(title: Metadata['title'], templateSuffix = DOCUMENT_TITLE_SUFFIX): string {
  if (title == null) return `Fleet Track PRO${templateSuffix}`.replace('Fleet Track PRO | Fleet Track PRO', 'Fleet Track PRO');
  if (typeof title === 'string') return `${title}${templateSuffix}`;
  if (typeof title === 'object' && 'absolute' in title && title.absolute) return title.absolute;
  if (typeof title === 'object' && 'default' in title && title.default) {
    return typeof title.default === 'string' ? title.default : String(title.default);
  }
  return SITE_NAME;
}
