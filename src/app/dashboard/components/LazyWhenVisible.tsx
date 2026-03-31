'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Prefetch slightly before row enters viewport */
  rootMargin?: string;
  placeholder?: React.ReactNode;
};

/**
 * Renders children only after the wrapper intersects the viewport (Intersection Observer).
 */
export default function LazyWhenVisible({
  children,
  className = '',
  rootMargin = '120px',
  placeholder,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible
        ? children
        : placeholder ?? <div className="w-10 h-10 rounded bg-white/10 animate-pulse" aria-hidden />}
    </div>
  );
}
