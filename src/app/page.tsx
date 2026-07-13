import React from 'react';
import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import HomeHero from '@/components/HomeHero';
import CustomerStoryCallout from '@/components/CustomerStoryCallout';
import HomePricingCard from '@/components/HomePricingCard';
import HomeFaqSection from '@/components/HomeFaqSection';
import TestimonialQuote from '@/components/TestimonialQuote';
import { HomeJsonLd } from '@/components/HomeJsonLd';
import { HomeFaqJsonLd } from '@/components/HomeFaqJsonLd';
import { getFeaturedTestimonial } from '@/content/testimonials';
import { SITE_META_DESCRIPTION } from '@/content/siteSeo';
import {
  Map,
  Smartphone,
  ClipboardList,
  Zap,
  Droplets,
  Truck,
  Wrench,
  LandPlot,
  Container,
  HardHat,
} from 'lucide-react';
import Link from 'next/link';

const WHATSAPP_ENQUIRY_URL =
  'https://wa.me/447438146343?text=Hi%20Fleet%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

export const metadata: Metadata = {
  title: {
    absolute: 'Fleet Track PRO | UK Van Fleet & DVSA Compliance Software',
  },
  description: SITE_META_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Fleet Track PRO | UK Van Fleet & DVSA Compliance Software',
    description: SITE_META_DESCRIPTION,
    url: 'https://www.fleettrackpro.co.uk',
    siteName: 'Fleet Track PRO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fleet Track PRO — UK van fleet management, inspections, and defect reporting',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Track PRO | UK Van Fleet & DVSA Compliance Software',
    description: SITE_META_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
};

const DEFECT_STEPS = [
  {
    n: 1,
    title: 'REPORT',
    body: 'Drivers complete DVSA daily walkaround checks in the app — photos, checklist, and defects captured with a timestamp.',
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
        <Link href="/compliance-centre/van-fleet-defect-records" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
          audit trail
        </Link>{' '}
        for fleet compliance record keeping.
      </>
    ),
  },
];

const QUICK_FACTS = [
  ['Platform', 'iOS and Android app, plus web dashboard'],
  ['Product focus', 'Van fleet DVSA compliance — not warehouse or inventory stock tracking'],
  ['Who uses what', 'Drivers (user role); managers and fitters (manager role)'],
  ['Fleet size', 'Built for 5 to 100+ vehicles'],
  ['Plant add-on', 'Optional — from £12/machine/month (min 3). LOLER, service, hire check & PUWER in one entry'],
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
    description:
      'Optional add-on from £12 per machine per month (min 3) — complete LOLER, service, pre-hire/off-hire, and PUWER in one visit. Separate PDFs, examination due reminders, and plant reports on the web dashboard.',
    href: '/pricing',
  },
];

export default function Home() {
  const featuredTestimonial = getFeaturedTestimonial();
  return (
    <>
      <HomeJsonLd />
      <HomeFaqJsonLd />
      <div className="min-h-screen bg-black text-white antialiased">
        <Navbar />

        <HomeHero />

        {/* Quick facts */}
        <section className="py-10 sm:py-16 border-t border-white/10 bg-black">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-3">
                Quick Facts
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Fleet Track PRO at a glance
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
        <section className="py-10 sm:py-16 border-y border-white/10 bg-white/[0.02]">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-center text-white/45 text-[11px] font-semibold uppercase tracking-[0.22em] mb-4 sm:mb-5">
              Built for
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-10 mb-4 sm:mb-5">
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
              UK transport and trades teams who need DVSA roadworthiness records, driver pre-use walkaround checks, and
              van fleet risk management — from sole traders to national contractors. Optional Plant &amp; Machinery for
              site LOLER records.
            </p>
          </div>
        </section>

        <CustomerStoryCallout />

        {/* Defect resolution loop */}
        <section id="defect-workflow" className="py-14 sm:py-28 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                From defect report to sign-off
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed px-1">
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
        <section className="py-14 sm:py-28 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 text-center">
              What&apos;s included
            </h2>
            <p className="text-white/55 text-center mb-12 max-w-lg mx-auto text-sm">
              One fleet subscription for vans — plus optional Plant &amp; Machinery from £12 per machine per month.
              Full detail on the{' '}
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

        {featuredTestimonial && (
          <section className="py-16 sm:py-20 border-t border-white/10 bg-white/[0.02]">
            <div className="container mx-auto px-4 max-w-3xl">
              <TestimonialQuote testimonial={featuredTestimonial} />
            </div>
          </section>
        )}

        <HomePricingCard />

        <HomeFaqSection />

        {/* Final CTA */}
        <section className="relative py-16 sm:py-32 overflow-hidden border-t border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(59,130,246,0.12),transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-blue)]/40 to-transparent" />
          <div className="container relative mx-auto px-5 sm:px-4 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-5 max-w-3xl mx-auto leading-tight">
              Start managing your fleet today
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-10 text-lg">
              Set up your company and invite your team in minutes. Add Plant &amp; Machinery later if you also run lifting
              equipment on site.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link
                href="/onboarding"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
              >
                Start 7-Day Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 min-h-[48px] rounded-xl border border-white/25 text-white hover:bg-white/10 transition-all duration-200 font-medium"
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
