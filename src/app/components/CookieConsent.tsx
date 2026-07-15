'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-primary/20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-slate-600 text-sm text-center sm:text-left">
          <p>
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
            <Link href="/cookies" className="text-primary hover:text-primary-light underline">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-3 sm:gap-4">
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] text-sm bg-primary hover:bg-primary-light text-white rounded-lg transition-colors"
          >
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
} 