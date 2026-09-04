import React from 'react';
import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import HomeHero from '@/components/HomeHero';
import CustomerLogoStrip from '@/components/CustomerLogoStrip';
import CustomerStoriesSection from '@/components/CustomerStoriesSection';
import HomeFaqSection from '@/components/HomeFaqSection';
import { HomeFaqJsonLd } from '@/components/HomeFaqJsonLd';
import { SITE_META_DESCRIPTION } from '@/content/siteSeo';
import { absolutePageUrl } from '@/lib/site';
import { FREE_TRIAL_CTA } from '@/lib/brand';
import { ClipboardList, ArrowRight, ShieldCheck, Camera } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const WHATSAPP_ENQUIRY_URL =
  'https://wa.me/447438146343?text=Hi%20Fleet%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

export const metadata: Metadata = {
  title: {
    absolute: 'Fleet Track PRO | UK Fleet & DVSA Compliance Software',
  },
  description: SITE_META_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Fleet Track PRO | UK Fleet & DVSA Compliance Software',
    description: SITE_META_DESCRIPTION,
    url: absolutePageUrl('/'),
    siteName: 'Fleet Track PRO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fleet Track PRO — UK fleet management, inspections, and defect reporting',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Track PRO | UK Fleet & DVSA Compliance Software',
    description: SITE_META_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
};

const DEFECT_STEPS = [
  {
    n: '01',
    title: 'Report',
    body: 'Drivers complete the daily check with required photos and any defects — timestamped in the app.',
  },
  {
    n: '02',
    title: 'Alert',
    body: 'Managers get a push notification as soon as a defect is raised.',
  },
  {
    n: '03',
    title: 'Resolve',
    body: 'Fitters work from My Jobs, update status, and close the job when the vehicle is ready.',
  },
  {
    n: '04',
    title: 'Audit',
    body: 'The full history stays in one digital trail for roadside checks and client evidence.',
  },
];

const OUTCOMES = [
  {
    icon: Camera,
    title: 'Photo-led walkaround checks',
    description:
      'Structured daily vehicle inspections on iOS and Android with required photos so steps cannot be skipped.',
    href: '/vehicle-walkaround-check-app',
  },
  {
    icon: ClipboardList,
    title: 'Defects from report to close-out',
    description:
      'Open defects stay visible until repaired and signed off — not lost in WhatsApp or paper pads.',
    href: '/vehicle-defect-reporting-software',
  },
  {
    icon: ShieldCheck,
    title: 'MOT and tax visibility',
    description:
      'DVLA-backed MOT and tax status on every vehicle, with advance warnings for managers.',
    href: '/fleet-mot-tax-reminders',
  },
];

export default function Home() {
  return (
    <>
      <HomeFaqJsonLd />
      <div className="marketing-shell">
        <Navbar />
        <HomeHero />
        <CustomerLogoStrip />

        {/* Why it matters — SEO/GEO intent */}
        <section className="mkt-section bg-white">
          <div className="mkt-container">
            <div className="max-w-3xl">
              <p className="mkt-eyebrow mb-3">Built for UK fleets</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--mkt-ink)] mb-4 leading-tight">
                Replace paper pads and WhatsApp with one compliance trail
              </h2>
              <p className="text-[var(--mkt-muted)] text-base sm:text-lg leading-relaxed">
                Fleet Track PRO helps United Kingdom operators run daily DVSA-style walkaround checks, report defects
                with photos, close out repairs, and keep MOT and tax in view — from sole traders to multi-site
                contractors.
              </p>
            </div>
            <dl className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 border-t border-[var(--mkt-border)] pt-8 sm:pt-10">
              {[
                ['From £8', 'per vehicle / month'],
                ['14 days', 'free trial, no card'],
                ['iOS & Android', 'plus web dashboard'],
                ['Unlimited', 'team members'],
              ].map(([value, label]) => (
                <div key={label} className="min-w-0">
                  <dt className="mkt-display text-xl sm:text-3xl font-bold text-[var(--mkt-ink)] tracking-tight">
                    {value}
                  </dt>
                  <dd className="text-xs sm:text-sm text-[var(--mkt-muted)] mt-1 leading-snug">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Outcomes / pillars */}
        <section className="mkt-section mkt-atmosphere">
          <div className="mkt-container">
            <div className="max-w-2xl mb-12">
              <p className="mkt-eyebrow mb-3">Platform</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--mkt-ink)] leading-tight">
                Everything managers need for daily vehicle compliance
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {OUTCOMES.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group block rounded-2xl border border-[var(--mkt-border)] bg-white p-6 sm:p-8 transition-all duration-200 hover:border-[var(--brand-blue)]/40 hover:shadow-[0_16px_40px_rgba(10,22,40,0.08)]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[var(--mkt-muted-surface)] text-[var(--brand-blue)] flex items-center justify-center mb-5 group-hover:bg-blue-50 transition-colors">
                      <Icon className="w-5 h-5" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--mkt-ink)] mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--mkt-muted)] leading-relaxed mb-4">{item.description}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-blue)]">
                      Learn more
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow + imagery */}
        <section id="defect-workflow" className="mkt-section bg-white">
          <div className="mkt-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
              <div>
                <p className="mkt-eyebrow mb-3">Workflow</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--mkt-ink)] mb-4 leading-tight">
                  From roadside check to signed-off repair
                </h2>
                <p className="text-[var(--mkt-muted)] text-base sm:text-lg leading-relaxed mb-6">
                  Four clear steps — with every update in one place for managers, fitters, and DVSA roadside readiness.
                </p>
                <Link
                  href="/compliance-centre/van-fleet-defect-records"
                  className="inline-flex items-center gap-1.5 text-[var(--brand-blue)] font-semibold text-sm hover:underline underline-offset-4"
                >
                  Read: fleet defect records guidance
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="/fleet-walkaround-2.jpg"
                  alt="Technician inspecting a vehicle during a daily walkaround check"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {DEFECT_STEPS.map((step) => (
                <li key={step.n} className="border-t-2 border-[var(--brand-blue)]/30 pt-5">
                  <p className="text-[var(--brand-blue)] font-bold text-xs tracking-[0.18em] mb-2">{step.n}</p>
                  <h3 className="text-lg font-semibold text-[var(--mkt-ink)] mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--mkt-muted)] leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Dashboard proof */}
        <section className="mkt-section bg-[var(--mkt-ink)] text-white overflow-hidden relative">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              backgroundImage:
                'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(26,111,181,0.45), transparent 55%)',
            }}
          />
          <div className="mkt-container relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <p className="text-sky-300/90 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                  Manager dashboard
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                  See open defects, checks, and renewals in one view
                </h2>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                  Mobile for drivers in the yard. Web dashboard for managers who need fleet status without chasing
                  paper.
                </p>
                <ul className="space-y-3 text-sm text-slate-200 mb-8">
                  {[
                    'Fleet list with status and inspection history',
                    'Defect workflow through to return to service',
                    'MOT & tax alerts with DVLA refresh',
                    'Inspection proof PDFs and evidence packs',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-[var(--mkt-ink)] px-6 py-3.5 font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  Explore features
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src="/fleet-manager-dashboard-2.jpg"
                  alt="Fleet manager reviewing vehicles and MOT status on a laptop"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        <div id="customer-stories">
          <CustomerStoriesSection />
        </div>

        {/* Who it's for — clearer vehicle scope for SEO */}
        <section className="mkt-section mkt-atmosphere">
          <div className="mkt-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl order-last lg:order-first">
                <Image
                  src="/fleet-operations-2.jpg"
                  alt="Fleet Track PRO in use with UK fleet operations"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <p className="mkt-eyebrow mb-3">Who it is for</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--mkt-ink)] mb-4 leading-tight">
                  Cars, vans, and light commercial fleets across UK trades
                </h2>
                <p className="text-[var(--mkt-muted)] text-base sm:text-lg leading-relaxed mb-6">
                  Built for groundworks, construction, electrical, plumbing, logistics, haulage support vans, and
                  specialist transport teams that need daily checks without HGV-only complexity.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--mkt-muted)] mb-8">
                  {['Groundworks', 'Construction', 'Electrical', 'Plumbing', 'Logistics', 'Haulage vans'].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-[var(--mkt-border)] bg-white px-3 py-1.5 font-medium"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold">
                  <Link href="/customers/newstreet" className="text-[var(--brand-blue)] hover:underline underline-offset-4">
                    Newstreet case study →
                  </Link>
                  <Link href="/customers/neemt" className="text-[var(--brand-blue)] hover:underline underline-offset-4">
                    NEEMT case study →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeFaqSection />

        {/* Final CTA */}
        <section className="relative py-16 sm:py-28 overflow-hidden bg-white">
          <div className="absolute inset-0 mkt-atmosphere opacity-60" aria-hidden />
          <div className="mkt-container relative text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[var(--mkt-ink)] mb-4 max-w-3xl mx-auto leading-tight px-1">
              Start your fleet compliance trial today
            </h2>
            <p className="text-[var(--mkt-muted)] max-w-xl mx-auto mb-8 sm:mb-10 text-sm sm:text-lg px-1">
              Set up your company and invite drivers in minutes — 14-day free trial, no card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
              <Link
                href="/onboarding"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2"
              >
                {FREE_TRIAL_CTA}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 min-h-[48px] rounded-xl border border-[var(--mkt-border)] text-[var(--mkt-ink)] bg-white hover:bg-slate-50 transition-colors font-medium"
              >
                View pricing
              </Link>
            </div>
            <p className="mt-6 text-[var(--mkt-muted)] text-sm">
              Prefer to talk first?{' '}
              <a
                href={WHATSAPP_ENQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-blue)] hover:underline font-medium"
              >
                Message us on WhatsApp
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
