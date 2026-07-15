import Link from 'next/link';
import { HOME_FAQ_ITEMS } from '@/content/homeFaq';

export default function HomeFaqSection() {
  return (
    <section className="py-14 sm:py-24 bg-slate-100" aria-labelledby="faq-heading">
      <div className="container mx-auto px-5 sm:px-4 max-w-3xl">
        <h2 id="faq-heading" className="text-2xl sm:text-4xl font-bold text-slate-900 text-center mb-8 sm:mb-10">
          Common questions
        </h2>
        <div className="space-y-3">
          {HOME_FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-slate-200 bg-white px-5 py-4 open:border-slate-300 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-colors"
            >
              <summary className="cursor-pointer list-none font-medium text-slate-900 flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span className="text-slate-400 text-xl leading-none group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="text-center mt-8">
          <Link
            href="/faq"
            className="text-[var(--brand-blue)] hover:text-blue-700 text-sm font-medium underline underline-offset-4"
          >
            View all FAQs — pricing, plant add-on, and setup
          </Link>
        </p>
      </div>
    </section>
  );
}
