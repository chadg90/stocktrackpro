'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { getCachedProfileRole, setCachedProfileRole } from '@/lib/sessionRoleCache';

type Access = 'loading' | 'allowed' | 'denied' | 'signed_out';

/**
 * Platform admin only — managers and ordinary users cannot access
 * /dashboard/admin routes (including Companies under this tree).
 * Role is cached for the browser session so revisits skip the flash;
 * Firestore is still checked every time and non-admins are blocked.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [access, setAccess] = useState<Access>(() => {
    if (typeof window === 'undefined' || !firebaseAuth?.currentUser) return 'loading';
    const cached = getCachedProfileRole(firebaseAuth.currentUser.uid);
    return cached === 'admin' ? 'allowed' : 'loading';
  });

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setAccess('denied');
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setAccess('signed_out');
        router.replace('/dashboard/');
        return;
      }

      const cached = getCachedProfileRole(user.uid);
      if (cached === 'admin') {
        setAccess('allowed');
      }

      const snap = await getDoc(doc(firebaseDb!, 'profiles', user.uid));
      const role = snap.exists() ? String(snap.data().role || '') : '';
      if (role) setCachedProfileRole(user.uid, role);

      if (role === 'admin') {
        setAccess('allowed');
        return;
      }

      setAccess('denied');
    });

    return () => unsub();
  }, [router]);

  if (access === 'loading' || access === 'signed_out') {
    return (
      <div className="p-6 text-zinc-600 dark:text-white/60 text-sm">Checking admin access…</div>
    );
  }

  if (access === 'denied') {
    notFound();
  }

  return <>{children}</>;
}
