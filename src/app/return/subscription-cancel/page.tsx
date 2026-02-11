'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const APP_SCHEME = process.env.NEXT_PUBLIC_APP_SCHEME || 'myapp';
const APP_CANCEL_PATH = `${APP_SCHEME}://subscription-cancel`;

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Checkout cancelled</h1>
          <p className="text-white/80 mb-8">
            You didn’t complete the subscription. You can try again anytime from the pricing page.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-black font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            >
              Back to pricing
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary/40 text-white hover:bg-primary/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
            >
              Dashboard
            </Link>
          </div>

          <div className="mt-12 p-4 bg-white/5 border border-primary/20 rounded-xl text-left">
            <p className="text-sm text-white/60 mb-2">Return to the app?</p>
            <a
              href={APP_CANCEL_PATH}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Open in app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
