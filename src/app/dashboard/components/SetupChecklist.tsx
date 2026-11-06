'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Circle, X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import DriverAppLinks from '@/components/DriverAppLinks';
import Modal from './Modal';

const STORAGE_KEY = 'ftp_setup_checklist_dismissed';

type Props = {
  vehicleCount: number;
  teammateCount: number;
  inspectionCount: number;
  email?: string;
  companyName?: string;
};

export default function SetupChecklist({
  vehicleCount,
  teammateCount,
  inspectionCount,
  email,
  companyName,
}: Props) {
  const [dismissed, setDismissed] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [showCheckPanel, setShowCheckPanel] = useState(false);
  const [appStepDone, setAppStepDone] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (user) => {
      setUid(user?.uid ?? null);
      if (!user) return;
      try {
        setDismissed(window.localStorage.getItem(STORAGE_KEY) === '1');
        setAppStepDone(window.localStorage.getItem(`ftp_setup_app_seen_${user.uid}`) === '1');
      } catch {
        setDismissed(true);
      }
    });
  }, []);

  const markAppSeen = () => {
    if (!uid) return;
    try {
      window.localStorage.setItem(`ftp_setup_app_seen_${uid}`, '1');
    } catch {
      // ignore
    }
    setAppStepDone(true);
  };

  const steps = [
    {
      id: 'vehicle',
      done: vehicleCount > 0,
      label: 'Add a vehicle',
      href: '/dashboard/fleet/',
    },
    {
      id: 'driver',
      done: teammateCount > 1,
      label: 'Invite a driver',
      href: '/dashboard/team/',
    },
    {
      id: 'app',
      done: appStepDone,
      label: 'Get the driver app',
      href: null as string | null,
      onClick: () => {
        markAppSeen();
        setShowCheckPanel(true);
      },
    },
    {
      id: 'check',
      done: inspectionCount > 0,
      label: 'See a daily check',
      href: null as string | null,
      onClick: () => setShowCheckPanel(true),
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
    <>
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
          {steps.map((step) => {
            const content = (
              <>
                {step.done ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-white/30" aria-hidden />
                )}
                <span className={step.done ? 'line-through text-white/45' : ''}>{step.label}</span>
              </>
            );
            const className =
              'flex items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-white/80 hover:bg-white/5 hover:text-white w-full text-left';
            if (step.href) {
              return (
                <li key={step.id}>
                  <Link href={step.href} className={className}>
                    {content}
                  </Link>
                </li>
              );
            }
            return (
              <li key={step.id}>
                <button type="button" onClick={step.onClick} className={className}>
                  {content}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Modal isOpen={showCheckPanel} onClose={() => setShowCheckPanel(false)} title="Daily checks">
        <div className="space-y-4">
          <DriverAppLinks
            variant="dark"
            email={email}
            companyName={companyName}
            showHeading
          />
          <p className="text-sm text-white/60">
            Completed checks also appear as PDFs in{' '}
            <Link
              href="/dashboard/vehicle-documents/"
              className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
              onClick={() => setShowCheckPanel(false)}
            >
              Inspection proofs
            </Link>
            .
          </p>
        </div>
      </Modal>
    </>
  );
}
