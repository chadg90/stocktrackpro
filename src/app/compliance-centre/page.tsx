import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import ComplianceCentreHubJsonLd from '@/components/seo/ComplianceCentreHubJsonLd';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';

export const revalidate = 300;

export default async function ComplianceCentreHubPage() {
  const articles = await getAllPublishedComplianceArticles();

  return (
    <div className="marketing-shell">
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
            <ul className="space-y-4">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/compliance-centre/${article.slug}`}
                    className="block mkt-card p-6"
                  >
                    <h2 className="text-xl font-semibold text-[var(--mkt-ink)] mb-2">{article.title}</h2>
                    <p className="text-[var(--mkt-muted)] text-sm leading-relaxed">{article.metaDescription}</p>
                    <span className="inline-flex mt-4 text-[var(--brand-blue)] text-sm font-semibold">
                      Read article →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
