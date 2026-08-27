'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import InteractiveAppDemo from '@/components/InteractiveAppDemo';
import { SITE_NAME } from '@/lib/brand';

const WHATSAPP_DEMO_URL =
  'https://wa.me/447438146343?text=Hi%20Fleet%20Track%20PRO%2C%20I%27d%20like%20to%20see%20a%20quick%20demo.';

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden pt-[4.5rem] sm:pt-24 lg:pt-20 grid grid-cols-1 lg:grid-cols-2 lg:items-center bg-[var(--mkt-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_40%,rgba(59,130,246,0.09),transparent_55%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="relative flex flex-col justify-center px-5 sm:px-6 lg:px-10 xl:px-16 pt-8 pb-6 sm:py-14 lg:py-20 order-1 text-center lg:text-left items-center lg:items-start mkt-animate-fade-up">
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-6xl font-bold tracking-tight text-slate-900 mb-3 sm:mb-4 leading-[1.1]">
          {SITE_NAME}
        </p>
        <p className="text-[var(--brand-blue)] font-semibold text-xs sm:text-sm uppercase tracking-[0.18em] mb-3 sm:mb-4">
          UK DVSA fleet compliance
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-800 mb-4 sm:mb-5 leading-snug max-w-xl">
          DVSA walkaround checks and defect resolution for UK vehicle fleets
        </h1>
        <p className="text-[0.95rem] sm:text-lg text-slate-600 max-w-md sm:max-w-xl leading-relaxed mb-6 sm:mb-8">
          Photo-led inspections, MOT and tax alerts, and a shared audit trail — mobile for drivers, web dashboard for
          managers.
        </p>
        <div className="flex w-full max-w-sm sm:max-w-none flex-col sm:flex-row gap-3 sm:gap-4 lg:w-auto">
          <Link
            href="/onboarding"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 sm:py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-slate-50 btn-brand-blue"
          >
            Start 7-Day Free Trial
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={WHATSAPP_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 sm:py-4 min-h-[48px] rounded-xl border border-slate-300 text-slate-800 font-medium bg-white hover:bg-slate-50 transition-colors"
          >
            <span className="underline underline-offset-2">Chat on WhatsApp</span>
          </a>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 lg:items-start">
          <Link
            href="/features"
            className="text-[var(--brand-blue)] hover:text-blue-700 text-base sm:text-lg font-semibold inline-flex items-center gap-1.5 transition-colors py-1"
          >
            See how it works →
          </Link>
        </div>
      </div>

      <div className="relative order-2 w-full flex items-center justify-center px-5 pb-10 sm:px-6 sm:pb-14 lg:px-6 lg:pb-16 lg:pt-6 mkt-animate-fade-in">
        <InteractiveAppDemo />
      </div>
    </section>
  );
}
