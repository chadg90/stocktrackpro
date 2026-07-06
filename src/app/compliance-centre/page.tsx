import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import ComplianceCentreHubJsonLd from '@/components/seo/ComplianceCentreHubJsonLd';
import { getAllPublishedComplianceArticles } from '@/lib/compliance-articles/server';

export const revalidate = 300;

export default async function ComplianceCentreHubPage() {
  const articles = await getAllPublishedComplianceArticles();

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <ComplianceCentreHubJsonLd articles={articles} />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-3xl">
        <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
          Compliance Centre
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Fleet compliance guidance for UK operators
        </h1>
        <p className="text-white/70 text-lg leading-relaxed mb-12">
          Practical articles on defect records, moving from paper to digital inspections, staying ahead of MOT and tax
          renewals, and keeping plant machinery examination records in order — written for fleets that take compliance
          seriously.
        </p>
        <p className="text-white/55 text-sm leading-relaxed mb-12 -mt-8">
          Use Stock Track PRO&apos;s optional Plant &amp; Machinery module to complete LOLER, service, pre-hire/off-hire,
          and PUWER forms in one inspection entry — with separate PDFs, examination due reminders, and manager alerts.
        </p>
        <ul className="space-y-6">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/compliance-centre/${article.slug}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[var(--brand-blue)]/40 hover:bg-white/[0.05] transition-colors"
              >
                <h2 className="text-xl font-semibold text-white mb-2">{article.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed">{article.metaDescription}</p>
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
