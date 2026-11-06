import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/brand';

export const metadata: Metadata = {
  title: {
    absolute: 'Page not found | Fleet Track PRO',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main className="mkt-container pt-24 sm:pt-32 pb-20 max-w-2xl text-center">
        <p className="mkt-eyebrow mb-4">404</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--mkt-ink)] mb-4">
          Page not found
        </h1>
        <p className="text-[var(--mkt-muted)] text-lg leading-relaxed mb-10">
          That link may be old or mistyped.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mb-10">
          <Link
            href="/onboarding/?start=1"
            className="inline-flex items-center justify-center px-6 py-3.5 min-h-[48px] rounded-xl text-white font-semibold btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2"
          >
            Start 14-day free trial
          </Link>
          <Link
            href="/dashboard/"
            className="inline-flex items-center justify-center px-6 py-3.5 min-h-[48px] rounded-xl border border-[var(--mkt-border)] bg-white text-[var(--mkt-ink)] font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2"
          >
            Manager login
          </Link>
          <Link
            href="/getting-started/"
            className="inline-flex items-center justify-center px-6 py-3.5 min-h-[48px] rounded-xl border border-[var(--mkt-border)] bg-white text-[var(--mkt-ink)] font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2"
          >
            Getting started guide
          </Link>
        </div>

        <nav
          aria-label="Helpful links"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--mkt-muted)]"
        >
          <Link href="/pricing/" className="hover:text-[var(--brand-blue)] underline-offset-4 hover:underline">
            Pricing
          </Link>
          <Link href="/faq/" className="hover:text-[var(--brand-blue)] underline-offset-4 hover:underline">
            FAQ
          </Link>
          <Link
            href="/compliance-centre/"
            className="hover:text-[var(--brand-blue)] underline-offset-4 hover:underline"
          >
            Compliance Centre
          </Link>
          <a
            href={SUPPORT_MAILTO}
            className="hover:text-[var(--brand-blue)] underline-offset-4 hover:underline"
          >
            Email {SUPPORT_EMAIL}
          </a>
        </nav>
      </main>
    </div>
  );
}
