import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { HOME_FAQ_ITEMS } from '@/content/homeFaq';

export default function HomeFaqSection() {
  return (
    <section className="mkt-section mkt-atmosphere" aria-labelledby="faq-heading">
      <div className="mkt-container max-w-3xl">
        <div className="mb-8 sm:mb-10">
          <p className="mkt-eyebrow mb-3">FAQ</p>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-[var(--mkt-ink)] leading-tight">
            Common questions
          </h2>
          <p className="mt-3 text-[var(--mkt-muted)] text-sm sm:text-base leading-relaxed">
            Quick answers before you start a trial or book a demo.
          </p>
        </div>

        <div className="border-t border-[var(--mkt-border)] divide-y divide-[var(--mkt-border)]">
          {HOME_FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group">
              <summary className="cursor-pointer list-none py-5 font-medium text-[var(--mkt-ink)] flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="text-sm sm:text-base leading-snug pr-2">{item.question}</span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-[var(--mkt-muted)] transition-transform group-open:rotate-180 group-open:text-[var(--brand-blue)]"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 text-[var(--mkt-muted)] text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>

        <p className="mt-8">
          <Link
            href="/faq"
            className="text-[var(--brand-blue)] hover:text-[var(--brand-blue-hover)] text-sm font-semibold underline underline-offset-4"
          >
            View all FAQs — pricing and setup
          </Link>
        </p>
      </div>
    </section>
  );
}
