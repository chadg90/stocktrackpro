/**
 * Date utility functions for consistent date formatting across the app
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Safely converts a Timestamp or string to a Date object
 * @param value - Timestamp, string date, or undefined
 * @returns Date object or null if invalid
 */
export function toDate(value?: Timestamp | string | null): Date | null {
  if (!value) return null;
  
  try {
    // Check for Firestore Timestamp (using duck typing for reliability)
    if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    // Handle string dates
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Formats a date value to a localized string
 * @param value - Timestamp, string date, or undefined
 * @param fallback - Fallback string if date is invalid
 * @returns Formatted date string
 */
export function formatDate(value?: Timestamp | string | null, fallback: string = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  
  try {
    return date.toLocaleString();
  } catch {
    return fallback;
  }
}

/**
 * Formats a date value to a short format (e.g., "Jan 15")
 * @param value - Timestamp, string date, or undefined
 * @param fallback - Fallback string if date is invalid
 * @returns Formatted short date string
 */
export function formatShortDate(value?: Timestamp | string | null, fallback: string = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  
  try {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return fallback;
  }
}

/**
 * Formats a date value to just the date (no time)
 * @param value - Timestamp, string date, or undefined
 * @param fallback - Fallback string if date is invalid
 * @returns Formatted date-only string
 */
export function formatDateOnly(value?: Timestamp | string | null, fallback: string = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  
  try {
    return date.toLocaleDateString();
  } catch {
    return fallback;
  }
}

/**
 * Formats a date value to just the time
 * @param value - Timestamp, string date, or undefined
 * @param fallback - Fallback string if date is invalid
 * @returns Formatted time string
 */
export function formatTimeOnly(value?: Timestamp | string | null, fallback: string = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  
  try {
    return date.toLocaleTimeString();
  } catch {
    return fallback;
  }
}

/**
 * Returns a relative time string (e.g., "2 hours ago", "yesterday")
 * @param value - Timestamp, string date, or undefined
 * @param fallback - Fallback string if date is invalid
 * @returns Relative time string
 */
export function formatRelativeTime(value?: Timestamp | string | null, fallback: string = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  
  try {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    if (diffDay === 1) return 'yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) === 1 ? '' : 's'} ago`;
    if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) === 1 ? '' : 's'} ago`;
  } catch {
    return fallback;
  }
}
