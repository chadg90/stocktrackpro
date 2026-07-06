'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';

/** Platform admin only — managers and users cannot access /dashboard/admin routes. */
export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setAllowed(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setAllowed(false);
        router.replace('/dashboard');
        return;
      }

      const snap = await getDoc(doc(firebaseDb!, 'profiles', user.uid));
      const role = snap.exists() ? snap.data().role : null;

      if (role === 'admin') {
        setAllowed(true);
        return;
      }

      setAllowed(false);
      router.replace('/dashboard');
    });

    return () => unsub();
  }, [router]);

  if (allowed === null) {
    return <div className="p-6 text-zinc-600 dark:text-white/60 text-sm">Checking admin access…</div>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
