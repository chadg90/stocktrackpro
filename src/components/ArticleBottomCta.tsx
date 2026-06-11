import Link from 'next/link';

export default function ArticleBottomCta() {
  return (
    <div className="not-prose mt-12 rounded-2xl border border-[var(--brand-blue)]/30 bg-[var(--brand-blue)]/10 p-6 sm:p-8 text-center">
      <p className="text-white font-semibold text-lg mb-2">Try Stock Track PRO on your fleet</p>
      <p className="text-white/65 text-sm mb-5 max-w-md mx-auto">
        Inspections, defects, and MOT visibility in one platform — 7-day free trial, no card required.
      </p>
      <Link
        href="/onboarding"
        className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white btn-brand-blue focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-black"
      >
        Start 7-Day Free Trial →
      </Link>
    </div>
  );
}
