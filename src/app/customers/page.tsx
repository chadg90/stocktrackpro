import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import MarketingWebPageJsonLd from '@/components/seo/MarketingWebPageJsonLd';
import { CUSTOMER_STORIES } from '@/content/customerStories';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Customer stories',
  description:
    'How UK fleets use Fleet Track PRO for daily walkaround checks, defect close-out, and MOT tracking — Newstreet Groundworks and NEEMT.',
  alternates: { canonical: canonicalPath('/customers') },
  openGraph: {
    title: 'Customer stories | Fleet Track PRO',
    description: 'UK fleet case studies from Newstreet Groundworks and NEEMT.',
    url: absolutePageUrl('/customers'),
    siteName: 'Fleet Track PRO',
    locale: 'en_GB',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Fleet Track PRO customer stories' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer stories | Fleet Track PRO',
    images: ['/og-image.jpg'],
  },
};

export default function CustomersIndexPage() {
  return (
    <div className="marketing-shell">
      <MarketingWebPageJsonLd
        path="/customers/"
        title="Customer stories"
        description="UK fleet case studies from Newstreet Groundworks and NEEMT."
      />
      <Navbar />
      <main>
        <section className="relative overflow-hidden pt-28 sm:pt-36 pb-12 sm:pb-16 mkt-atmosphere">
          <div className="mkt-container max-w-3xl">
            <p className="mkt-eyebrow mb-4">Customer stories</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--mkt-ink)] mb-5 leading-tight">
              How UK fleets use Fleet Track PRO
            </h1>
            <p className="text-[var(--mkt-muted)] text-lg leading-relaxed">
              Short case studies from operators running daily walkaround checks, defect close-out, and MOT tracking.
            </p>
          </div>
        </section>

        <section className="pb-16 sm:pb-24 border-t border-[var(--mkt-border)] bg-white">
          <div className="mkt-container">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {CUSTOMER_STORIES.map((story) => (
                <li key={story.slug}>
                  <Link
                    href={story.href}
                    className="group flex flex-col h-full rounded-2xl border border-[var(--mkt-border)] bg-[var(--mkt-bg)] p-6 sm:p-8 transition-colors hover:border-[var(--brand-blue)]/40"
                  >
                    <div className="relative h-14 w-44 mb-6">
                      <Image
                        src={story.logoSrc}
                        alt={story.logoAlt}
                        fill
                        className="object-contain object-left"
                        sizes="176px"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--mkt-ink)] mb-2 group-hover:text-[var(--brand-blue)]">
                      {story.shortName}
                    </h2>
                    <p className="text-sm text-[var(--mkt-muted)] leading-relaxed flex-1">
                      {story.cardExcerpt || story.summary}
                    </p>
                    <span className="mt-5 text-sm font-semibold text-[var(--brand-blue)] underline underline-offset-4">
                      Read case study
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
