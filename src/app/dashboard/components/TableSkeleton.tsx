'use client';

import React from 'react';

interface TableSkeletonProps {
  /** Number of placeholder rows */
  rows?: number;
  /** Number of columns (cells per row) */
  cols: number;
  /** Optional: use single cell spanning all columns (e.g. for loading message) */
  singleCell?: boolean;
}

/**
 * Skeleton placeholder for table body while loading.
 * Keeps table layout stable and avoids jump when data loads.
 */
export default function TableSkeleton({ rows = 5, cols, singleCell = false }: TableSkeletonProps) {
  if (singleCell) {
    return (
      <tr>
        <td colSpan={cols} className="px-6 py-8">
          <div className="flex items-center justify-center gap-2 text-white/50">
            <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-primary/50 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-5 rounded bg-white/10 w-full max-w-[180px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
