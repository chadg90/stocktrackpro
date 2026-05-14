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
  Wrench,
  Map,
  Smartphone,
  Users,
  ClipboardList,
  ArrowRight,
  Check,
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
    body:
      'Drivers perform daily inspections via the mobile app. Defects are flagged instantly with photo evidence and a timestamp.',
  },
  {
    n: 2,
    title: 'ALERT',
    body:
      'Managers and fitters (assigned the manager role) receive immediate push notifications the moment a defect is raised, plus automatic 7-day warnings before any MOT or tax expiry.',
  },
  {
    n: 3,
    title: 'RESOLVE',
    body:
      'Fitters (assigned the manager role) see the defect in their My Jobs list the moment it is reported. Once repaired, they close it out directly in the app.',
  },
  {
    n: 4,
    title: 'AUDIT',
    body: (
      <>
        Every inspection, defect, and repair is recorded in a timestamped digital{' '}
        <Link href="/compliance-centre/o-licence-defect-records" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
          audit trail
        </Link>{' '}
        — built to support O-licence record keeping.
      </>
    ),
  },
];

const QUICK_FACTS = [
  ['Platform', 'iOS app, Android app, and web dashboard'],
  ['Price', '£8 per vehicle per month, including VAT at 20%'],
  ['Free trial', '7 days — no card required'],
  ['Users included', 'Unlimited users — drivers (user role) and managers/fitters (manager role)'],
  ['Compliance', 'Supports O-licence defect record keeping'],
  ['Fleet size', 'Suitable for 5 to 100+ vehicles'],
  ['Support', 'UK-based via email and WhatsApp'],
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
              Professional Fleet Compliance &amp; Defect Resolution.
            </h1>
            <p className="text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed mb-2">
              One platform to manage your entire fleet — inspections, MOTs, tax, and defects.
            </p>
            <p className="text-base sm:text-lg text-white/55 max-w-2xl leading-relaxed mb-10">
              Web dashboard for managers. Mobile app for drivers and fitters (manager role).
            </p>
            <p className="text-sm text-white/45 max-w-2xl leading-relaxed mb-10">
              Stock Track PRO brings together fleet inspection software UK operators rely on, vehicle defect reporting app
              workflows, and MOT tracking — without spreadsheet chaos. Whether you run vans or a mixed fleet, it is built as
              {' '}
              <Link href="/compliance-centre/o-licence-defect-records" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
                O-licence
              </Link>{' '}
              compliance software that helps keep evidence organised for DVSA scrutiny.
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
              7 days free &bull; no card required &bull;{' '}
              <a
                href={WHATSAPP_ENQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white underline underline-offset-2"
              >
                or talk to us on WhatsApp
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
                Don&apos;t Just Find Defects — Resolve Them
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                A complete digital workflow from first report to final sign-off.
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

        {/* Capabilities */}
        <section className="py-20 sm:py-28 border-t border-white/10">
          <div className="container mx-auto px-4">
            <p className="text-center text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center max-w-2xl mx-auto">
              Work smarter. Stay organised. Reduce loss and downtime.
            </h2>
            <p className="text-white/55 text-center max-w-xl mx-auto mb-16">
              Everything you need to run inspections, defects, and renewal visibility in one national UK fleet compliance
              platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Smartphone,
                  title: 'Mobile fleet workflows',
                  description:
                    'Use the app to complete inspections, update defects, and track progress in the field — vehicle defect reporting app workflows managers can trust.',
                },
                {
                  icon: Map,
                  title: 'Fleet visibility',
                  description:
                    'Monitor vehicles, inspections, mileage, and service dates across every site — MOT tracking software for fleets without spreadsheet risk.',
                },
                {
                  icon: Smartphone,
                  title: 'Mobile-first operations',
                  description:
                    'Drivers (user role) and fitters (manager role) complete inspections, raise defects, and update job progress from the app.',
                },
                {
                  icon: Users,
                  title: 'Team & roles',
                  description: 'Managers oversee the company and team; drivers (user role) and fitters (manager role) work from the same live data.',
                },
                {
                  icon: Wrench,
                  title: 'Vehicle inspections',
                  description:
                    'Capture required photos, checklist items, and defects to support compliance checks.',
                },
                {
                  icon: ClipboardList,
                  title: 'Defect reporting',
                  description:
                    'Flag defects, track repairs, and close jobs out with a clear trail that supports your O-licence records.',
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-7 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors font-medium text-sm"
              >
                Explore every feature in detail
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Outcomes */}
        <section className="py-20 sm:py-28 bg-white/[0.02] border-t border-white/10">
          <div className="container mx-auto px-4">
            <p className="text-center text-blue-500 font-medium text-sm uppercase tracking-[0.2em] mb-4">Outcomes</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center max-w-2xl mx-auto">
              Safer vehicles. Less downtime. A clearer picture.
            </h2>
            <p className="text-white/55 text-center max-w-xl mx-auto mb-14">
              What fleets gain when inspections, defects, and MOT and tax visibility live in one place.
            </p>
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Reduce vehicle downtime through faster defect reporting.',
                'Support compliance with timestamped inspection records.',
                'See fleet and team activity in one manager dashboard.',
                'Keep MOT and tax visibility front and centre across the fleet.',
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/40 hover:border-blue-500/20 transition-colors"
                >
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-white/90 text-sm sm:text-base">{benefit}</p>
                </div>
              ))}
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
              Set up your company, invite your team, and run inspections with a 7-day free trial — no card required.
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
