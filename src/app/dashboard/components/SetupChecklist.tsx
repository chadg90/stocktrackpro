'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Circle, X } from 'lucide-react';

const STORAGE_KEY = 'ftp_setup_checklist_dismissed';

type Props = {
  vehicleCount: number;
  teammateCount: number;
  inspectionCount: number;
};

export default function SetupChecklist({ vehicleCount, teammateCount, inspectionCount }: Props) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setDismissed(true);
    }
  }, []);

  const steps = [
    {
      id: 'vehicle',
      done: vehicleCount > 0,
      label: 'Add a vehicle',
      href: '/dashboard/fleet',
    },
    {
      id: 'driver',
      done: teammateCount > 1,
      label: 'Invite a driver',
      href: '/dashboard/team',
    },
    {
      id: 'check',
      done: inspectionCount > 0,
      label: 'See a daily check',
      href: '/dashboard/inspection-proof',
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="dashboard-card mb-6 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Get set up</h2>
          <p className="mt-0.5 text-xs text-white/55">
            {allDone ? 'You are ready to use the dashboard.' : `${doneCount} of ${steps.length} complete`}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss setup checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-white/80 hover:bg-white/5 hover:text-white"
            >
              {step.done ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-white/30" aria-hidden />
              )}
              <span className={step.done ? 'line-through text-white/45' : ''}>{step.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
