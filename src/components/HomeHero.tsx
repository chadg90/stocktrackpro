'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HOME_HERO_POSTER_SRC, HOME_HERO_VIDEO_DESCRIPTION, HOME_HERO_VIDEO_SRC } from '@/content/homeHero';

const WHATSAPP_ENQUIRY_URL =
  'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%2C%20I%27d%20like%20to%20get%20started%20with%20your%20service.';

const MOBILE_MEDIA_QUERY = '(max-width: 1023px)';

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateMotion = () => setReduceMotion(motionQuery.matches);
    const updateMobile = () => {
      const mobile = mobileQuery.matches;
      setIsMobile(mobile);
      if (!mobile) setShouldLoadVideo(true);
    };

    updateMotion();
    updateMobile();

    motionQuery.addEventListener('change', updateMotion);
    mobileQuery.addEventListener('change', updateMobile);

    return () => {
      motionQuery.removeEventListener('change', updateMotion);
      mobileQuery.removeEventListener('change', updateMobile);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '80px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo || reduceMotion) return;

    video.play().catch(() => {});
  }, [shouldLoadVideo, reduceMotion]);

  const showVideo = shouldLoadVideo && !reduceMotion;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-[4.5rem] sm:pt-28 lg:pt-24 lg:min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative order-1 lg:order-2 w-full lg:h-full lg:min-h-[calc(100vh-6rem)]">
        <div className="relative mx-4 mt-2 h-[40vh] min-h-[260px] max-h-[360px] overflow-hidden rounded-2xl border border-white/10 sm:mx-6 sm:mt-0 sm:h-auto sm:max-h-none sm:aspect-[4/5] sm:rounded-none sm:border-0 lg:mx-0 lg:aspect-auto lg:h-full lg:rounded-none">
          {showVideo ? (
            <video
              ref={videoRef}
              src={HOME_HERO_VIDEO_SRC}
              poster={HOME_HERO_POSTER_SRC}
              autoPlay
              loop
              muted
              playsInline
              preload={isMobile ? 'none' : 'metadata'}
              aria-label={HOME_HERO_VIDEO_DESCRIPTION}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <Image
              src={HOME_HERO_POSTER_SRC}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover object-center"
              aria-hidden
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 lg:hidden"
            aria-hidden
          />
          <div
            className="absolute inset-0 hidden lg:block lg:bg-gradient-to-r lg:from-black/70 lg:from-0% lg:via-black/10 lg:via-[4%] lg:to-transparent lg:to-[10%]"
            aria-hidden
          />
        </div>
      </div>

      <div className="relative flex flex-col justify-center px-5 sm:px-6 lg:px-10 xl:px-16 pt-8 pb-10 sm:py-16 lg:py-24 order-2 lg:order-1 text-center lg:text-left items-center lg:items-start">
        <p className="text-[var(--brand-blue)] font-medium text-xs sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em] mb-3 sm:mb-5">
          UK fleet compliance platform
        </p>
        <h1 className="text-[1.875rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white mb-4 sm:mb-6 leading-[1.12] sm:leading-[1.08] max-w-xl lg:max-w-none">
          Fleet Management, Compliance &amp; Defect Resolution.
        </h1>
        <p className="text-[0.95rem] sm:text-lg md:text-xl text-white/80 max-w-md sm:max-w-2xl leading-relaxed mb-7 sm:mb-10">
          Daily inspections, defect close-out, and MOT visibility — mobile app for the field, web dashboard for managers.
          Optional Plant &amp; Machinery add-on for LOLER, service, and hire-check records on site.
        </p>
        <div className="flex w-full max-w-sm sm:max-w-none flex-col sm:flex-row gap-3 sm:gap-4 lg:w-auto">
          <Link
            href="/onboarding"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 sm:py-4 min-h-[48px] rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black btn-brand-blue"
          >
            Start 7-Day Free Trial
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-5 flex flex-col items-center gap-2 lg:items-start">
          <Link
            href="/features"
            className="text-[var(--brand-blue)] hover:text-blue-400 text-sm font-medium inline-flex items-center gap-1 transition-colors py-1"
          >
            See how it works →
          </Link>
          <a
            href={WHATSAPP_ENQUIRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 hover:text-white/70 transition-colors py-1"
          >
            Questions? <span className="underline underline-offset-2">Message us on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
