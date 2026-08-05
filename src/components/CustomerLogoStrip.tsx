import Image from 'next/image';
import { CUSTOMER_STORIES } from '@/content/customerStories';

export default function CustomerLogoStrip() {
  return (
    <section className="border-y border-slate-200/80 bg-slate-50/80 py-8 sm:py-10" aria-labelledby="customers-strip-heading">
      <div className="container mx-auto px-4 max-w-5xl">
        <p
          id="customers-strip-heading"
          className="text-center text-slate-500 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-6"
        >
          Used by teams that keep fleets moving
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 sm:gap-x-16">
          {CUSTOMER_STORIES.map((story) => (
            <li key={story.slug} className="relative flex h-14 w-44 sm:h-16 sm:w-52 items-center justify-center">
              <Image
                src={story.logoSrc}
                alt={story.logoAlt}
                width={208}
                height={64}
                className="h-12 w-auto max-h-14 sm:h-14 sm:max-h-16 object-contain"
                sizes="208px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
