import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { getHomepageCustomerStories, type CustomerStory } from '@/content/customerStories';

function StoryCard({ story }: { story: CustomerStory }) {
  const hasQuote = Boolean(story.quote?.trim());
  const quoteBody = (story.cardExcerpt || story.quote || '').trim();
  const attributionName = story.quoteName || story.shortName;
  const attributionRole = story.quoteRole || story.industry;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-5 flex h-14 items-center">
        <Image
          src={story.logoSrc}
          alt={story.logoAlt}
          width={200}
          height={56}
          className="h-12 w-auto max-h-14 object-contain object-left"
          sizes="200px"
        />
      </div>

      {hasQuote ? (
        <>
          <div className="mb-4 flex items-center gap-1 text-amber-400" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
            ))}
          </div>
          <blockquote className="flex-1 text-slate-800 text-base sm:text-lg leading-relaxed mb-6">
            &ldquo;{quoteBody}&rdquo;
          </blockquote>
        </>
      ) : (
        <div className="flex-1 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
            How they use Fleet Track PRO
          </p>
          <ul className="space-y-2.5">
            {story.impact.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 leading-snug">
                <span
                  className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)] shrink-0"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto border-t border-slate-100 pt-5">
        <p className="text-sm text-slate-600 mb-1">
          <span className="font-semibold text-slate-900">{attributionName}</span>
        </p>
        <p className="text-sm text-slate-500 mb-4">
          {attributionRole}
          <span className="text-slate-300 mx-1.5" aria-hidden>
            ·
          </span>
          {story.fleetSize} {story.fleetSize === 1 ? 'vehicle' : 'vehicles'}
          <span className="text-slate-300 mx-1.5" aria-hidden>
            ·
          </span>
          {story.location}
        </p>

        <Link
          href={story.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-blue)] hover:text-blue-700"
        >
          Read their story
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export default function CustomerStoriesSection() {
  const stories = getHomepageCustomerStories();

  return (
    <section className="py-14 sm:py-20 bg-white" aria-labelledby="customer-stories-heading">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
            Trusted by fleet operators
          </p>
          <h2 id="customer-stories-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">
            Real results from real teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {stories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Built for UK fleets · GDPR-minded practices · Data hosted with industry-standard cloud providers
        </p>
      </div>
    </section>
  );
}
