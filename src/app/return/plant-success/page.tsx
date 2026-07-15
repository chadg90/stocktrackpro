'use client';

import React, { Suspense } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { CheckCircle, HardHat } from 'lucide-react';

function PlantSuccessContent() {
  return (
    <div className="marketing-shell">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-8">
            <HardHat className="h-12 w-12 text-amber-400" aria-hidden />
          </div>
          <CheckCircle className="h-10 w-10 text-amber-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Plant module active</h1>
          <p className="text-slate-600 mb-8">
            Your subscription is processing. You can register machines and assign plant access to
            inspectors from the dashboard once Stripe confirms payment (usually within a minute).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/plant"
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
            >
              Plant machines
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlantSuccessPage() {
  return (
    <Suspense fallback={<div className="marketing-shell" />}>
      <PlantSuccessContent />
    </Suspense>
  );
}
