'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 25;

export const PAGE_SIZE = DEFAULT_PAGE_SIZE;

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Client-side table pagination: shows "Showing X–Y of Z" and Previous/Next.
 * Hide when totalItems is 0 or when totalItems <= pageSize (single page).
 */
export default function TablePagination({
  currentPage,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  className = '',
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  if (totalItems === 0 || totalItems <= pageSize) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10 text-sm text-white/70 ${className}`}
      role="navigation"
      aria-label="Table pagination"
    >
      <span className="tabular-nums">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="px-2 tabular-nums">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
