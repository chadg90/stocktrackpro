/**
 * Custom hooks for debouncing values and callbacks
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounces a value - returns the value after the specified delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Creates a debounced callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns A debounced version of the callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * Hook for debounced search input
 * @param initialValue - Initial search value
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Object with value, debouncedValue, and onChange handler
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 300) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, delay);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const clear = useCallback(() => {
    setValue('');
  }, []);

  return {
    value,
    debouncedValue,
    onChange,
    clear,
    setValue,
  };
}

export default useDebounce;
