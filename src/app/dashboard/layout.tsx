'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import Sidebar from './components/Sidebar';
import { useRouter, usePathname } from 'next/navigation';

type Profile = {
  company_id?: string;
  role?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side and if firebase is initialized
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(firebaseDb!, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        
        if (snap.exists()) {
          const data = snap.data() as Profile;
          // Check if user is manager or admin
          if (data.role === 'manager' || data.role === 'admin') {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authorized) {
    // If not authorized, show the sign-in form (which is on the main dashboard page)
    // But if we are on a sub-route, we should redirect to the main dashboard page to sign in
    // However, for simplicity, we'll let the child pages handle the "not authorized" state 
    // or just render the children which will likely show the login form if it's the main page.
    
    // Actually, simpler approach: The main dashboard page handles login. 
    // Sub-pages should probably redirect to /dashboard if not authorized.
    if (pathname !== '/dashboard') {
       // Ideally redirect to /dashboard, but let's render children for now as they might handle it
       // or we can render a simple "Access Denied" or "Please Login" message
       return (
         <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
           <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
           <p className="mb-6 text-white/70">Please sign in to access the dashboard.</p>
           <button 
             onClick={() => router.push('/dashboard')}
             className="px-4 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary-light"
           >
             Go to Login
           </button>
         </div>
       );
    }
    // If on /dashboard, let the page render the login form
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
