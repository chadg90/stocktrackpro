import Image from 'next/image';
import { APP_STORE_URL, SUPPORT_EMAIL } from '@/lib/brand';
import { androidInviteMailto } from '@/lib/androidInvite';

type AppStoreBadgeProps = {
  className?: string;
  /** Hide the Android note when surrounding copy already covers it. */
  showAndroidNote?: boolean;
  /** Optional note text colour (e.g. hero on dark). */
  noteClassName?: string;
  /** GA4 click_app_store location (no personal data). */
  analyticsLocation?: string;
};

export default function AppStoreBadge({
  className = '',
  showAndroidNote = true,
  noteClassName = 'text-xs text-slate-500 leading-snug',
  analyticsLocation = 'unknown',
}: AppStoreBadgeProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`.trim()}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-location={analyticsLocation}
        className="inline-flex shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2 rounded"
      >
        <Image
          src="/badges/app-store-black.svg"
          alt="Download Fleet Track PRO on the App Store"
          width={120}
          height={40}
          className="h-10 w-auto"
          unoptimized
        />
      </a>
      {showAndroidNote ? (
        <p className={noteClassName}>
          Android? Email{' '}
          <a href={androidInviteMailto()} className="underline underline-offset-2 hover:opacity-90">
            {SUPPORT_EMAIL}
          </a>{' '}
          and we&apos;ll send you an invite.
        </p>
      ) : null}
    </div>
  );
}
