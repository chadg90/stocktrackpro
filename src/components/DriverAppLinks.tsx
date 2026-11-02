'use client';

import AppStoreBadge from '@/components/AppStoreBadge';
import { APP_STORE_URL } from '@/lib/brand';
import { androidInviteMailto } from '@/lib/androidInvite';

type DriverAppLinksProps = {
  /** Dashboard uses dark cards; marketing uses light. */
  variant?: 'light' | 'dark';
  email?: string;
  companyName?: string;
  className?: string;
  showHeading?: boolean;
};

export default function DriverAppLinks({
  variant = 'light',
  email,
  companyName,
  className = '',
  showHeading = false,
}: DriverAppLinksProps) {
  const muted = variant === 'dark' ? 'text-white/55' : 'text-slate-500';
  const link = variant === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-[var(--brand-blue)] hover:text-blue-700';
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=8&data=${encodeURIComponent(APP_STORE_URL)}`;

  return (
    <div className={`space-y-3 min-w-0 ${className}`.trim()}>
      {showHeading ? (
        <p className={`text-sm font-medium ${variant === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          Drivers do daily checks in the app. Download it here
        </p>
      ) : null}
      <div className="flex flex-wrap items-start gap-4 min-w-0">
        <div className="space-y-2 min-w-0">
          <AppStoreBadge
            showAndroidNote={false}
            className={variant === 'dark' ? '[&_img]:brightness-110' : ''}
          />
          <p className={`text-xs leading-snug ${muted}`}>
            Android is invite-only — we assist with onboarding.{' '}
            <a href={androidInviteMailto({ email, companyName })} className={`underline underline-offset-2 ${link}`}>
              Request Android invite
            </a>
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-white p-2 border border-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="QR code to download Fleet Track PRO on the App Store"
            width={112}
            height={112}
            className="h-28 w-28"
          />
        </div>
      </div>
    </div>
  );
}
