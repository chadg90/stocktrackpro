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
 * Light band + single logo row (reference: “trusted by” corporate strips).
 * Featured logos render taller/wider so they read as the hero mark in the row.
 */
export function CompaniesShowcaseStrip({ logos }: { logos: ShowcaseLogo[] }) {
  const rowJustify =
    logos.length <= 1
      ? 'justify-center'
      : logos.length <= 3
        ? 'justify-center sm:justify-evenly'
        : 'justify-center lg:justify-between';

  return (
    <section className="bg-white border-y border-neutral-200 py-14 sm:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <p className="text-center text-neutral-500 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] sm:tracking-[0.32em] mb-10 sm:mb-14 px-2">
          Companies which use us
        </p>

        <div
          className={`flex flex-wrap items-center gap-x-10 gap-y-10 sm:gap-x-14 sm:gap-y-12 md:flex-nowrap ${rowJustify}`}
        >
          {logos.map((logo) => (
            <div
              key={logo.src}
              className={`relative flex shrink-0 items-center justify-center ${
                logo.featured
                  ? 'h-[4.5rem] w-44 sm:h-24 sm:w-52 md:h-[6.5rem] md:w-60'
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
                    ? '(max-width: 768px) 176px, 240px'
                    : '(max-width: 768px) 128px, 160px'
                }
              />
            </div>
          ))}
        </div>

        <p className="text-center text-neutral-500 text-sm mt-12 sm:mt-14 max-w-lg mx-auto leading-relaxed">
          Shown with their permission. Happy to be listed?{' '}
          <Link
            href="/contact"
            className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-neutral-300 hover:decoration-blue-500/50 transition-colors"
          >
            Get in touch
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
