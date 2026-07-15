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
      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-3xl">
        <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
          Compliance Centre
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Fleet compliance guidance for UK operators
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-12">
          Practical articles on defect records, moving from paper to digital inspections, staying ahead of MOT and tax
          renewals, and keeping plant machinery examination records in order — written for fleets that take compliance
          seriously.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed mb-12 -mt-8">
          Use Fleet Track PRO&apos;s optional Plant &amp; Machinery module to complete LOLER, service, pre-hire/off-hire,
          and PUWER forms in one inspection entry — from £12 per machine per month (min 3), with separate PDFs,
          examination due reminders, and manager alerts.
        </p>
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/compliance-centre/${article.slug}`}
                className="block mkt-card p-6 hover:border-[var(--brand-blue)]/40"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{article.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed">{article.metaDescription}</p>
                <span className="inline-flex mt-4 text-[var(--brand-blue)] text-sm font-medium">
                  Read article →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
