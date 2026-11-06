import Link from 'next/link';

/** Short end-of-article CTA — shown on every compliance article. */
export default function WalkaroundPhoneCta() {
  return (
    <div className="not-prose mt-10 rounded-2xl border border-[var(--brand-blue)]/25 bg-[var(--mkt-muted-surface)] p-5 sm:p-6">
      <p className="text-base leading-relaxed text-slate-800">
        <Link
          href="/vehicle-walkaround-check-app/"
          className="font-semibold text-[var(--brand-blue)] underline underline-offset-4 hover:text-[var(--brand-blue-hover)]"
        >
          Do your daily checks on a phone instead of paper
        </Link>
      </p>
    </div>
  );
}
