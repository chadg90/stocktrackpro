import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export type ShowcaseLogo = {
  src: string;
  alt: string;
  /** Larger mark in the row (e.g. anchor client). */
  featured?: boolean;
};

type Props = {
  logos: ShowcaseLogo[];
  /** Optional class on outer section (e.g. spacing from hero). */
  className?: string;
};

/**
 * Light band + logo row for the marketing home page. Featured logos get a card and larger mark.
 */
export function CompaniesShowcaseStrip({ logos, className = '' }: Props) {
  const rowJustify =
    logos.length <= 1
      ? 'justify-center'
      : logos.length <= 3
        ? 'justify-center sm:justify-evenly'
        : 'justify-center lg:justify-between';

  return (
    <section
      className={`bg-gradient-to-b from-slate-50 to-neutral-50 border-y border-slate-200/80 py-8 sm:py-10 ${className}`.trim()}
      aria-labelledby="showcase-heading"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <p className="text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Our customers
          </p>
          <h2
            id="showcase-heading"
            className="text-slate-900 text-xl sm:text-2xl font-semibold tracking-tight mb-2"
          >
            Teams that rely on Stock Track PRO
          </h2>
          <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
            From groundwork to trades — UK businesses keeping assets and vehicles organised.
          </p>
        </div>

        <div
          className={`flex flex-wrap items-center justify-items-center gap-x-8 gap-y-6 sm:gap-x-10 md:flex-nowrap ${rowJustify}`}
        >
          {logos.map((logo) => (
            <div
              key={logo.src}
              className={
                logo.featured
                  ? 'mx-auto w-full max-w-2xl rounded-2xl bg-white px-6 py-5 sm:px-10 sm:py-7 md:px-12 md:py-8 ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)]'
                  : 'mx-auto'
              }
            >
              {/* Wide horizontal marks (e.g. wordmark + icon row): width-led box, generous padding */}
              <div
                className={`relative mx-auto flex shrink-0 items-center justify-center ${
                  logo.featured
                    ? 'aspect-[5/2] w-full max-h-[96px] sm:max-h-[116px] md:max-h-[132px] min-h-[64px]'
                    : 'h-10 w-32 sm:h-12 sm:w-36 md:h-14 md:w-40'
                }`}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain object-center"
                  sizes={
                    logo.featured
                      ? '(max-width: 768px) 90vw, 672px'
                      : '(max-width: 768px) 128px, 160px'
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs sm:text-sm mt-6 max-w-md mx-auto leading-relaxed">
          Your logo could be here — we work with growing fleets and contractors across the UK.
        </p>

        <div className="text-center mt-5">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            Become a customer
          </Link>
        </div>
      </div>
    </section>
  );
}
