import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, Clock3, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import {
  DEMO_BOOKING_EMBED_URL,
  DEMO_DURATION_MINUTES,
  DEMO_WHATSAPP_URL,
} from '@/content/demoBooking';

export const metadata: Metadata = {
  title: 'Book a 15-minute demo',
  description:
    'Book a free 15-minute Fleet Track PRO demo — see walkaround checks, defects, and MOT tracking for your UK fleet.',
  alternates: { canonical: '/book-demo' },
};

export default function BookDemoPage() {
  const hasCalendar = Boolean(DEMO_BOOKING_EMBED_URL);

  return (
    <div className="marketing-shell">
      <Navbar />
      <main className="border-t border-slate-200 bg-slate-50/80">
        <div className="container mx-auto px-4 pt-24 sm:pt-28 pb-16 max-w-4xl">
          <p className="text-[var(--brand-blue)] font-semibold text-sm uppercase tracking-[0.18em] mb-3">
            Book a demo
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            15-minute Fleet Track PRO walkthrough
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mb-8">
            Pick a time that suits you. We&apos;ll show inspections, defect close-out, and MOT/tax tracking — no
            hard sell.
          </p>

          <div className="flex flex-wrap gap-4 mb-10 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5">
              <Clock3 className="h-4 w-4 text-[var(--brand-blue)]" aria-hidden />
              {DEMO_DURATION_MINUTES} minutes
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5">
              <CalendarDays className="h-4 w-4 text-[var(--brand-blue)]" aria-hidden />
              Online video call
            </span>
          </div>

          {hasCalendar ? (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <iframe
                src={DEMO_BOOKING_EMBED_URL}
                title="Book a 15-minute Fleet Track PRO demo"
                className="w-full min-h-[720px] border-0"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Request a demo slot</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                Message us with a couple of times that work and we&apos;ll confirm a 15-minute call. Prefer email?
                Use the contact form and mention &quot;demo&quot;.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={DEMO_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white btn-brand-blue"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Book via WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium border border-slate-300 text-slate-800 bg-white hover:bg-slate-50"
                >
                  Contact form
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
