import Link from 'next/link';
import { CalendarCheck, CalendarRange, PoundSterling, ShieldCheck } from 'lucide-react';
import {
  BILLING_REASSURANCE_HEADING,
  BILLING_REASSURANCE_ITEMS,
  BILLING_REASSURANCE_TERMS_HREF,
  BILLING_REASSURANCE_TERMS_LABEL,
} from '@/content/billingReassurance';

const ICONS = [CalendarCheck, ShieldCheck, CalendarRange, PoundSterling] as const;

type Props = {
  /** Optional tighter spacing when embedded in a narrow column */
  className?: string;
};

/**
 * Four-line billing reassurance under the pricing plan card.
 * Wording must stay aligned with /subscription-terms/.
 */
export default function BillingReassuranceStrip({ className = '' }: Props) {
  return (
    <aside
      className={`mt-8 rounded-2xl border border-[var(--mkt-border)] bg-white p-5 sm:p-6 ${className}`}
      aria-labelledby="billing-reassurance-heading"
    >
      <h2
        id="billing-reassurance-heading"
        className="text-base sm:text-lg font-semibold text-[var(--mkt-ink)] mb-4"
      >
        {BILLING_REASSURANCE_HEADING}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {BILLING_REASSURANCE_ITEMS.map((line, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <li key={line} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--mkt-muted-surface)] text-[var(--brand-blue)]"
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm text-[var(--mkt-muted)] leading-snug pt-1.5">{line}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 pt-4 border-t border-[var(--mkt-border)] text-sm">
        <Link
          href={BILLING_REASSURANCE_TERMS_HREF}
          className="font-medium text-[var(--brand-blue)] underline underline-offset-4 hover:text-blue-700"
        >
          {BILLING_REASSURANCE_TERMS_LABEL}
        </Link>
      </p>
    </aside>
  );
}
