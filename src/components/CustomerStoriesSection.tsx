import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getHomepageCustomerStories, type CustomerStory } from '@/content/customerStories';

function StoryCard({ story }: { story: CustomerStory }) {
  const hasQuote = Boolean(story.quote?.trim());
  const quoteBody = (story.cardExcerpt || story.quote || '').trim();
  const attributionName = story.quoteName || story.shortName;
  const attributionRole = story.quoteRole || story.industry;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--mkt-border)] bg-white p-6 sm:p-8 transition-shadow duration-200 hover:shadow-[0_16px_40px_rgba(10,22,40,0.08)]">
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
        <blockquote className="flex-1 text-[var(--mkt-ink)] text-base sm:text-lg leading-relaxed mb-6">
          &ldquo;{quoteBody}&rdquo;
        </blockquote>
      ) : (
        <div className="flex-1 mb-6">
          <p className="mkt-eyebrow mb-3">How they use Fleet Track PRO</p>
          <ul className="space-y-2.5">
            {story.impact.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--mkt-muted)] leading-snug">
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

      <div className="mt-auto border-t border-[var(--mkt-border)] pt-5">
        <p className="text-sm text-[var(--mkt-muted)] mb-1">
          <span className="font-semibold text-[var(--mkt-ink)]">{attributionName}</span>
        </p>
        <p className="text-sm text-[var(--mkt-muted)] mb-4">
          {attributionRole}
          <span className="text-[var(--mkt-border)] mx-1.5" aria-hidden>
            ·
          </span>
          {story.fleetSize} {story.fleetSize === 1 ? 'vehicle' : 'vehicles'}
          <span className="text-[var(--mkt-border)] mx-1.5" aria-hidden>
            ·
          </span>
          {story.location}
        </p>

        <Link
          href={story.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-blue)] hover:text-[var(--brand-blue-hover)]"
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
    <section className="mkt-section bg-white">
      <div className="mkt-container">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <p className="mkt-eyebrow mb-3">Customer stories</p>
          <h2 id="customer-stories-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--mkt-ink)] leading-tight">
            How UK fleets use Fleet Track PRO
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {stories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>

        <p className="mt-10 text-sm text-[var(--mkt-muted)]">
          Built for UK fleets · GDPR-minded practices · Data hosted with industry-standard cloud providers
        </p>
      </div>
    </section>
  );
}
