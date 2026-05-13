import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { ComplianceArticleJsonLd } from '@/components/seo/ComplianceArticleJsonLd';
import {
  COMPLIANCE_ARTICLES,
  complianceArticleBySlug,
  type ComplianceArticle,
} from '@/content/complianceArticles';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPLIANCE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = complianceArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `/compliance-centre/${slug}` },
    openGraph: {
      title: `${article.title} | Stock Track PRO`,
      description: article.metaDescription,
      url: `https://www.stocktrackpro.co.uk/compliance-centre/${slug}`,
      siteName: 'Stock Track PRO',
      locale: 'en_GB',
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified ?? article.datePublished,
    },
  };
}

function ArticleBody({ article }: { article: ComplianceArticle }) {
  switch (article.slug) {
    case 'o-licence-defect-records':
      return (
        <div className="prose prose-invert prose-lg max-w-none text-white/80 space-y-4">
          <p>
            Under UK operator licensing rules, you must be able to show that defects are recorded, assessed, and dealt with in
            a timely manner. A valid defect record is more than a note on a clipboard — it should identify the vehicle,
            describe the fault clearly, show who reported it and when, and document what action was taken (including who
            authorised continued use, if applicable).
          </p>
          <p>
            Digital systems strengthen your position at an O-licence audit because timestamps, photographs, and repair
            close-outs are harder to dispute than incomplete paper trails. Stock Track PRO keeps each stage of that journey
            in one place, aligned with what DVSA expects operators to demonstrate.
          </p>
          <p className="text-white/55 text-sm italic">
            This article summarises general principles and is not legal advice; always confirm requirements with current DVSA
            guidance and your transport solicitor where needed.
          </p>
        </div>
      );
    case 'paper-vs-digital-inspection-sheets':
      return (
        <div className="prose prose-invert prose-lg max-w-none text-white/80 space-y-4">
          <p>
            Paper inspection sheets are easy to lose, slow to search, and painful to reconstruct months later. Digital{' '}
            <strong className="text-white">fleet inspection software UK</strong> teams now rely on turns driver checks into
            structured data — photos, signatures, and defects tied to a vehicle and time — without extra admin at the end of
            the day.
          </p>
          <p>
            When a defect is logged digitally as part of a <strong className="text-white">vehicle defect reporting app</strong>{' '}
            workflow, managers and fitters see the same information at once. That reduces &quot;never got the paperwork&quot;
            risk and builds an audit trail that stands up when you need to evidence compliance.
          </p>
          <p>
            Stock Track PRO is built around that workflow: inspections, defects, and repairs recorded consistently so you can
            defend your processes under scrutiny — not scramble for filing cabinets the week before a DVSA visit.
          </p>
        </div>
      );
    case 'mot-expiry-tracking-for-fleets':
      return (
        <div className="prose prose-invert prose-lg max-w-none text-white/80 space-y-4">
          <p>
            At scale, <strong className="text-white">MOT tracking software for fleets</strong> is not a nice-to-have — it is
            how you avoid vehicles slipping through cracks when spreadsheets and diary notes diverge. Tax and MOT dates change;
            vehicles enter and leave the fleet; hire vehicles rotate. A single dashboard with proactive reminders reduces the
            chance of driving non-compliant.
          </p>
          <p>
            Effective operators combine MOT and tax visibility with driver-level habits: daily checks that surface defects
            before they become roadside failures. Alerts should reach the people who can act — fleet administrators and
            workshop teams — not hide in an unread inbox.
          </p>
          <p>
            Stock Track PRO ties renewal visibility to the same platform as inspections and defects, so compliance is one
            operational rhythm rather than three separate lists.
          </p>
        </div>
      );
    default:
      return null;
  }
}

export default async function ComplianceArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = complianceArticleBySlug(slug);
  if (!article) notFound();

  const related = COMPLIANCE_ARTICLES.filter((a) => a.slug !== slug);

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <ComplianceArticleJsonLd article={article} />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14">
          <article>
            <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-4">
              <Link href="/compliance-centre" className="hover:underline">
                Compliance Centre
              </Link>
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">{article.title}</h1>
            <ArticleBody article={article} />
          </article>
          <aside className="lg:sticky lg:top-28 h-fit space-y-6">
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6">
              <p className="text-white font-semibold mb-3">Try the platform</p>
              <p className="text-white/65 text-sm mb-4">
                See how inspections, defects, and reminders come together for UK fleets.
              </p>
              <Link
                href="/onboarding"
                className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
              >
                Try Stock Track PRO Free for 7 Days →
              </Link>
            </div>
          </aside>
        </div>

        <section className="mt-16 pt-12 border-t border-white/10 max-w-3xl">
          <h2 className="text-lg font-semibold text-white mb-4">Related articles</h2>
          <ul className="space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/compliance-centre/${r.slug}`} className="text-[var(--brand-blue)] hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
