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
      }
    } catch {
      // Private mode / blocked storage — fail closed (no banner loop)
      setShowConsent(false);
    }
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'acknowledged');
    } catch {
      // Ignore storage failures
    }
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-slate-600 text-sm text-center sm:text-left">
          <p>
            We use essential cookies and local storage to run this site and keep the dashboard secure. We do not
            currently use advertising or analytics cookies.{' '}
            <Link
              href="/cookies"
              className="text-[var(--brand-blue)] hover:text-blue-700 underline underline-offset-2"
            >
              Cookie Policy
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={acknowledge}
          className="w-full sm:w-auto px-5 py-3 min-h-[44px] text-sm font-medium text-white rounded-lg bg-[var(--brand-blue)] hover:bg-blue-600 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
