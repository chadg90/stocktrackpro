'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import InteractiveAppDemo from '@/components/InteractiveAppDemo';
import { FREE_TRIAL_CTA, SITE_NAME } from '@/lib/brand';

const WHATSAPP_DEMO_URL =
  'https://wa.me/447438146343?text=Hi%20Fleet%20Track%20PRO%2C%20I%27d%20like%20to%20see%20a%20quick%20demo.';

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden mkt-hero-plane pt-[4.5rem] sm:pt-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
        }}
      />
      <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-6 sm:gap-8 lg:gap-4 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 xl:px-12 pb-10 sm:pb-16 lg:pb-20 lg:pt-6">
        <div className="order-1 text-center lg:text-left flex flex-col items-center lg:items-start mkt-animate-fade-up pt-6 sm:pt-10 lg:pt-8">
          <p className="mkt-display text-[2rem] leading-[1.08] sm:text-5xl md:text-6xl xl:text-[4.25rem] font-bold tracking-tight text-white mb-3 sm:mb-5 sm:leading-[1.05]">
            {SITE_NAME}
          </p>
          <p className="text-sky-300/90 font-semibold text-[0.7rem] sm:text-sm uppercase tracking-[0.16em] sm:tracking-[0.2em] mb-3 sm:mb-4">
            UK DVSA fleet compliance software
          </p>
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[2rem] xl:text-[2.25rem] font-semibold tracking-tight text-slate-100 mb-3 sm:mb-5 leading-snug max-w-xl px-1 sm:px-0">
            Daily walkaround checks, defect close-out, and MOT tracking for UK vehicle fleets
          </h1>
          <p className="text-sm sm:text-lg text-slate-300/95 max-w-md sm:max-w-xl leading-relaxed mb-6 sm:mb-8">
            Photo-led inspections on iOS and Android, with a manager web dashboard for defects, renewals, and audit
            evidence.
          </p>
          <div className="flex w-full max-w-sm md:max-w-none flex-col md:flex-row gap-3 md:gap-4 lg:w-auto md:justify-center lg:justify-start">
            <Link
              href="/onboarding"
              className="group inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-[var(--mkt-ink)] btn-brand-blue"
            >
              {FREE_TRIAL_CTA}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={WHATSAPP_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3.5 sm:py-4 min-h-[48px] rounded-xl border border-white/20 text-white font-medium bg-white/5 hover:bg-white/10 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-400">
            No card required ·{' '}
            <Link href="/features" className="text-sky-300 hover:text-sky-200 font-medium underline-offset-4 hover:underline">
              See how it works
            </Link>
          </p>
        </div>

        <div
          id="interactive-demo"
          className="relative order-2 w-full flex items-center justify-center px-2 sm:px-4 lg:px-2 mkt-animate-fade-in-hero-demo"
        >
          {/* Soft light pedestal — lifts the phone off the dark hero */}
          <div
            className="pointer-events-none absolute left-1/2 top-[42%] h-[78%] w-[92%] max-w-[420px] -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          >
            <div className="absolute inset-[-8%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(232,244,255,0.55)_0%,rgba(186,220,248,0.28)_38%,transparent_68%)] blur-2xl" />
            <div className="absolute inset-[18%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.42)_0%,rgba(147,197,253,0.22)_45%,transparent_70%)] blur-xl" />
            <div className="absolute left-1/2 bottom-[6%] h-[28%] w-[72%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.35)_0%,transparent_70%)] blur-2xl" />
          </div>
          <InteractiveAppDemo
            className="relative z-10 w-full max-w-[300px] drop-shadow-[0_28px_50px_rgba(8,20,40,0.45)]"
            controlsOnDark
          />
        </div>
      </div>
    </section>
  );
}
