import Image from 'next/image';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Smartphone,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type { CustomerStory } from '@/content/customerStories';
import Navbar from '@/app/components/Navbar';
import MarketingBreak from '@/components/MarketingBreak';
import CustomerCaseStudyJsonLd from '@/components/seo/CustomerCaseStudyJsonLd';

const METRIC_ICONS = [Clock3, ShieldCheck, Wrench];
const STEP_ICONS = [Smartphone, AlertCircle, CheckCircle2];

type Props = {
  story: CustomerStory;
  /** Optional hero photo — defaults to fleet operations image */
  heroImageSrc?: string;
  heroImageAlt?: string;
};

export default function CustomerCaseStudyPage({
  story,
  heroImageSrc = '/fleet-operations-2.jpg',
  heroImageAlt = 'UK fleet operations',
}: Props) {
  const topQuote = story.quote || story.cardExcerpt;

  return (
    <div className="marketing-shell">
      <CustomerCaseStudyJsonLd story={story} heroImageSrc={heroImageSrc} />
      <Navbar />
      <main>
        <section className="pt-24 sm:pt-28 pb-8 sm:pb-10 mkt-atmosphere">
          <div className="mkt-container">
            <Link
              href="/#customer-stories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--mkt-muted)] hover:text-[var(--brand-blue)] mb-6"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to customer stories
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10">
              <div className="max-w-2xl">
                <p className="mkt-eyebrow mb-3">Case study</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--mkt-ink)] leading-tight">
                  {story.shortName}
                </h1>
                <p className="text-[var(--mkt-muted)] text-lg leading-relaxed mt-4">
                  {story.industry} · {story.fleetSize} vehicles
                </p>
                <p className="inline-flex items-center gap-2 text-[var(--mkt-muted)] text-sm mt-3">
                  <MapPin className="h-4 w-4 text-[var(--brand-blue)]" aria-hidden />
                  {story.location}
                </p>
              </div>
              <div className="relative h-24 w-52 sm:h-28 sm:w-60 shrink-0 self-start lg:self-center">
                <Image
                  src={story.logoSrc}
                  alt={story.logoAlt}
                  fill
                  className="object-contain object-left lg:object-right"
                  sizes="240px"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-12 sm:pb-16">
          <div className="mkt-container space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6 items-stretch">
              <div className="relative lg:col-span-3 w-full min-h-[220px] h-[240px] sm:h-[300px] lg:h-auto lg:min-h-[300px] overflow-hidden rounded-2xl border border-[var(--mkt-border)] bg-[var(--mkt-muted-surface)]">
                <Image
                  src={heroImageSrc}
                  alt={heroImageAlt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>

              <aside className="lg:col-span-2 mkt-card-static p-5 sm:p-6 flex flex-col justify-center gap-5 bg-[var(--mkt-muted-surface)]">
                {story.metrics.map((metric, i) => {
                  const Icon = METRIC_ICONS[i % METRIC_ICONS.length];
                  return (
                    <div key={metric.label} className="flex gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-white border border-[var(--mkt-border)] flex items-center justify-center text-[var(--brand-blue)] shrink-0">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base sm:text-lg font-bold text-[var(--mkt-ink)]">{metric.label}</p>
                        <p className="text-sm text-[var(--mkt-muted)] mt-0.5 leading-relaxed">{metric.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </aside>
            </div>

            {topQuote ? (
              <aside className="mkt-card-static p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                  <p
                    className="text-6xl leading-none text-[var(--brand-blue)] font-serif shrink-0"
                    aria-hidden
                  >
                    &ldquo;
                  </p>
                  <div className="min-w-0 flex-1">
                    <blockquote className="text-[var(--mkt-ink)] text-base sm:text-lg leading-relaxed">
                      {topQuote}
                    </blockquote>
                    {(story.quoteName || story.company) && (
                      <p className="mt-5 text-sm text-[var(--mkt-muted)]">
                        <span className="font-semibold text-[var(--mkt-ink)]">
                          {story.quoteName || story.company}
                        </span>
                        {story.quoteRole ? (
                          <span> — {story.quoteRole}</span>
                        ) : null}
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            ) : (
              <aside className="mkt-card-static p-6 sm:p-8">
                <p className="text-[var(--mkt-muted)] text-base sm:text-lg leading-relaxed">{story.summary}</p>
              </aside>
            )}
          </div>
        </section>

        <MarketingBreak variant="soft" />

        <section className="py-12 sm:py-16 bg-white">
          <div className="mkt-container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              <div>
                <h2 className="text-lg font-semibold text-[var(--mkt-ink)] mb-3">The challenge</h2>
                <p className="text-[var(--mkt-muted)] text-sm sm:text-base leading-relaxed">{story.challenge}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--mkt-ink)] mb-3">The solution</h2>
                <p className="text-[var(--mkt-muted)] text-sm sm:text-base leading-relaxed">{story.solution}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--mkt-ink)] mb-3">The impact</h2>
                <ul className="space-y-3">
                  {story.impact.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--mkt-muted)]">
                      <CheckCircle2
                        className="h-5 w-5 text-[var(--brand-blue)] shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-white border-t border-[var(--mkt-border)]">
          <div className="mkt-container">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-10 lg:gap-14 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--mkt-ink)] mb-4">
                  How they use Fleet Track PRO
                </h2>
                <p className="text-[var(--mkt-muted)] text-sm sm:text-base leading-relaxed">{story.summary}</p>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
                {story.howTheyUse.map((step, index) => {
                  const Icon = STEP_ICONS[index % STEP_ICONS.length];
                  return (
                    <li key={step.title} className="relative text-center sm:text-left">
                      <div className="flex flex-col items-center sm:items-start">
                        <div className="relative mb-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--brand-blue)]/25 bg-blue-50">
                            <Icon className="h-7 w-7 text-[var(--brand-blue)]" strokeWidth={1.75} aria-hidden />
                          </div>
                          {index < story.howTheyUse.length - 1 && (
                            <ArrowRight
                              className="hidden sm:block absolute top-1/2 -right-6 lg:-right-8 h-5 w-5 text-slate-300 -translate-y-1/2"
                              aria-hidden
                            />
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {index + 1}. {step.title}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{step.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue"
              >
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium border border-[var(--mkt-border)] text-[var(--mkt-ink)] bg-white hover:bg-slate-50"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
