import Navbar from '@/app/components/Navbar';
import ComplianceArticleFilters from '@/components/compliance-articles/ComplianceArticleFilters';
import ComplianceCentreHubJsonLd from '@/components/seo/ComplianceCentreHubJsonLd';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';

export const dynamic = 'force-static';
export const revalidate = 3600;

export default async function ComplianceCentreHubPage() {
  const articles = await getAllPublishedComplianceArticles();

  return (
    <div className="marketing-shell">
      <MarketingWebPageJsonLd
        path="/compliance-centre"
        title="Compliance Centre"
        description="UK fleet compliance guidance — defect records, walkaround checks, retention and MOT tracking."
      />
      <ComplianceCentreHubJsonLd articles={articles} />
      <Navbar />
      <main>
        <section className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 mkt-atmosphere">
          <div className="mkt-container max-w-3xl">
            <p className="mkt-eyebrow mb-4">Compliance Centre</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--mkt-ink)] mb-5 leading-tight">
              Fleet compliance guidance for UK operators
            </h1>
            <p className="text-[var(--mkt-muted)] text-lg leading-relaxed">
              Practical articles on defect records, walkaround checks, retention, roadside readiness, and MOT renewals —
              written for UK fleets that take compliance seriously.
            </p>
          </div>
        </section>

        <section className="mkt-section bg-white border-t border-[var(--mkt-border)]">
          <div className="mkt-container max-w-3xl">
            <ComplianceArticleFilters articles={articles} />
          </div>
        </section>
      </main>
    </div>
  );
}
