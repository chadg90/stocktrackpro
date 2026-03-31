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
      className={`bg-neutral-50 border-y border-neutral-200/90 py-10 sm:py-12 ${className}`.trim()}
      aria-labelledby="showcase-heading"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-neutral-500 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Our customers
          </p>
          <h2
            id="showcase-heading"
            className="text-neutral-900 text-xl sm:text-2xl font-semibold tracking-tight mb-2"
          >
            Teams that rely on Stock Track PRO
          </h2>
          <p className="text-neutral-600 text-sm sm:text-[15px] leading-relaxed">
            From groundwork to trades — UK businesses keeping assets and vehicles organised.
          </p>
        </div>

        <div
          className={`flex flex-wrap items-center justify-items-center gap-x-10 gap-y-8 sm:gap-x-12 md:flex-nowrap ${rowJustify}`}
        >
          {logos.map((logo) => (
            <div
              key={logo.src}
              className={
                logo.featured
                  ? 'mx-auto rounded-2xl bg-white border border-neutral-200 shadow-sm shadow-neutral-900/5 px-6 py-5 sm:px-8 sm:py-6 w-full max-w-md'
                  : 'mx-auto'
              }
            >
              <div
                className={`relative flex shrink-0 items-center justify-center mx-auto ${
                  logo.featured
                    ? 'h-24 w-full max-w-[280px] sm:h-32 sm:max-w-[320px] md:h-36 md:max-w-[360px]'
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
                      ? '(max-width: 768px) 280px, 360px'
                      : '(max-width: 768px) 128px, 160px'
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-neutral-500 text-xs sm:text-sm mt-8 max-w-md mx-auto leading-relaxed">
          Your logo could be here — we work with growing fleets and contractors across the UK.
        </p>

        <div className="text-center mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-50"
          >
            Become a customer
          </Link>
        </div>
      </div>
    </section>
  );
}
