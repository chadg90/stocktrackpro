import type { ReactNode } from 'react';
import Link from 'next/link';

export function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <div className="mt-12 rounded-2xl border border-slate-200 bg-blue-50/70 p-6 sm:p-8">
      <h2 className="mb-5 text-xl font-semibold text-slate-900">Key takeaways</h2>
      <ul className="compliance-takeaway-list space-y-3">{children}</ul>
    </div>
  );
}

export function ArticleCta() {
  return (
    <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
      <p className="text-base leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-900">Fleet Track PRO</span> helps automate this process for UK fleets.{' '}
        <Link
          href="/onboarding"
          className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-4 font-medium"
        >
          Try free for 7 days — no card required.
        </Link>
      </p>
    </div>
  );
}
