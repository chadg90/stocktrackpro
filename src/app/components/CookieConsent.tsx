'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookieConsent';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    try {
      const hasAcknowledged = localStorage.getItem(CONSENT_KEY);
      if (!hasAcknowledged) {
        setShowConsent(true);
        document.documentElement.dataset.cookieBanner = '1';
      }
    } catch {
      // Private mode / blocked storage — fail closed (no banner loop)
      setShowConsent(false);
    }
    return () => {
      delete document.documentElement.dataset.cookieBanner;
    };
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'acknowledged');
    } catch {
      // Ignore storage failures
    }
    setShowConsent(false);
    delete document.documentElement.dataset.cookieBanner;
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--mkt-border)] bg-white p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-3">
        <p className="text-slate-600 text-xs sm:text-sm text-left leading-snug min-w-0">
          Essential cookies keep this site secure. Marketing pages use privacy-friendly analytics.{' '}
          <Link
            href="/cookies"
            className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2 whitespace-nowrap"
          >
            Cookie Policy
          </Link>
        </p>
        <button
          type="button"
          onClick={acknowledge}
          className="shrink-0 px-4 py-2.5 min-h-[44px] text-sm font-medium text-white rounded-lg bg-[var(--brand-blue)] hover:bg-blue-600 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
