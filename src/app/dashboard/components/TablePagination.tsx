'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 25;

export const PAGE_SIZE = DEFAULT_PAGE_SIZE;

interface TablePaginationProps {
  currentPage: number;
  /** Total rows when using default (count) mode */
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  /**
   * default: classic client-side pagination with known total.
   * cursor: Firestore-style pages; total unknown — uses hasNextPage / hasPrevPage.
   */
  variant?: 'default' | 'cursor';
  /** cursor mode: rows rendered on this page (after any local filter) */
  itemsOnCurrentPage?: number;
  hasNextPage?: boolean;
}

/**
 * Client-side table pagination, or cursor-based pagination when variant="cursor".
 */
export default function TablePagination({
  currentPage,
  totalItems = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  className = '',
  variant = 'default',
  itemsOnCurrentPage = 0,
  hasNextPage = false,
}: TablePaginationProps) {
  if (variant === 'cursor') {
    const canPrev = currentPage > 1;
    const canNext = Boolean(hasNextPage);
    if (currentPage === 1 && !canNext && itemsOnCurrentPage === 0) {
      return null;
    }
    if (currentPage === 1 && !canNext && itemsOnCurrentPage > 0 && itemsOnCurrentPage <= pageSize) {
      return null;
    }

    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10 text-sm text-white/70 ${className}`}
        role="navigation"
        aria-label="Table pagination"
      >
        <span className="tabular-nums">
          Page {currentPage}
          {itemsOnCurrentPage > 0 ? ` · ${itemsOnCurrentPage} row${itemsOnCurrentPage === 1 ? '' : 's'} on this page` : ''}
          {hasNextPage ? ' · more available' : ''}
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
