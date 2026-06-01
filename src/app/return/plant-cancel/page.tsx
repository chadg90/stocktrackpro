'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function PlantCancelPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Checkout cancelled</h1>
          <p className="text-white/70 mb-8">
            No charge was made. You can subscribe to the Plant &amp; Machinery module anytime from
            the pricing page.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
