import { HOME_FAQ_ITEMS } from '@/content/homeFaq';

export default function HomeFaqSection() {
  return (
    <section className="py-20 sm:py-28 border-t border-white/10" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-white text-center mb-10">
          Common Questions
        </h2>
        <div className="space-y-3">
          {HOME_FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 open:bg-white/[0.05] transition-colors"
            >
              <summary className="cursor-pointer list-none font-medium text-white flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span className="text-white/40 text-xl leading-none group-open:rotate-180 transition-transform">
                  ⌄
                </span>
              </summary>
              <p className="mt-4 text-white/70 text-sm leading-relaxed border-t border-white/10 pt-4">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
