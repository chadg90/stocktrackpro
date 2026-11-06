import Link from 'next/link';
import { ONBOARDING_START_URL } from '@/lib/site';

/** Server-rendered pricing card CTA — always a real href (never "#"). */
export default function PricingTrialCta({ className }: { className?: string }) {
  return (
    <Link
      href={ONBOARDING_START_URL}
      className={
        className ??
        'block w-full py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base text-center shadow-lg shadow-blue-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50'
      }
    >
      Start 14-Day Free Trial
    </Link>
  );
}
