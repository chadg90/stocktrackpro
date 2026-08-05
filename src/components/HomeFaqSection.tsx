import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { HOME_FAQ_ITEMS } from '@/content/homeFaq';

export default function HomeFaqSection() {
  return (
    <section className="py-14 sm:py-20 bg-white" aria-labelledby="faq-heading">
      <div className="container mx-auto px-5 sm:px-4 max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
            FAQ
          </p>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">
            Common questions
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Quick answers before you start a trial or book a demo.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 overflow-hidden divide-y divide-slate-200">
          {HOME_FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group bg-white open:bg-slate-50/90">
              <summary className="cursor-pointer list-none px-5 sm:px-6 py-4 sm:py-5 font-medium text-slate-900 flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="text-sm sm:text-base leading-snug pr-2">{item.question}</span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-[var(--brand-blue)]"
                  aria-hidden
                />
              </summary>
              <p className="px-5 sm:px-6 pb-5 text-slate-600 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>

        <p className="text-center mt-8">
          <Link
            href="/faq"
            className="text-[var(--brand-blue)] hover:text-blue-700 text-sm font-semibold underline underline-offset-4"
          >
            View all FAQs — pricing and setup
          </Link>
        </p>
      </div>
    </section>
  );
}
