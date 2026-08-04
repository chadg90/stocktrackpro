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
      <main className="border-t border-slate-200 bg-slate-50/80">
        <div className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-3xl">
          <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.18em] mb-4">
            Compliance Centre
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-5 leading-tight">
            Fleet compliance guidance for UK operators
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">
            Practical articles on defect records, walkaround checks, retention, roadside readiness, and MOT renewals —
            written for UK fleets that take compliance seriously.
          </p>
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/compliance-centre/${article.slug}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">{article.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{article.metaDescription}</p>
                  <span className="inline-flex mt-4 text-[var(--brand-blue)] text-sm font-semibold">
                    Read article →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
