'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, differenceInDays } from 'date-fns';
import { activityHistoryStartFromDashboardRange, INSPECTION_ANALYTICS_CAP, DEFECT_ANALYTICS_CAP } from '@/lib/dvsaRetention';
import { buildMileageAttentionRows } from '@/lib/fleetReportLogic';
import ExportButton from './components/ExportButton';
import { exportFleetHealthReportPDF } from '@/lib/fleetHealthReportPdf';
import {
  RefreshCw,
  Truck,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
  Eye,
  EyeOff,
} from 'lucide-react';

function mapSignInError(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Sign-in failed';
  const code = msg.match(/auth\/([a-z0-9-]+)/i)?.[1];
  switch (code) {
    case 'invalid-credential':
    case 'wrong-password':
    case 'user-not-found':
    case 'invalid-login-credentials':
      return 'Incorrect email or password. Please try again.';
    case 'too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'invalid-email':
      return 'Please enter a valid email address.';
    case 'network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'user-disabled':
      return 'This account has been disabled. Contact your administrator.';
    default:
      return msg.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^)]+\)\.?/i, '').trim() || 'Sign-in failed';
  }
}

const DashboardAnalyticsCharts = dynamic(
  () => import('./components/DashboardAnalyticsCharts'),
  {
    ssr: false,
    loading: () => (
      <div className="mb-8 space-y-6" aria-busy="true">
        <div className="h-10 w-48 rounded-lg bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          <div className="h-80 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
      </div>
    ),
  }
);

// Check if Firebase is properly initialized
const isFirebaseAvailable = firebaseAuth && firebaseDb;
const DASHBOARD_REFRESH_COOLDOWN_MS = 8000;

type Profile = {
  id: string;
  company_id?: string;
  company_name?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  displayName?: string;
  name?: string;
  email?: string;
  created_at?: Timestamp | string;
  last_login?: Timestamp | string;
};

type Vehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  notes?: string;
  status?: string;
  mot_expiry_date?: Timestamp | string;
  tax_expiry_date?: Timestamp | string;
  created_at?: Timestamp | string;
  updated_at?: Timestamp | string;
};

type Inspection = {
  id: string;
  vehicle_id?: string;
  inspected_at?: Timestamp | string;
  has_defect?: boolean;
  inspected_by?: string;
  mileage?: number;
  notes?: string;
};

type Defect = {
  id: string;
  vehicle_id?: string;
  reported_by?: string;
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
  resolved_by?: string;
  resolution_notes?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  status?: 'pending' | 'resolved' | 'investigating';
};

const formatDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    if (value && typeof value === 'object' && 'toDate' in value) {
      return value.toDate().toLocaleString();
    }
    return new Date(value as string).toLocaleString();
  } catch {
    return typeof value === 'string' ? value : '—';
  }
};

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Date range filter (supports up to 24 months of history)
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | '365' | '730' | 'all'>('30');

  // Analytics data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  // Counts
  const [vehiclesCount, setVehiclesCount] = useState<number | null>(null);
  const [inspectionsCount, setInspectionsCount] = useState<number | null>(null);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState<number | null>(null);
  const [defectsCount, setDefectsCount] = useState<number | null>(null);
  const [resolvedDefectsCount, setResolvedDefectsCount] = useState<number | null>(null);
  
  // Company subscription info
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const lastManualRefreshAtRef = useRef(0);
  const staticDataCompanyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirebaseAvailable) {
      setError('Firebase configuration is not available. Please check your environment variables.');
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth!, (user) => {
      setAuthUser(user);
      if (!user) {
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const loadProfile = useCallback(
    async (user: User) => {
      if (!isFirebaseAvailable) {
        throw new Error('Firebase is not configured properly');
      }
      const profileRef = doc(firebaseDb!, 'profiles', user.uid);
      const snap = await getDoc(profileRef);
      if (!snap.exists()) {
        throw new Error('Profile not found for this account.');
      }
      const data = snap.data() as Profile;
      if (data.role !== 'manager' && data.role !== 'admin') {
        throw new Error('Access restricted. Only managers and authorised staff can access the dashboard.');
      }
      // Ensure Auth custom claims (companyId / subscriptionStatus) are on the token
      // after onboarding or claims-sync — needed for some Firestore vehicle rules.
      if (data.company_id) {
        try {
          await user.getIdToken(true);
        } catch {
          // Non-fatal; security rules also allow profile/company fallback.
        }
      }
      setProfile(data);
      return data;
    },
    []
  );

  const safeCount = async (refQuery: ReturnType<typeof query>) => {
    if (!isFirebaseAvailable) return null;
    try {
      const countSnap = await getCountFromServer(refQuery);
      return countSnap.data().count;
    } catch {
      return null;
    }
  };

  const fetchData = useCallback(
    async (companyId: string, options?: { forceStaticReload?: boolean }) => {
      if (!isFirebaseAvailable) {
        setError('Firebase is not configured properly');
        return;
      }
      
      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const rangeStart = activityHistoryStartFromDashboardRange(dateRange);

        const vehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId));
        const teamQ = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
        const activeVehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId), where('status', '==', 'active'));

        const [vehiclesCountVal, activeVehiclesCountVal] = await Promise.all([
          safeCount(vehiclesQ),
          safeCount(activeVehiclesQ),
        ]);

        setVehiclesCount(vehiclesCountVal);
        setActiveVehiclesCount(activeVehiclesCountVal);

        // Fetch company subscription status
        try {
          const companySnap = await getDoc(doc(firebaseDb!, 'companies', companyId));
          if (companySnap.exists()) {
            const companyData = companySnap.data();
            setSubscriptionStatus(companyData.subscription_status || null);
          }
        } catch (err) {
          console.error('Error fetching company subscription:', err);
        }

        const shouldReloadStatic =
          options?.forceStaticReload || staticDataCompanyRef.current !== companyId;
        if (shouldReloadStatic) {
          // Static datasets do not depend on date range, so avoid re-reading them on every range change.
          const [vehiclesSnap, usersSnap] = await Promise.all([
            getDocs(vehiclesQ),
            getDocs(teamQ),
          ]);
          setVehicles(vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));
          setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile)));
          staticDataCompanyRef.current = companyId;
        }

        // Fetch inspections (always bounded by DVSA-style window + selected range + hard cap)
        const inspQuery = query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', Timestamp.fromDate(rangeStart)),
          orderBy('inspected_at', 'desc'),
          limit(INSPECTION_ANALYTICS_CAP)
        );
        const inspSnap = await getDocs(inspQuery);
        const inspectionsData = inspSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
        // Cap protects cost; analytics/export use this bounded recent set
        setInspections(inspectionsData);
        setInspectionsCount(inspectionsData.length);

        const defQuery = query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', companyId),
          where('reported_at', '>=', Timestamp.fromDate(rangeStart)),
          orderBy('reported_at', 'desc'),
          limit(DEFECT_ANALYTICS_CAP)
        );
        const defSnap = await getDocs(defQuery);
        const defectsData = defSnap.docs.map(d => ({ id: d.id, ...d.data() } as Defect));
        setDefects(defectsData);
        setDefectsCount(defectsData.length);
        setResolvedDefectsCount(defectsData.filter((d) => d.status === 'resolved').length);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load data');
      } finally {
        setLoading(false);
      }
    },
    [dateRange]
  );

  const handleManualRefresh = useCallback(() => {
    if (!profile?.company_id || loading) return;
    const now = Date.now();
    if (now - lastManualRefreshAtRef.current < DASHBOARD_REFRESH_COOLDOWN_MS) {
      const wait = Math.ceil(
        (DASHBOARD_REFRESH_COOLDOWN_MS - (now - lastManualRefreshAtRef.current)) / 1000
      );
      alert(`Please wait ${wait}s before refreshing again.`);
      return;
    }
    lastManualRefreshAtRef.current = now;
    fetchData(profile.company_id, { forceStaticReload: true });
  }, [profile?.company_id, loading, fetchData]);

  useEffect(() => {
    if (!authUser) return;

    let isMounted = true;

    loadProfile(authUser).catch((err) => {
      if (isMounted) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [authUser, loadProfile]);

  useEffect(() => {
    const id = profile?.company_id?.trim();
    if (!id) return;
    fetchData(id);
  }, [profile?.company_id, dateRange, fetchData]);

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter your account email above, then tap Forgot password.');
      return;
    }
    if (!isFirebaseAvailable || !firebaseAuth) {
      setError('Firebase is not configured properly');
      return;
    }
    setResetBusy(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, trimmed);
      setResetMessage('If an account exists for that email, a password reset link has been sent.');
    } catch (err: unknown) {
      // Avoid account enumeration — same message for most failures.
      const code =
        typeof err === 'object' && err !== null && 'code' in err && typeof (err as { code: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setResetMessage('If an account exists for that email, a password reset link has been sent.');
      }
    } finally {
      setResetBusy(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);
    
    // Capture password and clear it from state immediately for security
    const passwordValue = password;
    setPassword('');
    
    try {
      if (!isFirebaseAvailable) {
        throw new Error('Firebase is not configured properly');
      }
      const cred = await signInWithEmailAndPassword(firebaseAuth!, email.trim(), passwordValue);
      
      // Clear email too after successful login
      setEmail('');
      
      try {
        const profileRef = doc(firebaseDb!, 'profiles', cred.user.uid);
        await updateDoc(profileRef, {
          last_login: serverTimestamp(),
        });
      } catch (updateError) {
        console.error('Failed to update last_login:', updateError);
      }
      
      await loadProfile(cred.user);
    } catch (err: unknown) {
      setError(mapSignInError(err));
      // Keep the sign-in screen visible if profile/role checks fail after Firebase auth.
      try {
        if (firebaseAuth?.currentUser) {
          await signOut(firebaseAuth);
        }
      } catch {
        // ignore sign-out errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseAvailable) return;
    await signOut(firebaseAuth!);
    setProfile(null);
    setVehicles([]);
    setUsers([]);
    setInspections([]);
    setDefects([]);
  };

  // ============================================
  // ANALYTICS COMPUTATIONS
  // ============================================

  // Vehicle Analytics
  const inspectionsByVehicle = useMemo(() => {
    const vehicleMap: Record<string, { count: number; defects: number; name: string }> = {};
    inspections.forEach(insp => {
      const vId = insp.vehicle_id || 'unknown';
      if (!vehicleMap[vId]) {
        const v = vehicles.find(v => v.id === vId);
        vehicleMap[vId] = { 
          count: 0, 
          defects: 0, 
          name: v ? `${v.registration}` : vId 
        };
      }
      vehicleMap[vId].count++;
      if (insp.has_defect) vehicleMap[vId].defects++;
    });
    return Object.entries(vehicleMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [inspections, vehicles]);

  // User Analytics
  const getUserDisplayName = (u: Profile | undefined, fallback: string = 'Unknown') => {
    if (!u) return fallback;
    if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
    if (u.display_name) return u.display_name.trim();
    if (u.displayName) return u.displayName;
    if (u.name) return u.name;
    if (u.email) return u.email.split('@')[0];
    return fallback;
  };

  // Time-based Analytics
  const inspectionsOverTime = useMemo(() => {
    const dateMap: Record<string, { count: number; timestamp: number; label: string }> = {};
    inspections.forEach(insp => {
      if (!insp.inspected_at) return;
      const date = insp.inspected_at && typeof insp.inspected_at === 'object' && 'toDate' in insp.inspected_at
        ? insp.inspected_at.toDate()
        : new Date(insp.inspected_at as string);
      const isoKey = format(date, 'yyyy-MM-dd');
      if (!dateMap[isoKey]) dateMap[isoKey] = { count: 0, timestamp: date.getTime(), label: format(date, 'MMM dd') };
      dateMap[isoKey].count++;
    });
    return Object.entries(dateMap)
      .map(([, { count, timestamp, label }]) => ({ date: label, count, timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-14)
      .map(({ date, count }) => ({ date, count }));
  }, [inspections]);

  const defectsTrend = useMemo(() => {
    const dateMap: Record<string, { reported: number; resolved: number; timestamp: number; label: string }> = {};
    defects.forEach(d => {
      if (!d.reported_at) return;
      const date = d.reported_at && typeof d.reported_at === 'object' && 'toDate' in d.reported_at
        ? d.reported_at.toDate()
        : new Date(d.reported_at as string);
      const isoKey = format(date, 'yyyy-MM-dd');
      if (!dateMap[isoKey]) dateMap[isoKey] = { reported: 0, resolved: 0, timestamp: date.getTime(), label: format(date, 'MMM dd') };
      dateMap[isoKey].reported++;
      if (d.status === 'resolved') dateMap[isoKey].resolved++;
    });
    return Object.entries(dateMap)
      .map(([, { reported, resolved, timestamp, label }]) => ({ date: label, reported, resolved, timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-14)
      .map(({ date, reported, resolved }) => ({ date, reported, resolved }));
  }, [defects]);

  const defectsBySeverity = useMemo(() => {
    const severityMap: Record<string, number> = {};
    defects.filter(d => d.status !== 'resolved').forEach(d => {
      const severity = d.severity || 'low';
      severityMap[severity] = (severityMap[severity] || 0) + 1;
    });
    const order = ['critical', 'high', 'medium', 'low'];
    return order
      .filter(s => severityMap[s])
      .map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: severityMap[name]
      }));
  }, [defects]);

  const toExpiryDate = (value?: Timestamp | string) => {
    if (!value) return null;
    try {
      if (typeof value === 'object' && 'toDate' in value) return value.toDate();
      const d = new Date(value as string);
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const daysUntil = (value?: Timestamp | string) => {
    const end = toExpiryDate(value);
    if (!end) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const day = new Date(end);
    day.setHours(0, 0, 0, 0);
    return Math.ceil((day.getTime() - start.getTime()) / 86400000);
  };

  const openDefectsInRange = useMemo(
    () => defects.filter((d) => d.status !== 'resolved'),
    [defects]
  );

  const motTaxDueCount = useMemo(() => {
    return vehicles.filter((v) => {
      const mot = daysUntil(v.mot_expiry_date);
      const tax = daysUntil(v.tax_expiry_date);
      return (mot !== null && mot <= 30) || (tax !== null && tax <= 30);
    }).length;
  }, [vehicles]);

  const mileageAttentionCount = useMemo(
    () => buildMileageAttentionRows(inspections, vehicles).length,
    [inspections, vehicles]
  );

  const defectResolutionRate = useMemo(() => {
    if (!defectsCount || defectsCount === 0) return 100;
    return Math.round(((resolvedDefectsCount || 0) / defectsCount) * 100);
  }, [defectsCount, resolvedDefectsCount]);

  const rangeSpanDays = useMemo(() => {
    const rangeStart = activityHistoryStartFromDashboardRange(dateRange);
    return Math.max(1, differenceInDays(new Date(), rangeStart) + 1);
  }, [dateRange]);

  const avgInspectionsPerDay = useMemo(() => {
    if (inspections.length === 0) return 0;
    return (inspections.length / rangeSpanDays).toFixed(1);
  }, [inspections, rangeSpanDays]);

  const rangeLabel = useMemo(() => {
    if (dateRange === 'all') return 'all time';
    if (dateRange === '365') return 'last 12 months';
    if (dateRange === '730') return 'last 24 months';
    return `last ${dateRange} days`;
  }, [dateRange]);

  // Export data preparation (full columns for compliance / weekly archives)
  const exportData = useMemo(() => {
    return {
      vehicles: vehicles.map((v) => ({
        'Vehicle ID': v.id,
        Registration: v.registration || '',
        Make: v.make || '',
        Model: v.model || '',
        Year: v.year ?? '',
        VIN: v.vin || '',
        Mileage: v.mileage ?? '',
        Status: v.status || '',
        Notes: v.notes || '',
        'Created At': formatDate(v.created_at),
        'Updated At': formatDate(v.updated_at),
      })),
      users: users.map((u) => ({
        'User ID': u.id,
        Name: getUserDisplayName(u, ''),
        Email: u.email || '',
        Role: u.role || '',
        'Created At': formatDate(u.created_at),
        'Last Login': formatDate(u.last_login),
      })),
      inspections: inspections.map((i) => {
        const v = vehicles.find((x) => x.id === i.vehicle_id);
        const inspector = users.find((u) => u.id === i.inspected_by);
        return {
          'Inspection ID': i.id,
          'Vehicle ID': i.vehicle_id || '',
          Registration: v?.registration || '',
          'Inspected At': formatDate(i.inspected_at),
          Mileage: i.mileage ?? '',
          'Has Defect': i.has_defect ? 'Yes' : 'No',
          'Inspector ID': i.inspected_by || '',
          Inspector: getUserDisplayName(inspector, i.inspected_by || ''),
          Notes: i.notes || '',
        };
      }),
      defects: defects.map((d) => {
        const v = vehicles.find((x) => x.id === d.vehicle_id);
        const reporter = users.find((u) => u.id === d.reported_by);
        return {
          'Defect ID': d.id,
          'Vehicle ID': d.vehicle_id || '',
          Registration: v?.registration || '',
          Description: d.description || '',
          Severity: d.severity || '',
          Status: d.status || '',
          'Reported At': formatDate(d.reported_at),
          'Reported By ID': d.reported_by || '',
          'Reported By': getUserDisplayName(reporter, d.reported_by || ''),
          'Resolved At': formatDate(d.resolved_at),
          'Resolved By': d.resolved_by || '',
          'Resolution Notes': d.resolution_notes || '',
        };
      }),
    };
  }, [vehicles, users, inspections, defects]);

  const handleFleetHealthPdf = useCallback(() => {
    if (vehicles.length === 0 && defects.length === 0) {
      alert('No fleet data loaded yet. Refresh the dashboard or add vehicles/defects first.');
      return;
    }
    const nameFor = (userId: string | undefined) => {
      if (!userId) return '—';
      const u = users.find((x) => x.id === userId);
      if (!u) return userId;
      if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
      if (u.display_name) return u.display_name.trim();
      if (u.displayName) return u.displayName;
      if (u.name) return u.name;
      if (u.email) return u.email.split('@')[0];
      return userId;
    };
    exportFleetHealthReportPDF({
      companyName: profile?.company_name,
      vehicles,
      defects,
      getUserDisplayName: nameFor,
    });
  }, [vehicles, defects, users, profile]);

  const isAuthedManager = useMemo(() => {
    return !!authUser && profile && (profile.role === 'manager' || profile.role === 'admin') && profile.company_id;
  }, [authUser, profile]);

  return (
    <div className="min-h-screen">
      {!authUser && <Navbar />}
      {!authUser ? (
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6">
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(ellipse 70% 50% at 15% 40%, rgba(59,130,246,0.09), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(59,130,246,0.06), transparent 50%)',
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" aria-hidden />

              <div className="relative w-full max-w-md">
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="relative mb-5 h-12 w-52 sm:h-14 sm:w-60">
                    <Image
                      src="/logo-black.png"
                      alt="Fleet Track PRO"
                      fill
                      sizes="240px"
                      className="object-contain object-center"
                      priority
                    />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    Manager dashboard
                  </h1>
                  <p className="mt-2 max-w-sm text-sm text-slate-600 leading-relaxed">
                    Sign in to view your organisation’s fleet, defects, and compliance.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
                  {error && (
                    <div
                      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                  {resetMessage && (
                    <div
                      className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                      role="status"
                    >
                      {resetMessage}
                    </div>
                  )}

                  <form onSubmit={handleSignIn} method="post" className="space-y-4">
                    <div>
                      <label htmlFor="dashboard-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        id="dashboard-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/25"
                        required
                      />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <label htmlFor="dashboard-password" className="block text-sm font-medium text-slate-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={resetBusy}
                          className="text-xs font-medium text-[var(--brand-blue)] hover:text-blue-700 hover:underline disabled:opacity-60"
                        >
                          {resetBusy ? 'Sending…' : 'Forgot password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="dashboard-password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 pr-11 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/25"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/40"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-1 w-full rounded-xl btn-brand-blue py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2 focus:ring-offset-white"
                      disabled={loading}
                    >
                      {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-xs text-slate-500">
                    Manager and admin accounts only.
                  </p>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                  New organisation?{' '}
                  <Link
                    href="/onboarding"
                    className="font-medium text-[var(--brand-blue)] hover:text-blue-700 hover:underline"
                  >
                    Start free trial
                  </Link>
                </p>
              </div>
            </div>
          ) : (
        <div className="max-w-7xl mx-auto">
          {error && (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-2 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100"
              role="alert"
            >
              <span>{error}</span>
              {profile?.company_id && (
                <button
                  type="button"
                  onClick={() => { setError(null); if (profile?.company_id) fetchData(profile.company_id); }}
                  className="text-blue-600 hover:underline font-medium whitespace-nowrap dark:text-blue-400"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {isAuthedManager && (            <div className="space-y-6 lg:space-y-8">
              {/* Header with controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6 no-print">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
                    {subscriptionStatus === 'trial' && (
                      <span className="badge-trial inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        7-Day Free Trial
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    What needs attention, plus activity for {rangeLabel}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    Export is a snapshot of this view. Full Excel is in Fleet report. 6/12 month packs are in Vehicle reports.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm hidden sm:inline">Period</span>
                    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
                      {['7', '30', '90', '365', '730', 'all'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range as '7' | '30' | '90' | '365' | '730' | 'all')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            dateRange === range
                              ? 'bg-blue-500 text-white keep-light-on-dark'
                              : 'text-white/70 hover:text-white'
                          }`}
                          aria-label={
                            range === 'all'
                              ? 'All time'
                              : range === '365'
                              ? 'Last 12 months'
                              : range === '730'
                              ? 'Last 24 months'
                              : `Last ${range} days`
                          }
                        >
                          {range === 'all'
                            ? 'All'
                            : range === '365'
                            ? '12m'
                            : range === '730'
                            ? '24m'
                            : `${range}d`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ExportButton
                    data={exportData.vehicles}
                    filename={`stp-dashboard-export-${format(new Date(), 'yyyy-MM-dd')}`}
                    reportTitle={`Fleet Track PRO — Dashboard data export (${format(new Date(), 'PPP')})`}
                    fleetHealthPdf={{ onExport: handleFleetHealthPdf }}
                    pdfMeta={{ organization: profile?.company_name }}
                    multiSheetData={[
                      { name: 'Vehicles', data: exportData.vehicles },
                      { name: 'Users', data: exportData.users },
                      { name: 'Inspections', data: exportData.inspections },
                      { name: 'Defects', data: exportData.defects },
                    ]}
                  />
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors disabled:opacity-60"
                    disabled={loading}
                    title="Manual refresh (limited to once every 8 seconds)"
                    aria-label={loading ? 'Refreshing data' : 'Refresh dashboard data'}
                  >
                    <RefreshCw className={`h-4 w-4 shrink-0 ${loading ? 'animate-spin' : ''}`} aria-hidden />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Loading overlay for data */}
              {loading && vehicles.length === 0 && (
                <div className="mb-8 flex items-center gap-3 text-white/60 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                  <span>Loading dashboard…</span>
                </div>
              )}

              <div className="dashboard-card p-5 mb-6">
                <h2 className="text-white font-semibold text-sm mb-3">Needs attention</h2>
                {motTaxDueCount === 0 &&
                openDefectsInRange.length === 0 &&
                mileageAttentionCount === 0 &&
                inspections.length > 0 ? (
                  <p className="text-white/60 text-sm">
                    Nothing urgent. No MOT or tax due in the next 30 days, no open defects in this period, and no vans to review in Mileage.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {motTaxDueCount > 0 && (
                      <li>
                        <Link
                          href="/dashboard/mot-tax"
                          className="inline-flex items-center gap-2 text-amber-700 hover:underline dark:text-amber-300"
                        >
                          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
                          {motTaxDueCount} vehicle{motTaxDueCount === 1 ? '' : 's'} with MOT or tax due within 30 days
                        </Link>
                      </li>
                    )}
                    {openDefectsInRange.length > 0 && (
                      <li>
                        <Link
                          href="/dashboard/defects"
                          className="inline-flex items-center gap-2 text-red-700 hover:underline dark:text-red-300"
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                          {openDefectsInRange.length} open defect{openDefectsInRange.length === 1 ? '' : 's'} in this period
                        </Link>
                      </li>
                    )}
                    {mileageAttentionCount > 0 && (
                      <li>
                        <Link
                          href="/dashboard/fleet-report/mileage"
                          className="inline-flex items-center gap-2 text-amber-700 hover:underline dark:text-amber-300"
                        >
                          <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
                          {mileageAttentionCount} vehicle{mileageAttentionCount === 1 ? '' : 's'} to review in Mileage
                        </Link>
                      </li>
                    )}
                    {inspections.length === 0 && (
                      <li className="text-white/60">
                        No inspections in {rangeLabel}. Daily checks from the app will appear here.
                      </li>
                    )}
                    {motTaxDueCount === 0 && openDefectsInRange.length === 0 && inspections.length === 0 && (
                      <li className="text-white/60">
                        No MOT or tax due in the next 30 days.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link
                  href="/dashboard/fleet"
                  className="dashboard-card p-5 block hover:border-blue-500/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center mb-3">
                    <Truck className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="dashboard-kpi-value">{vehiclesCount ?? '—'}</p>
                  <p className="dashboard-kpi-label">Vehicles</p>
                  <p className="text-white/40 text-xs mt-1">{activeVehiclesCount ?? 0} active</p>
                </Link>

                <Link
                  href="/dashboard/defects"
                  className="dashboard-card p-5 block hover:border-blue-500/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <p className="dashboard-kpi-value">{openDefectsInRange.length}</p>
                  <p className="dashboard-kpi-label">Open defects</p>
                  <p className="text-white/40 text-xs mt-1">
                    {defectsCount ? `${defectResolutionRate}% closed in period` : `in ${rangeLabel}`}
                  </p>
                </Link>

                <Link
                  href="/dashboard/inspection-proof"
                  className="dashboard-card p-5 block hover:border-blue-500/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center mb-3">
                    <ClipboardList className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="dashboard-kpi-value">{inspectionsCount ?? '—'}</p>
                  <p className="dashboard-kpi-label">Inspections</p>
                  <p className="text-white/40 text-xs mt-1">~{avgInspectionsPerDay}/day in {rangeLabel}</p>
                </Link>

                <Link
                  href="/dashboard/mot-tax"
                  className="dashboard-card p-5 block hover:border-blue-500/40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center mb-3">
                    <ShieldCheck className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="dashboard-kpi-value">{motTaxDueCount}</p>
                  <p className="dashboard-kpi-label">MOT &amp; tax due</p>
                  <p className="text-white/40 text-xs mt-1">Within 30 days</p>
                </Link>
              </div>

              <DashboardAnalyticsCharts
                inspectionsByVehicle={inspectionsByVehicle}
                inspectionsOverTime={inspectionsOverTime}
                defectsTrend={defectsTrend}
                defectsBySeverity={defectsBySeverity}
                rangeLabel={rangeLabel}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
