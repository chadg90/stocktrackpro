import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export type ShowcaseLogo = {
  src: string;
  alt: string;
  /** Larger mark in the row (e.g. anchor client). */
  featured?: boolean;
};

/**
 * Light band + logo row. Featured logos get a white card and a larger mark.
 */
export function CompaniesShowcaseStrip({ logos }: { logos: ShowcaseLogo[] }) {
  const rowJustify =
    logos.length <= 1
      ? 'justify-center'
      : logos.length <= 3
        ? 'justify-center sm:justify-evenly'
        : 'justify-center lg:justify-between';

  return (
    <section className="bg-neutral-50 border-y border-neutral-200 py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-center text-neutral-500 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] sm:tracking-[0.32em] mb-4 sm:mb-5 px-2">
          Companies which use us
        </p>

        <div
          className={`flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10 md:flex-nowrap ${rowJustify}`}
        >
          {logos.map((logo) => (
            <div
              key={logo.src}
              className={
                logo.featured
                  ? 'rounded-2xl bg-white border border-neutral-200/90 shadow-sm p-4 sm:p-5 md:p-6'
                  : ''
              }
            >
              <div
                className={`relative flex shrink-0 items-center justify-center ${
                  logo.featured
                    ? 'h-28 w-52 sm:h-36 sm:w-64 md:h-44 md:w-80'
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

        <div className="text-center mt-5 sm:mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-neutral-300 hover:decoration-blue-500/50 transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
}
