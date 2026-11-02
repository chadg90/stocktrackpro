import Image from 'next/image';
import { APP_STORE_URL } from '@/lib/brand';

type AppStoreBadgeProps = {
  className?: string;
  /** Hide the “Android app coming soon” line when the surrounding copy already says it. */
  showAndroidNote?: boolean;
};

export default function AppStoreBadge({
  className = '',
  showAndroidNote = true,
}: AppStoreBadgeProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`.trim()}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
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
        <p className="text-xs text-slate-500 leading-snug">Android app coming soon</p>
      ) : null}
    </div>
  );
}
