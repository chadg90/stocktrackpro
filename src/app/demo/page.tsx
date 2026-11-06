import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import InteractiveAppDemo from '@/components/InteractiveAppDemo';
import { absolutePageUrl, canonicalPath } from '@/lib/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  // Root title template appends "| Fleet Track PRO" once.
  title: 'App demo preview',
  description: 'Preview the interactive Fleet Track PRO app demo while we build it screen by screen.',
  robots: { index: false, follow: false },
  alternates: { canonical: canonicalPath('/demo') },
  openGraph: {
    url: absolutePageUrl('/demo'),
  },
};

export default function DemoPreviewPage() {
  return (
    <div className="marketing-shell min-h-screen bg-[var(--mkt-bg)]">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 pb-16 pt-24 sm:pt-28">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue)]">
          Preview
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Interactive app demo
        </h1>
        <p className="mt-3 max-w-xl text-slate-600 leading-relaxed">
          Building this screen by screen. Homepage video stays until the flow is ready to replace it.
        </p>

        <div className="mt-10 flex justify-center">
          <InteractiveAppDemo />
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/" className="font-medium text-[var(--brand-blue)] hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
