'use client';

import React from 'react';

/**
 * Hides numeric KPI zeros / empty flashes while the first data load is in progress.
 * Shows a grey pulse placeholder instead.
 */
export default function KpiValue({
  ready,
  children,
  className = 'dashboard-kpi-value',
  placeholderClassName = 'h-8 w-14',
}: {
  ready: boolean;
  children: React.ReactNode;
  className?: string;
  placeholderClassName?: string;
}) {
  if (!ready) {
    return (
      <span
        className={`inline-block rounded-md bg-zinc-200/90 dark:bg-white/10 animate-pulse ${placeholderClassName}`}
        aria-hidden
      />
    );
  }
  return <p className={className}>{children}</p>;
}

export function SoftSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 text-sm text-zinc-500 dark:text-white/55"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-white/20 dark:border-t-white/70 animate-spin"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}
