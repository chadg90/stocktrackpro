export type ComplianceArticle = {
  slug: string;
  title: string;
  metaDescription: string;
  /** ISO 8601 date for Article schema (Google / AI). */
  datePublished: string;
  dateModified?: string;
};

export const COMPLIANCE_ARTICLES: ComplianceArticle[] = [
  {
    slug: 'o-licence-defect-records',
    title: 'What counts as a valid defect record for your O-licence?',
    metaDescription:
      'DVSA guidance explained — what your defect records must include to satisfy O-licence requirements and avoid prohibition notices.',
    datePublished: '2026-04-15T09:00:00+01:00',
    dateModified: '2026-05-13T09:00:00+01:00',
  },
  {
    slug: 'paper-vs-digital-inspection-sheets',
    title: 'Paper vs Digital: Why fleet managers are ditching inspection sheets',
    metaDescription:
      'How digital vehicle inspection software reduces admin, prevents missed defects, and creates a court-admissible audit trail for UK fleet operators.',
    datePublished: '2026-05-01T09:00:00+01:00',
    dateModified: '2026-05-13T09:00:00+01:00',
  },
  {
    slug: 'mot-expiry-tracking-for-fleets',
    title: 'MOT expiry tracking for fleets — how to stay ahead of renewals',
    metaDescription:
      'Managing MOT and tax renewals across a large fleet is high-risk without a system. Here is how smart fleet managers automate the process.',
    datePublished: '2026-05-12T09:00:00+01:00',
    dateModified: '2026-05-13T09:00:00+01:00',
  },
];

export function complianceArticleBySlug(slug: string): ComplianceArticle | undefined {
  return COMPLIANCE_ARTICLES.find((a) => a.slug === slug);
}
