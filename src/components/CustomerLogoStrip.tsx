import Image from 'next/image';
import Link from 'next/link';
import { CUSTOMER_STORIES } from '@/content/customerStories';

export default function CustomerLogoStrip() {
  return (
    <section
      className="border-y border-[var(--mkt-border)] bg-white py-10 sm:py-12"
      aria-labelledby="customers-strip-heading"
    >
      <div className="mkt-container max-w-5xl">
        <p
          id="customers-strip-heading"
          className="text-center text-[var(--mkt-muted)] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-7"
        >
          Trusted by UK fleet operators
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-16 sm:gap-y-6">
          {CUSTOMER_STORIES.map((story) => (
            <li key={story.slug} className="relative flex h-12 w-36 sm:h-16 sm:w-52 items-center justify-center">
              <Link href={story.href} aria-label={`Read the ${story.shortName} customer story`}>
                <Image
                  src={story.logoSrc}
                  alt={story.logoAlt}
                  width={208}
                  height={64}
                  className="h-10 w-auto max-h-12 sm:h-14 sm:max-h-16 object-contain opacity-90 hover:opacity-100 transition-opacity"
                  sizes="(max-width: 640px) 144px, 208px"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
