'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import DriverAppLinks from '@/components/DriverAppLinks';
import { PLATFORM_AVAILABILITY } from '@/lib/brand';

const storageKeyForUser = (uid: string) => `ftp_driver_app_card_dismissed_${uid}`;

export default function GetDriverAppCard() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | undefined>();
  const [companyName, setCompanyName] = useState<string | undefined>();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) {
        setUid(null);
        setDismissed(true);
        return;
      }
      setUid(user.uid);
      setEmail(user.email || undefined);
      try {
        setDismissed(window.localStorage.getItem(storageKeyForUser(user.uid)) === '1');
      } catch {
        setDismissed(false);
      }
      try {
        const profileSnap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
        const companyId = profileSnap.data()?.company_id;
        if (companyId) {
          const companySnap = await getDoc(doc(firebaseDb, 'companies', companyId));
          setCompanyName(companySnap.data()?.name || undefined);
        }
      } catch {
        // ignore
      }
    });
    return () => unsub();
  }, []);

  if (!uid || dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(storageKeyForUser(uid), '1');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="dashboard-card mb-6 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white">Get the driver app</h2>
          <p className="mt-0.5 text-xs text-white/55">
            Drivers complete daily checks in the mobile app — {PLATFORM_AVAILABILITY}. Share the App Store link or QR
            code with your team.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white shrink-0"
          aria-label="Dismiss get the driver app card"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <DriverAppLinks variant="dark" email={email} companyName={companyName} />
    </div>
  );
}
