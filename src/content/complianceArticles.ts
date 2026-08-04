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
    title: 'Fleet defect records: what DVSA expects you to keep',
    metaDescription:
      'What UK fleet operators should record when drivers report defects — walkaround checks, timestamps, photos, and close-out evidence to reduce prohibition and fine risk.',
    datePublished: '2026-04-15T09:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'paper-vs-digital-inspection-sheets',
    title: 'Paper vs digital: why fleet managers are ditching inspection sheets',
    metaDescription:
      'How digital vehicle inspection software reduces admin, prevents missed defects, and creates stronger evidence when DVSA stops a vehicle at the roadside.',
    datePublished: '2026-05-01T09:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'mot-expiry-tracking-for-fleets',
    title: 'MOT expiry tracking for fleets — how to stay ahead of renewals',
    metaDescription:
      'Managing MOT and tax renewals across a fleet is high-risk without a system. Here is how fleet managers automate reminders and avoid enforcement.',
    datePublished: '2026-05-12T09:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'pre-use-checks-company-vehicles',
    title: 'Pre-use checks: what drivers must do before using a company vehicle',
    metaDescription:
      'What UK drivers should check before using a company vehicle, how fleet managers should record it, and why pre-use checks matter at DVSA roadside stops.',
    datePublished: '2026-06-02T09:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'digital-defect-records-dvsa-scrutiny',
    title: 'How digital defect records hold up under DVSA scrutiny',
    metaDescription:
      'What DVSA looks for in fleet defect records at roadside checks, and how digital systems provide clearer evidence than paper.',
    datePublished: '2026-06-02T09:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'nil-defect-reports-why-they-matter',
    title: 'Nil-defect reports: why “no faults found” still needs a record',
    metaDescription:
      'Why UK fleets should record nil-defect walkaround checks, what DVSA guidance expects, and how missing “all clear” records weaken your compliance evidence.',
    datePublished: '2026-08-05T00:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'how-long-to-keep-fleet-records',
    title: 'How long to keep fleet inspection and defect records (15 months)',
    metaDescription:
      'DVSA-aligned guidance on retaining walkaround checks, defect reports and repair records for at least 15 months — and what operators should be able to produce on request.',
    datePublished: '2026-08-05T00:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'closing-defects-return-to-service',
    title: 'Closing defects before return to service: the full defect loop',
    metaDescription:
      'How to run report → assess → repair → sign-off so unroadworthy vehicles do not go back on the road, and your records show a complete close-out trail.',
    datePublished: '2026-08-05T00:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
  {
    slug: 'preparing-for-dvsa-roadside-check',
    title: 'Preparing for a DVSA roadside check: evidence fleets should have ready',
    metaDescription:
      'What to expect at a DVSA roadside stop, which records help most, and how to prepare your walkaround and defect history before an examiner asks.',
    datePublished: '2026-08-05T00:00:00+01:00',
    dateModified: '2026-08-05T00:00:00+01:00',
  },
];

export function complianceArticleBySlug(slug: string): ComplianceArticle | undefined {
  return COMPLIANCE_ARTICLES.find((a) => a.slug === slug);
}
