import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { absolutePageUrl } from '@/lib/site';

type LinkItem = {
  href: string;
  label: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  benefits: Array<{ title: string; description: string }>;
  workflowTitle: string;
  workflow: string[];
  evidenceTitle: string;
  evidence: string;
  related: LinkItem[];
  faqs: FaqItem[];
};

export default function CommercialFeaturePage({
  path,
  eyebrow,
  title,
  description,
  intro,
  benefits,
  workflowTitle,
  workflow,
  evidenceTitle,
  evidence,
  related,
  faqs,
}: Props) {
  const pageUrl = absolutePageUrl(path);
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absolutePageUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Features',
        item: absolutePageUrl('/features'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: pageUrl,
      },
    ],
  };

  return (
    <div className="marketing-shell">
      <MarketingWebPageJsonLd path={path} title={title} description={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <main>
        <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20 mkt-atmosphere">
          <div className="mkt-container relative">
            <div className="max-w-4xl mx-auto text-center">
              <p className="mkt-eyebrow mb-4">{eyebrow}</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--mkt-ink)] mb-6 leading-tight">
                {title}
              </h1>
              <p className="text-lg text-[var(--mkt-muted)] leading-relaxed max-w-3xl mx-auto mb-8">{intro}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold btn-brand-blue"
                >
                  Start 14-Day Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[var(--mkt-border)] text-[var(--mkt-ink)] bg-white hover:border-[var(--brand-blue)]/40 hover:bg-slate-50 transition-colors font-medium"
                >
                  View pricing
                </Link>
              </div>
              <p className="mt-4 text-sm text-[var(--mkt-muted)]">No card required · unlimited team members · minimum 2 vehicles</p>
            </div>
          </div>
        </section>

        <section className="mkt-section bg-white border-t border-[var(--mkt-border)]">
          <div className="mkt-container">
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <section key={benefit.title} className="mkt-card p-7 sm:p-8">
                  <h2 className="text-xl font-semibold text-[var(--mkt-ink)] mb-3">{benefit.title}</h2>
                  <p className="text-[var(--mkt-muted)] leading-relaxed">{benefit.description}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="mkt-section border-t border-[var(--mkt-border)] mkt-atmosphere">
          <div className="mkt-container max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--mkt-ink)] mb-8 text-center">
              {workflowTitle}
            </h2>
            <ol className="space-y-4">
              {workflow.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl border border-[var(--mkt-border)] bg-white p-5 sm:p-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-blue)] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-[var(--mkt-muted)] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mkt-section bg-white border-t border-[var(--mkt-border)]">
          <div className="mkt-container max-w-4xl">
            <div className="rounded-2xl border border-[var(--brand-blue)]/25 bg-[var(--mkt-muted-surface)] p-7 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--mkt-ink)] mb-4">{evidenceTitle}</h2>
              <p className="text-[var(--mkt-muted)] leading-relaxed">{evidence}</p>
            </div>
          </div>
        </section>

        <section className="mkt-section border-t border-[var(--mkt-border)] mkt-atmosphere">
          <div className="mkt-container max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--mkt-ink)] mb-6">Related fleet guidance</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-[var(--mkt-border)] bg-white p-5 text-[var(--mkt-ink)] font-medium hover:border-[var(--brand-blue)]/40 hover:text-[var(--brand-blue)] transition-colors"
                >
                  {item.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mkt-section bg-white border-t border-[var(--mkt-border)]">
          <div className="mkt-container max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--mkt-ink)] mb-8">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <section key={item.question} className="rounded-2xl border border-[var(--mkt-border)] bg-white p-6">
                  <h3 className="text-lg font-semibold text-[var(--mkt-ink)] mb-2">{item.question}</h3>
                  <p className="text-[var(--mkt-muted)] leading-relaxed">{item.answer}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 border-t border-[var(--mkt-border)] mkt-atmosphere text-center">
          <div className="mkt-container max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--mkt-ink)] mb-4">See it with your own fleet</h2>
            <p className="text-[var(--mkt-muted)] mb-8">
              Fleet Track PRO costs £8 per vehicle per month, with a minimum of two vehicles and unlimited team members.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold btn-brand-blue"
            >
              Start your free trial
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
