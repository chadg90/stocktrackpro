'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  INTERACTIVE_DEMO_START_ID,
  INTERACTIVE_DEMO_STEPS,
  type DemoStep,
} from '@/content/interactiveDemo';

type Props = {
  className?: string;
};

function stepById(id: string): DemoStep | undefined {
  return INTERACTIVE_DEMO_STEPS.find((s) => s.id === id);
}

const demoCtaClass =
  'rounded-xl bg-[var(--brand-blue)] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] ring-2 ring-amber-400 ring-offset-1 transition-[transform,background-color,box-shadow] duration-150 hover:bg-[var(--brand-blue-hover)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.5)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

const demoPhoneShellClass =
  'relative h-full w-full rounded-[2.35rem] bg-slate-900 shadow-[0_36px_72px_-20px_rgba(15,23,42,0.62),0_16px_32px_-12px_rgba(15,23,42,0.45),0_4px_10px_-2px_rgba(15,23,42,0.25)] ring-1 ring-slate-800/80';

const DEMO_IMAGE_SOURCES = [
  ...new Set(INTERACTIVE_DEMO_STEPS.map((demoStep) => demoStep.imageSrc)),
];

/** Covers screenshot status bars so every demo step shows the same time and icons. */
function DemoPhoneStatusBar() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[18] h-[5.5%] bg-[var(--demo-app-bg)]"
      aria-hidden
    >
      <div className="flex h-full items-end justify-between px-[7.5%] pb-[5%] text-[11px] font-semibold leading-none text-slate-900">
        <span className="tracking-tight">07:00</span>
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 18 12" className="h-[11px] w-[16px]" aria-hidden>
            <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="0.5" fill="currentColor" />
            <rect x="10" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
            <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
          </svg>
          <svg viewBox="0 0 16 12" className="h-[11px] w-[14px]" aria-hidden>
            <path
              d="M8 2.2c2.2 0 4.2.9 5.7 2.3l1.4-1.4C13.2 1.3 10.8.2 8 .2S2.8 1.3 1 2.9l1.4 1.4C3.8 3.1 5.8 2.2 8 2.2zm0 3c1.3 0 2.5.5 3.4 1.4l1.4-1.4C11.2 4.2 9.7 3.6 8 3.6s-3.2.6-4.8 1.8l1.4 1.4c.9-.9 2.1-1.4 3.4-1.4zm0 3c.7 0 1.3.3 1.8.7L8 11.8 6.2 9.7c.5-.4 1.1-.7 1.8-.7z"
              fill="currentColor"
            />
          </svg>
          <svg viewBox="0 0 27 13" className="h-[12px] w-[26px]" aria-hidden>
            <rect
              x="0.75"
              y="1.25"
              width="21"
              height="10.5"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
            <rect x="23.25" y="4.5" width="2.5" height="4" rx="1" fill="currentColor" />
            <rect x="2.5" y="3.25" width="16" height="6.5" rx="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function InteractiveAppDemo({ className = '' }: Props) {
  const [stepId, setStepId] = useState(INTERACTIVE_DEMO_START_ID);
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [guideDone, setGuideDone] = useState(false);
  const [pulse, setPulse] = useState(true);

  const step = useMemo(() => stepById(stepId) ?? INTERACTIVE_DEMO_STEPS[0], [stepId]);
  const showGuide = Boolean(step.guide) && !guideDone;
  const showCallout = Boolean(step.callout) && !guideDone;
  const showHotspots = !showGuide && !showCallout;
  const calloutLayout = useMemo(() => {
    if (!step.callout) return null;
    const { ring, detail, continueBelow: forceContinueBelow, continueAboveRing: forceContinueAboveRing } =
      step.callout;
    const ringBottom = ring.top + ring.height;
    const noteOffset = detail ? 8 : 3;
    const continueHeight = 9;
    const continueGap = 3;
    const maxBottom = 95;
    const continueBelow = forceContinueBelow
      ? ringBottom + 2
      : ringBottom + 2 + continueGap;
    const needsContinueAbove =
      !forceContinueBelow &&
      !forceContinueAboveRing &&
      continueBelow + continueHeight > maxBottom;

    let continueTop: number;
    let noteTop: number;

    if (needsContinueAbove) {
      continueTop = 7;
      // Place the label just inside the top of the ring when Continue moves up.
      noteTop = ring.top + 1.5;
    } else {
      noteTop = ring.top - noteOffset;
      continueTop = continueBelow;
    }

    if (forceContinueBelow) {
      noteTop = ring.top - noteOffset;
      continueTop = continueBelow;
    } else if (forceContinueAboveRing) {
      continueTop = ring.top - continueHeight - 2;
      noteTop = ring.top;
    } else {
      continueTop = Math.min(continueTop, maxBottom - continueHeight);
    }
    noteTop = Math.max(5, noteTop);

    return {
      noteTop,
      continueTop,
      needsContinueAbove: needsContinueAbove || forceContinueAboveRing,
      noteOnRingEdge: forceContinueAboveRing,
    };
  }, [step.callout]);

  const goToStep = useCallback((id: string) => {
    setStepId((current) => {
      if (id !== current) {
        setStepHistory((history) => [...history, current]);
      }
      return id;
    });
    setGuideDone(false);
    setPulse(true);
  }, []);

  const goBack = useCallback(() => {
    setStepHistory((history) => {
      if (history.length === 0) return history;
      const previous = history[history.length - 1];
      setStepId(previous);
      setGuideDone(false);
      setPulse(true);
      return history.slice(0, -1);
    });
  }, []);

  const onHotspot = useCallback(
    (nextStepId: string | null) => {
      if (!nextStepId) {
        setPulse(false);
        window.setTimeout(() => setPulse(true), 400);
        return;
      }
      const next = stepById(nextStepId);
      if (!next) return;
      goToStep(next.id);
    },
    [goToStep]
  );

  const restart = useCallback(() => {
    setStepHistory([]);
    setStepId(INTERACTIVE_DEMO_START_ID);
    setGuideDone(false);
    setPulse(true);
  }, []);

  const canBack = stepHistory.length > 0 && stepId !== INTERACTIVE_DEMO_START_ID;
  const canRestart = stepId !== INTERACTIVE_DEMO_START_ID || guideDone;

  useEffect(() => {
    DEMO_IMAGE_SOURCES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative w-full px-2 pb-5 pt-1 sm:px-3 flex justify-center">
        <div
          className="relative w-[min(100%,260px)] sm:w-[280px] lg:w-[300px] aspect-[471/1024] shrink-0"
          role="region"
          aria-label={`Interactive app demo — ${step.title}`}
        >
        {/* Phone shell */}
        <div className={demoPhoneShellClass}>
          <div className="absolute inset-[7px] overflow-hidden rounded-[1.95rem] bg-[var(--demo-app-bg)]">
            {/* Dynamic Island */}
            <div
              className="pointer-events-none absolute left-1/2 top-[11px] z-[25] h-[22px] w-[82px] -translate-x-1/2 rounded-full bg-black"
              aria-hidden
            />

            <div className="relative h-full w-full">
              {DEMO_IMAGE_SOURCES.map((src) => {
                const isActive = step.imageSrc === src;
                return (
                  <Image
                    key={src}
                    src={src}
                    alt={isActive ? step.imageAlt : ''}
                    aria-hidden={!isActive}
                    fill
                    sizes="(max-width: 640px) 280px, 300px"
                    priority={src === DEMO_IMAGE_SOURCES[0]}
                    className={`object-cover object-top transition-opacity duration-150 ease-out ${
                      isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0'
                    }`}
                  />
                );
              })}
              <DemoPhoneStatusBar />

              {showGuide && step.guide ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/45 px-3.5">
                  <div className="w-full max-w-[92%] rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-slate-200">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]">
                      {step.guide.title}
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {step.guide.items.map((item) => (
                        <li key={item.label} className="text-left">
                          <p className="text-[13px] font-bold text-slate-900">{item.label}</p>
                          <p className="text-[12px] leading-snug text-slate-600">{item.detail}</p>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setGuideDone(true);
                        setPulse(true);
                      }}
                      className={`mt-3.5 w-full px-3 py-2.5 text-[13px] ${demoCtaClass}`}
                      aria-label={`${step.guide.continueLabel} — continue the demo`}
                    >
                      {step.guide.continueLabel}
                      <span className="ml-1.5 opacity-90" aria-hidden>
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ) : showCallout && step.callout ? (
                <>
                  <div
                    className="pointer-events-none absolute z-20 rounded-xl bg-amber-300/10 ring-2 ring-amber-400 animate-pulse"
                    style={{
                      left: `${step.callout.ring.left}%`,
                      top: `${step.callout.ring.top}%`,
                      width: `${step.callout.ring.width}%`,
                      height: `${step.callout.ring.height}%`,
                    }}
                    aria-hidden
                  />
                  <div
                    className={`pointer-events-none absolute z-30 left-1/2 max-w-[88%] -translate-x-1/2 text-center ${
                      calloutLayout!.needsContinueAbove ? 'px-2' : ''
                    } ${calloutLayout!.noteOnRingEdge ? '-translate-y-1/2' : ''}`}
                    style={{ top: `${calloutLayout!.noteTop}%` }}
                  >
                    <p className="whitespace-nowrap rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
                      {step.callout.note}
                    </p>
                    {step.callout.detail ? (
                      <p className="mx-auto mt-2 max-w-[240px] rounded-lg bg-white px-3 py-2 text-[12px] font-semibold leading-snug text-slate-900 shadow-md ring-1 ring-slate-200">
                        {step.callout.detail}
                      </p>
                    ) : null}
                  </div>
                  {step.callout.continueHref && !step.callout.nextStepId ? (
                    <Link
                      href={step.callout.continueHref}
                      className={`absolute z-30 left-1/2 w-[84%] -translate-x-1/2 px-3 py-2 text-center text-[12px] ${demoCtaClass}`}
                      style={{ top: `${calloutLayout!.continueTop}%` }}
                      aria-label={`${step.callout.continueLabel} — start your free trial`}
                    >
                      {step.callout.continueLabel}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (step.callout!.nextStepId) {
                          goToStep(step.callout!.nextStepId);
                        } else {
                          setGuideDone(true);
                          setPulse(true);
                        }
                      }}
                      className={`absolute z-30 left-1/2 w-[84%] -translate-x-1/2 px-3 py-2 text-[12px] ${demoCtaClass}`}
                      style={{ top: `${calloutLayout!.continueTop}%` }}
                      aria-label={`${step.callout.continueLabel} — continue the demo`}
                    >
                      {step.callout.continueLabel}
                      {!step.callout.continueHref ? (
                        <span className="ml-1 opacity-90" aria-hidden>
                          →
                        </span>
                      ) : null}
                    </button>
                  )}
                </>
              ) : showHotspots ? (
                step.hotspots.map((spot) => {
                  const waiting = !spot.nextStepId;
                  const hintAbove =
                    spot.top > 72 || spot.top + spot.height > 78;
                  const isWideButton = spot.width > 60;
                  const cornerClass = isWideButton ? 'rounded-full' : 'rounded-xl';
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => onHotspot(spot.nextStepId)}
                      className={`absolute z-10 ${cornerClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2`}
                      style={{
                        left: `${spot.left}%`,
                        top: `${spot.top}%`,
                        width: `${spot.width}%`,
                        height: `${spot.height}%`,
                      }}
                      aria-label={
                        waiting
                          ? `${spot.label} — next screen coming soon`
                          : `Tap ${spot.label} to continue the demo`
                      }
                    >
                      <span
                        className={`absolute inset-0 ${cornerClass} ring-2 ring-amber-400 bg-amber-300/15 ${
                          pulse ? 'animate-pulse' : ''
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold tracking-wide text-slate-900 shadow-md ${
                          hintAbove
                            ? 'bottom-[calc(100%+8px)]'
                            : 'top-[calc(100%+8px)]'
                        }`}
                      >
                        {waiting ? 'Next screen soon' : spot.hint}
                        <span
                          className={`absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-x-transparent ${
                            hintAbove
                              ? 'top-full border-t-[6px] border-t-amber-400'
                              : 'bottom-full border-b-[6px] border-b-amber-400'
                          }`}
                          aria-hidden
                        />
                      </span>
                    </button>
                  );
                })
              ) : null}
            </div>
          </div>
        </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Interactive demo · {step.title}
        {canBack ? (
          <>
            {' · '}
            <button
              type="button"
              onClick={goBack}
              className="font-medium text-[var(--brand-blue)] hover:underline"
            >
              Back
            </button>
          </>
        ) : null}
        {canRestart ? (
          <>
            {' · '}
            <button
              type="button"
              onClick={restart}
              className="font-medium text-[var(--brand-blue)] hover:underline"
            >
              Restart
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
