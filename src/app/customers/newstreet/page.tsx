import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import MarketingBreak from '@/components/MarketingBreak';
import { ArrowRight, Check, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Newstreet Groundworks Case Study',
  description:
    'How Newstreet Groundworks, County Durham, uses Fleet Track PRO for fleet inspections, defect close-out, and compliance across active sites.',
  alternates: { canonical: '/customers/newstreet' },
};

const RESULTS = [
  {
    title: 'One place for checks',
    body: 'Drivers complete daily vehicle inspections in the app instead of paper sheets.',
  },
  {
    title: 'Faster defect close-out',
    body: 'Managers and fitters see raised defects on My Jobs and work from the same live list.',
  },
  {
    title: 'Clearer audit trail',
    body: 'Timestamped records replace lost WhatsApp threads when compliance evidence is needed.',
  },
];

export default function NewstreetCaseStudyPage() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main>
        <section className="pt-24 sm:pt-28 pb-10 sm:pb-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
              Case study
            </p>
            <div className="max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 mb-6">
                <div className="relative h-28 w-56 sm:h-32 sm:w-64 shrink-0">
                  <Image
                    src="/clients/newstreet-groundwork.png"
                    alt="Newstreet Groundwork Services"
                    fill
                    className="object-contain object-left"
                    sizes="256px"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                    Newstreet Groundworks
                  </h1>
                  <p className="inline-flex items-center gap-2 text-slate-500 text-sm mt-3">
                    <MapPin className="h-4 w-4 text-[var(--brand-blue)]" aria-hidden />
                    County Durham · multi-site groundworks fleet
                  </p>
                </div>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">
                A practical switch from WhatsApp and paper to live walkaround checks, defect workflow, and manager
                visibility across active sites.
              </p>
            </div>
          </div>
        </section>

        <MarketingBreak variant="soft" />

        <section className="py-12 sm:py-16 bg-slate-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">What changed</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {RESULTS.map((item) => (
                <div key={item.title} className="mkt-card-static p-6">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
                    <Check className="h-4 w-4" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MarketingBreak />

        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5">How they use Fleet Track PRO</h2>
            <div className="space-y-5 text-slate-600 leading-relaxed">
              <p>
                Newstreet Groundworks runs vehicles across multiple live sites. Before Fleet Track PRO, daily checks and
                defect reports lived in paper packs and message threads that were hard to chase and harder to evidence.
              </p>
              <p>
                Drivers now complete daily walkaround inspections in the app. When something is raised, managers and
                fitters see it on My Jobs, update progress, and close the work out with a clear history tied to the
                vehicle and the user.
              </p>
              <p className="text-slate-500 text-sm italic border-l-[3px] border-[var(--brand-blue)] pl-4">
                A fuller write-up with more detail from the Newstreet team is being prepared. If you run a similar
                multi-site fleet, start a free trial or get in touch.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue"
              >
                Start 7-Day Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium border border-slate-300 text-slate-800 bg-white hover:bg-slate-50"
              >
                Contact us
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium text-[var(--brand-blue)] hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
