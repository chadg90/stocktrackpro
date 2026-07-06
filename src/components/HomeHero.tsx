'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HOME_HERO_POSTER_SRC, HOME_HERO_VIDEO_SRC } from '@/content/homeHero';

const WHATSAPP_ENQUIRY_URL =
  'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduceMotion) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  }, [reduceMotion]);

  return (
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
      <div className="relative aspect-square sm:aspect-[4/5] lg:aspect-auto h-auto lg:h-full lg:min-h-[calc(100vh-6rem)] order-1 lg:order-2 overflow-hidden">
        <video
          ref={videoRef}
          src={HOME_HERO_VIDEO_SRC}
          poster={HOME_HERO_POSTER_SRC}
          autoPlay={!reduceMotion}
          loop={!reduceMotion}
          muted
          playsInline
          preload="metadata"
          aria-label="Stock Track PRO app demo in the field"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 lg:bg-gradient-to-r lg:from-black/70 lg:from-0% lg:via-black/10 lg:via-[4%] lg:to-transparent lg:to-[10%]"
          aria-hidden
        />
      </div>
    </section>
  );
}
