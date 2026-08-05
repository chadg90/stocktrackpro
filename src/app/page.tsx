import React from 'react';
import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import HomeHero from '@/components/HomeHero';
import CustomerLogoStrip from '@/components/CustomerLogoStrip';
import CustomerStoriesSection from '@/components/CustomerStoriesSection';
import HomeFaqSection from '@/components/HomeFaqSection';
import { HomeJsonLd } from '@/components/HomeJsonLd';
import { HomeFaqJsonLd } from '@/components/HomeFaqJsonLd';
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
import Image from 'next/image';
import MarketingBreak from '@/components/MarketingBreak';

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
    url: 'https://www.fleettrackpro.co.uk',
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
    n: 1,
    title: 'REPORT',
    body: 'Drivers submit the daily check with required photos, checklist answers, and any defects — timestamped in the app.',
  },
  {
    n: 2,
    title: 'ALERT',
    body: 'Managers get a push notification as soon as a defect is raised.',
  },
  {
    n: 3,
    title: 'RESOLVE',
    body: 'Fitters work from My Jobs, update status, and close the job when the vehicle is ready.',
  },
  {
    n: 4,
    title: 'AUDIT',
    body: (
      <>
        The full history stays in one digital{' '}
        <Link
          href="/compliance-centre/van-fleet-defect-records"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4"
        >
          audit trail
        </Link>{' '}
        for compliance record keeping.
      </>
    ),
  },
];

const QUICK_FACTS = [
  ['Platform', 'iOS and Android app, plus web dashboard'],
  ['Roles', 'Drivers report; managers and fitters run My Jobs and oversight'],
  ['Fleet size', 'From 2 to 100+ vehicles'],
  ['Pricing', 'From £8 per vehicle per month'],
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
    description: 'Open defects stay on My Jobs until repaired and signed off.',
  },
  {
    icon: Map,
    title: 'Fleet & renewals',
    description: 'Vehicles, mileage, MOT and tax in one manager dashboard.',
  },
];

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <HomeFaqJsonLd />
      <div className="marketing-shell">
        <Navbar />

        <HomeHero />

        <CustomerLogoStrip />

        <MarketingBreak variant="band" />

        <section className="py-7 sm:py-9 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-[var(--brand-blue)] font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] mb-2">
              Quick Facts
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Fleet Track PRO at a glance</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
              {QUICK_FACTS.map(([term, detail]) => (
                <div key={term} className="border-t border-slate-200 pt-2.5">
                  <dt className="text-slate-900 font-semibold text-sm">{term}</dt>
                  <dd className="text-slate-600 text-sm mt-0.5 leading-snug">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <MarketingBreak />

        <section className="py-12 sm:py-16 bg-slate-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative aspect-[4/3] overflow-hidden mkt-card-static">
                <Image
                  src="/fleet-operations.jpg"
                  alt="Fleet Track PRO in use with UK fleet operations"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <p className="text-[var(--brand-blue)] font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                  Built for
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                  Trades and transport teams across the UK
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Built for sole traders through to national contractors who need clear vehicle records without paper
                  pads or scattered WhatsApp threads.
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-3 text-slate-500">
                  {[
                    { icon: Zap, label: 'Electrical' },
                    { icon: Droplets, label: 'Plumbing' },
                    { icon: Truck, label: 'Logistics' },
                    { icon: Wrench, label: 'Trades' },
                    { icon: LandPlot, label: 'Groundworks' },
                    { icon: Container, label: 'Haulage' },
                    { icon: HardHat, label: 'Construction' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden />
                      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarketingBreak variant="soft" />

        <div id="customer-stories">
          <CustomerStoriesSection />
        </div>

        <MarketingBreak variant="band" />

        <section id="defect-workflow" className="py-14 sm:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-10 sm:mb-14">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                  From defect report to sign-off
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Four steps from the roadside check to a closed repair — with every update in one place.
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden mkt-card-static order-first lg:order-none">
                <Image
                  src="/fleet-walkaround.jpg"
                  alt="Technician inspecting a vehicle during a daily walkaround check"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {DEFECT_STEPS.map((step) => (
                <li key={step.n} className="border-t border-slate-200 pt-5">
                  <p className="text-[var(--brand-blue)] font-bold text-sm mb-2 tracking-wide">
                    STEP {step.n} — {step.title}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <MarketingBreak />

        <section className="py-14 sm:py-20 bg-slate-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center mb-8 sm:mb-10">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <Image
                  src="/fleet-manager-dashboard.jpg"
                  alt="Fleet manager reviewing vehicles and MOT status on a laptop"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
                  Platform
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">What&apos;s included</h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
                  Core fleet tools in one subscription — inspections, defects, and renewals without juggling apps or
                  paper.
                </p>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-1.5 text-[var(--brand-blue)] hover:text-blue-700 text-sm font-semibold"
                >
                  See the full feature list →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {INCLUDED.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--brand-blue)] mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <MarketingBreak variant="soft" />

        <HomeFaqSection />

        <MarketingBreak />

        <section className="relative py-16 sm:py-28 overflow-hidden bg-white">
          <div className="container relative mx-auto px-5 sm:px-4 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-5 max-w-3xl mx-auto leading-tight">
              Start managing your fleet today
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-10 text-lg">
              Set up your company and invite your team in minutes — no card required for the 7-day trial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link
                href="/onboarding"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
              >
                Start 7-Day Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 min-h-[48px] rounded-xl border border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 transition-all duration-200 font-medium"
              >
                View pricing
              </Link>
            </div>
            <p className="mt-6 text-slate-500 text-sm">
              Prefer to talk first?{' '}
              <a
                href={WHATSAPP_ENQUIRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-blue)] hover:underline"
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
