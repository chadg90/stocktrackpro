import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

const OUTCOMES = [
  'Multi-site vans visible to the office each day',
  'Fewer chase-ups when something is flagged on a vehicle',
  'One shared record for drivers and managers',
];

export default function CustomerStoryCallout() {
  return (
    <section className="py-14 sm:py-20 bg-white" aria-labelledby="customer-story-heading">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
            Case study
          </p>
          <h2 id="customer-story-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">
            How a Durham groundworks fleet went digital
          </h2>
        </div>

        <article className="mkt-card-static max-w-2xl mx-auto p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 mb-6">
            <div className="relative h-24 w-48 sm:h-28 sm:w-56 shrink-0">
              <Image
                src="/clients/newstreet-groundwork.png"
                alt="Newstreet Groundwork Services"
                fill
                className="object-contain object-left"
                sizes="224px"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Newstreet Groundworks
              </h3>
              <p className="inline-flex items-center gap-2 text-slate-500 text-sm mt-2">
                <MapPin className="h-3.5 w-3.5 text-[var(--brand-blue)]" aria-hidden />
                County Durham
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-6">
            A County Durham groundworks team moved off WhatsApp groups and paper check sheets so site vans stay visible
            to the office every day.
          </p>

          <ul className="space-y-2.5 mb-7">
            {OUTCOMES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--brand-blue)] shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/customers/newstreet"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
          >
            Read the case study
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </article>
      </div>
    </section>
  );
}
