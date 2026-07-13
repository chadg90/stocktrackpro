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
    slug: 'van-fleet-defect-records',
    title: 'Van fleet defect records: what DVSA expects you to keep',
    metaDescription:
      'What UK van fleet operators should record when drivers report defects — walkaround checks, timestamps, photos, and close-out evidence to reduce prohibition and fine risk.',
    datePublished: '2026-04-15T09:00:00+01:00',
    dateModified: '2026-07-06T09:00:00+01:00',
  },
  {
    slug: 'paper-vs-digital-inspection-sheets',
    title: 'Paper vs digital: why fleet managers are ditching inspection sheets',
    metaDescription:
      'How digital van inspection software reduces admin, prevents missed defects, and creates stronger evidence when DVSA stops a vehicle at the roadside.',
    datePublished: '2026-05-01T09:00:00+01:00',
    dateModified: '2026-07-13T13:00:00+01:00',
  },
  {
    slug: 'mot-expiry-tracking-for-fleets',
    title: 'MOT expiry tracking for fleets — how to stay ahead of renewals',
    metaDescription:
      'Managing MOT and tax renewals across a van fleet is high-risk without a system. Here is how fleet managers automate reminders and avoid enforcement.',
    datePublished: '2026-05-12T09:00:00+01:00',
    dateModified: '2026-07-13T13:00:00+01:00',
  },
  {
    slug: 'pre-use-checks-company-vehicles',
    title: 'Pre-use checks: what drivers must do before operating a company van',
    metaDescription:
      'What UK van drivers should check before using a company vehicle, how fleet managers should record it, and why pre-use checks matter at DVSA roadside stops.',
    datePublished: '2026-06-02T09:00:00+01:00',
    dateModified: '2026-07-13T13:00:00+01:00',
  },
  {
    slug: 'digital-defect-records-dvsa-scrutiny',
    title: 'How digital defect records hold up under DVSA scrutiny',
    metaDescription:
      'What DVSA looks for in van fleet defect records at roadside checks, and how digital systems provide clearer evidence than paper.',
    datePublished: '2026-06-02T09:00:00+01:00',
    dateModified: '2026-07-13T13:00:00+01:00',
  },
  {
    slug: 'loler-thorough-examination-records',
    title: 'LOLER thorough examination records: what UK operators must keep',
    metaDescription:
      'What LOLER requires for lifting equipment on site — thorough examination intervals, competent persons, reports, and how long records must be kept.',
    datePublished: '2026-07-06T09:00:00+01:00',
  },
  {
    slug: 'plant-machinery-service-vs-loler-examination',
    title: 'Plant service inspections vs LOLER thorough examinations',
    metaDescription:
      'The difference between routine plant maintenance, pre-use checks, and statutory LOLER thorough examinations — and why conflating them creates compliance risk.',
    datePublished: '2026-07-06T09:00:00+01:00',
  },
  {
    slug: 'plant-examination-due-date-tracking',
    title: 'Tracking plant examination due dates before certificates lapse',
    metaDescription:
      'How UK site managers avoid overdue LOLER examinations — due date registers, manager alerts, and keeping thorough examination PDFs accessible for audits.',
    datePublished: '2026-07-06T09:00:00+01:00',
  },
];

export function complianceArticleBySlug(slug: string): ComplianceArticle | undefined {
  return COMPLIANCE_ARTICLES.find((a) => a.slug === slug);
}
