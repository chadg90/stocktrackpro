'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import InteractiveAppDemo from '@/components/InteractiveAppDemo';
import AppStoreBadge from '@/components/AppStoreBadge';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { androidInviteMailto } from '@/lib/androidInvite';
import {
  FREE_TRIAL_CTA,
  PLATFORM_AVAILABILITY,
  SITE_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_DEMO_CTA,
  WHATSAPP_DEMO_URL,
} from '@/lib/brand';

export default function HomeHero() {
  return (
    <section id="home-hero" className="relative overflow-hidden mkt-hero-plane pt-[4.25rem] sm:pt-24">
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
      <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-6 sm:gap-10 lg:gap-x-8 lg:gap-y-0 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 xl:px-12 pb-8 sm:pb-16 lg:pb-20 lg:pt-6">
        {/* Copy + CTAs — first on mobile so actions appear before the phone */}
        <div className="order-1 text-center lg:text-left flex flex-col items-center lg:items-start mkt-animate-fade-up pt-4 sm:pt-10 lg:pt-8 lg:pb-2">
          <p className="mkt-display text-[1.85rem] leading-[1.08] sm:text-5xl md:text-6xl xl:text-[4.25rem] font-bold tracking-tight text-white mb-2 sm:mb-5 sm:leading-[1.05]">
            {SITE_NAME}
          </p>
          <p className="text-sky-200 font-semibold text-[0.65rem] sm:text-sm uppercase tracking-[0.14em] sm:tracking-[0.2em] mb-2.5 sm:mb-4">
            UK DVSA fleet compliance software
          </p>
          <h1 className="text-base sm:text-2xl md:text-3xl lg:text-[2rem] xl:text-[2.25rem] font-semibold tracking-tight text-slate-100 mb-2.5 sm:mb-5 leading-snug max-w-xl px-0.5 sm:px-0">
            Daily walkaround checks, defect close-out, and MOT tracking for UK vehicle fleets
          </h1>
          {/* Shorter support on small screens — platform detail lives under App Store */}
          <p className="text-sm sm:text-lg text-slate-200 max-w-md sm:max-w-xl leading-relaxed mb-5 sm:mb-8">
            <span className="sm:hidden">
              Photo-led inspections with a manager web dashboard for defects, renewals, and audit evidence.
            </span>
            <span className="hidden sm:inline">
              Photo-led inspections — {PLATFORM_AVAILABILITY} — with a manager web dashboard for defects, renewals, and
              audit evidence.
            </span>
          </p>

          <div className="w-full max-w-sm flex flex-col items-stretch gap-2.5 sm:gap-3">
            <Link
              href="/onboarding/?start=1"
              className="group inline-flex w-full items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-[var(--mkt-ink)] btn-brand-blue"
            >
              <span className="sm:hidden">Start free trial</span>
              <span className="hidden sm:inline">{FREE_TRIAL_CTA}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={WHATSAPP_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-location="hero"
              data-analytics-intent="demo"
              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl border border-white/15 text-white/95 font-medium bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              {WHATSAPP_DEMO_CTA}
            </a>
            <p className="pt-0.5 text-center text-xs text-slate-300 lg:text-left">
              No card required
              <span className="mx-2 text-slate-400" aria-hidden>
                ·
              </span>
              <a
                href="#defect-workflow"
                className="text-sky-200 hover:text-sky-100 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mkt-ink)] rounded"
              >
                See how it works
              </a>
            </p>
          </div>
        </div>

        {/* Phone demo — second on mobile so it sits above the store badge */}
        <div
          id="interactive-demo"
          className="relative order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 w-full flex flex-col items-center justify-center px-1 sm:px-4 lg:px-2 mkt-animate-fade-in-hero-demo gap-2 lg:pt-8"
        >
          <p className="relative z-10 text-center text-xs font-medium text-sky-100 max-w-[240px] leading-snug px-2">
            Try the driver app — tap to explore
          </p>
          <div
            className="pointer-events-none absolute left-1/2 top-[48%] h-[78%] w-[92%] max-w-[420px] -translate-x-1/2 -translate-y-1/2"
            aria-hidden
          >
            <div className="absolute inset-[-8%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(232,244,255,0.55)_0%,rgba(186,220,248,0.28)_38%,transparent_68%)] blur-2xl" />
            <div className="absolute inset-[18%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.42)_0%,rgba(147,197,253,0.22)_45%,transparent_70%)] blur-xl" />
            <div className="absolute left-1/2 bottom-[6%] h-[28%] w-[72%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.35)_0%,transparent_70%)] blur-2xl" />
          </div>
          <InteractiveAppDemo
            className="relative z-10 w-full max-w-[260px] sm:max-w-[300px] drop-shadow-[0_28px_50px_rgba(8,20,40,0.45)]"
            controlsOnDark
          />
        </div>

        {/* App Store — after the phone on mobile; under CTAs on desktop */}
        <div className="order-3 lg:col-start-1 w-full max-w-sm mx-auto lg:mx-0 flex flex-col items-center lg:items-start gap-2 border-t border-white/10 pt-5 lg:pt-6 lg:mt-2">
          <AppStoreBadge
            analyticsLocation="hero"
            showAndroidNote={false}
            className="[&_img]:brightness-110"
          />
          <p className="text-xs text-slate-300 leading-snug text-center lg:text-left">
            Android? Email{' '}
            <a
              href={androidInviteMailto()}
              className="text-sky-200 underline underline-offset-2 hover:text-sky-100"
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            for an invite.
          </p>
        </div>
      </div>
    </section>
  );
}
