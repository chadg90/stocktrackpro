'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import {
  DASHBOARD_PAGE_GUIDES,
  type DashboardGuidePageId,
} from '@/content/dashboardPageGuides';

type Rect = { top: number; left: number; width: number; height: number };

function measureTarget(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!(el instanceof HTMLElement)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function PageGuideOverlay({
  pageId,
  onClose,
}: {
  pageId: DashboardGuidePageId;
  onClose: () => void;
}) {
  const steps = DASHBOARD_PAGE_GUIDES[pageId] ?? [];
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = steps[index];
  const isLast = index >= steps.length - 1;

  const syncRect = useCallback(() => {
    if (!step) {
      setRect(null);
      return;
    }
    setRect(measureTarget(step.target));
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    syncRect();
  }, [step, syncRect]);

  useEffect(() => {
    const onReposition = () => syncRect();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [syncRect]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        if (isLast) onClose();
        else setIndex((i) => i + 1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLast, onClose]);

  if (!step) return null;

  const pad = 8;
  const tooltipTop = rect ? Math.min(rect.top + rect.height + 12, window.innerHeight - 220) : window.innerHeight / 2 - 80;
  const tooltipLeft = rect
    ? Math.min(Math.max(16, rect.left), window.innerWidth - 360)
    : Math.max(16, window.innerWidth / 2 - 170);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="page-guide-title">
      <div className={`absolute inset-0 ${rect ? 'bg-transparent' : 'bg-slate-950/55'}`} onClick={onClose} />
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.55)',
          }}
        />
      )}
      <div
        className="absolute z-[81] w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
        style={{ top: Math.max(16, tooltipTop), left: tooltipLeft }}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <p id="page-guide-title" className="text-sm font-semibold text-slate-900">
            {step.title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close page guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {index + 1} of {steps.length}
          </p>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) onClose();
                else setIndex((i) => i + 1);
              }}
              className="rounded-lg bg-[var(--brand-blue)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageGuideButton({ pageId }: { pageId: DashboardGuidePageId }) {
  const [open, setOpen] = useState(false);
  const steps = DASHBOARD_PAGE_GUIDES[pageId];
  if (!steps?.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/20 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/5 dark:hover:text-white"
        aria-haspopup="dialog"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden />
        Page guide
      </button>
      {open && <PageGuideOverlay pageId={pageId} onClose={() => setOpen(false)} />}
    </>
  );
}
