import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from './components/Navbar';
import { CompaniesShowcaseStrip, type ShowcaseLogo } from '@/components/CompaniesShowcaseStrip';
import HomePricingCard from '@/components/HomePricingCard';
import HomeFaqSection from '@/components/HomeFaqSection';
import { HomeJsonLd } from '@/components/HomeJsonLd';
import { HomeFaqJsonLd } from '@/components/HomeFaqJsonLd';
import {
  Map,
  Smartphone,
  ClipboardList,
  ArrowRight,
  Zap,
  Droplets,
  Truck,
  LandPlot,
  Container,
  HardHat,
} from 'lucide-react';
import Link from 'next/link';

const WHATSAPP_ENQUIRY_URL =
  'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

export const metadata: Metadata = {
  title: {
    absolute: 'Stock Track PRO | UK Fleet Management & Defect Reporting Software',
  },
  description:
    'Stock Track PRO is UK fleet management software for SMEs. Track MOTs, vehicle tax, daily inspections, and defect resolution — all in one platform. Try free for 7 days.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Stock Track PRO | UK Fleet Management & Defect Reporting Software',
    description:
      'UK fleet management software — MOTs, tax, inspections, defect resolution. Try free for 7 days.',
    url: 'https://www.stocktrackpro.co.uk',
    siteName: 'Stock Track PRO',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Track PRO | UK Fleet Management & Defect Reporting Software',
    description:
      'UK fleet management software for SMEs — MOTs, tax, inspections, defect resolution. Try free for 7 days.',
  },
};

/** Logos in “Companies which use us” — set `featured: true` for a larger mark in the row. */
const SHOWCASE_LOGOS: ShowcaseLogo[] = [
  {
    src: '/clients/newstreet-groundwork.png',
    alt: 'Newstreet Groundwork Services logo',
    featured: true,
  },
];

const DEFECT_STEPS = [
  {
    n: 1,
    title: 'REPORT',
    body: 'Drivers complete daily inspections in the app — photos, checklist, and defects captured with a timestamp.',
  },
  {
    n: 2,
    title: 'ALERT',
    body: 'Managers get a push notification the moment a defect is raised, so nothing sits unnoticed.',
  },
  {
    n: 3,
    title: 'RESOLVE',
    body: 'Fitters work from My Jobs, update status, and close the job in the app when the vehicle is ready.',
  },
  {
    n: 4,
    title: 'AUDIT',
    body: (
      <>
        The full history stays in one digital{' '}
        <Link href="/compliance-centre/o-licence-defect-records" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
          audit trail
        </Link>{' '}
        for O-licence record keeping.
      </>
    ),
  },
];

const QUICK_FACTS = [
  ['Platform', 'iOS and Android app, plus web dashboard'],
  ['Who uses what', 'Drivers (user role); managers and fitters (manager role)'],
  ['Fleet size', 'Built for 5 to 100+ vehicles'],
  ['Support', 'UK-based — email and WhatsApp'],
];

const INCLUDED = [
  {
    icon: Smartphone,
    title: 'Inspections in the field',
    description: 'Structured daily checks with required photos — no skipped steps.',
  },
  {
    icon: ClipboardList,
    title: 'Defects to close-out',
    description: 'Report → notify → repair → resolve, with My Jobs for open work.',
  },
  {
    icon: Map,
    title: 'Fleet & renewals',
    description: 'Vehicles, mileage, MOT and tax in one manager dashboard.',
  },
  {
    icon: HardHat,
    title: 'Plant & Machinery',
    description: 'Optional add-on for LOLER and site plant — see pricing.',
    href: '/pricing',
  },
];

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <HomeFaqJsonLd />
      <div className="min-h-screen bg-black text-white antialiased">
        <Navbar />

        {/* Hero */}
        <section className="relative overflow-hidden pt-20 sm:pt-28 lg:pt-24 lg:min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative flex flex-col justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-16 lg:py-24 order-2 lg:order-1">
            <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-5">
              UK fleet compliance platform
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
              Fleet Management, Compliance &amp; Defect Resolution.
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed mb-10">
              Daily inspections, defect close-out, and MOT visibility — mobile app for the field, web dashboard for managers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/onboarding"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black btn-brand-blue"
              >
                Start 7-Day Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <p className="mt-5">
              <Link
                href="/features"
                className="text-[var(--brand-blue)] hover:text-blue-400 text-sm font-medium inline-flex items-center gap-1 transition-colors"
              >
                See how it works →
              </Link>
            </p>
            <p className="mt-6 text-sm text-white/50">
              <a
                href={WHATSAPP_ENQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white underline underline-offset-2"
              >
                Questions? Message us on WhatsApp
              </a>
            </p>
          </div>
          <div className="relative h-[50vh] min-h-[320px] lg:h-full lg:min-h-[calc(100vh-6rem)] order-1 lg:order-2">
            <Image
              src="/website-image-stp.png"
              alt="Stock Track PRO app on phone in the field — sign in to manage your fleet"
              width={1200}
              height={1600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover object-right lg:object-center"
              loading="eager"
              fetchPriority="high"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent lg:bg-gradient-to-r from-black/80 via-black/20 to-transparent"
              aria-hidden
            />
          </div>
        </section>

        {/* Quick facts */}
        <section className="py-12 sm:py-16 border-t border-white/10 bg-black">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-3">
                Quick Facts
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Stock Track PRO at a glance
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {QUICK_FACTS.map(([term, detail]) => (
                  <div key={term} className="border-t border-white/10 pt-4">
                    <dt className="text-white font-semibold">{term}</dt>
                    <dd className="text-white/65 text-sm mt-1 leading-relaxed">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Sectors */}
        <section className="py-12 sm:py-16 border-y border-white/10 bg-white/[0.02]">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-center text-white/45 text-[11px] font-semibold uppercase tracking-[0.22em] mb-5">
              Built for
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 mb-5">
              {[
                { icon: Zap, label: 'Electrical' },
                { icon: Droplets, label: 'Plumbing' },
                { icon: Truck, label: 'Logistics' },
                { icon: Wrench, label: 'Trades' },
                { icon: LandPlot, label: 'Groundworks' },
                { icon: Container, label: 'Haulage' },
                { icon: HardHat, label: 'Construction' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-white/55">
                  <Icon className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.5} aria-hidden />
                  <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-white/65 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              UK teams who want clearer vehicle compliance and fewer breakdown surprises — from sole traders to national
              contractors using a fleet management app for vans and HGVs alike.
            </p>
          </div>
        </section>

        <CompaniesShowcaseStrip logos={SHOWCASE_LOGOS} className="border-t-0" />

        {/* Defect resolution loop */}
        <section id="defect-workflow" className="py-20 sm:py-28 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                From defect report to sign-off
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Fitters and managers share the manager role for My Jobs and alerts; drivers report from the app.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEFECT_STEPS.map((step) => (
                <div
                  key={step.n}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col"
                >
                  <span className="text-[var(--brand-blue)] font-bold text-sm mb-3">
                    STEP {step.n} — {step.title}
                  </span>
                  <p className="text-white/75 text-sm leading-relaxed flex-1">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's included */}
        <section className="py-20 sm:py-28 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-center">
              What&apos;s included
            </h2>
            <p className="text-white/55 text-center mb-12 max-w-lg mx-auto text-sm">
              One fleet subscription — full detail on the{' '}
              <Link href="/features" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                features page
              </Link>
              .
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {INCLUDED.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </>
                );
                return 'href' in item && item.href ? (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/30 transition-colors"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div
                    key={item.title}
                    className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <HomePricingCard />

        <HomeFaqSection />

        {/* Final CTA */}
        <section className="relative py-24 sm:py-32 overflow-hidden border-t border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(59,130,246,0.12),transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-blue)]/40 to-transparent" />
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 max-w-3xl mx-auto leading-tight">
              Start managing your fleet today
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-10 text-lg">
              Set up your company and invite your team in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
              >
                Start 7-Day Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-all duration-200 font-medium"
              >
                View pricing
              </Link>
            </div>
            <p className="mt-6 text-white/50 text-sm">
              Prefer to talk first?{' '}
              <a
                href={WHATSAPP_ENQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
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
