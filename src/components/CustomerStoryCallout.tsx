import Image from 'next/image';
import Link from 'next/link';

export default function CustomerStoryCallout() {
  return (
    <section
      className="py-12 sm:py-16 border-y border-white/10 bg-white/[0.02]"
      aria-labelledby="customer-story-heading"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <p className="text-[var(--brand-blue)] font-medium text-sm uppercase tracking-[0.2em] mb-3 text-center">
          Case study
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-6">
            <div className="relative mx-auto h-16 w-56 shrink-0 sm:mx-0 sm:h-auto sm:w-64 sm:self-stretch">
              <Image
                src="/clients/newstreet-groundwork.png"
                alt="Newstreet Groundwork Services"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 224px, 256px"
              />
            </div>
            <div className="flex flex-1 min-w-0 flex-col text-center sm:text-left">
              <h2 id="customer-story-heading" className="text-xl sm:text-2xl font-semibold text-white mb-3">
                Newstreet Groundworks, County Durham
              </h2>
              <p className="text-white/75 leading-relaxed text-sm sm:text-base">
                Managing their fleet across multiple active sites. Stock Track PRO replaced WhatsApp groups and paper
                sheets with a single system their drivers and managers actually use.
              </p>
              <Link
                href="/customers/newstreet"
                className="inline-flex mt-5 text-[var(--brand-blue)] hover:text-blue-300 text-sm font-medium underline underline-offset-4"
              >
                Read the case study →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
