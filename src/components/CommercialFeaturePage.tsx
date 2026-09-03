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
        <section className="relative overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">{eyebrow}</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                {title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8">{intro}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold btn-brand-blue"
                >
                  Start 14-Day Free Trial
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-300 text-slate-900 hover:border-blue-400 hover:bg-slate-50 transition-colors font-medium"
                >
                  View pricing
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">No card required · unlimited team members · minimum 2 vehicles</p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <section key={benefit.title} className="mkt-card p-7 sm:p-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">{benefit.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 border-t border-slate-200 bg-slate-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-8 text-center">
              {workflowTitle}
            </h2>
            <ol className="space-y-4">
              {workflow.map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-slate-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 sm:py-20 border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-7 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{evidenceTitle}</h2>
              <p className="text-slate-700 leading-relaxed">{evidence}</p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 border-t border-slate-200 bg-slate-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Related fleet guidance</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 font-medium hover:border-blue-300 hover:text-[var(--brand-blue)] transition-colors"
                >
                  {item.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((item) => (
                <section key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24 border-t border-slate-200 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">See it with your own fleet</h2>
            <p className="text-slate-600 mb-8">
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
