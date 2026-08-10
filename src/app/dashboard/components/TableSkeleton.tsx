'use client';

import React from 'react';

interface TableSkeletonProps {
  /** Number of placeholder rows */
  rows?: number;
  /** Number of columns (cells per row) */
  cols: number;
  /** Optional: use single cell spanning all columns (e.g. for loading message) */
  singleCell?: boolean;
  /**
   * When true, wrap rows in <table><tbody> so this can be used outside a table
   * (e.g. full-page loading state). Default false for use inside existing <tbody>.
   */
  standalone?: boolean;
}

/**
 * Skeleton placeholder for table body while loading.
 * Keeps table layout stable and avoids jump when data loads.
 */
export default function TableSkeleton({
  rows = 5,
  cols,
  singleCell = false,
  standalone = false,
}: TableSkeletonProps) {
  let body: React.ReactNode;

  if (singleCell) {
    body = (
      <tr>
        <td colSpan={cols} className="px-6 py-8">
          <div className="flex items-center justify-center gap-2 text-white/50">
            <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-blue-500/50 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        </td>
      </tr>
    );
  } else {
    body = Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex} className="animate-pulse">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <td key={colIndex} className="px-6 py-4">
            <div className="h-5 rounded bg-white/10 w-full max-w-[180px]" />
          </td>
        ))}
      </tr>
    ));
  }

  if (!standalone) {
    return <>{body}</>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full">
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{body}</tbody>
      </table>
    </div>
  );
}
