'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { CheckCircle, ExternalLink } from 'lucide-react';

const APP_SCHEME = process.env.NEXT_PUBLIC_APP_SCHEME || 'myapp';
const APP_SUCCESS_PATH = `${APP_SCHEME}://subscription-success`;

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-8">
            <CheckCircle className="h-12 w-12 text-primary" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Thank you</h1>
          <p className="text-xl text-white/90 mb-2">Your subscription is active.</p>
          <p className="text-white/70 mb-8">
            You can use the dashboard and app with your new plan. If you paid on the web, you’re all set here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-black font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            >
              Go to Dashboard
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary/40 text-white hover:bg-primary/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            >
              View pricing
            </Link>
          </div>

          {sessionId && (
            <div className="mt-12 p-4 bg-white/5 border border-primary/20 rounded-xl text-left">
              <p className="text-sm text-white/60 mb-2">Opening the app?</p>
              <a
                href={APP_SUCCESS_PATH}
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                Open in app
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-28 flex justify-center text-white/60">Loading…</div>}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
