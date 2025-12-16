'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import {
  onAuthStateChanged,
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
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';

// Check if Firebase is properly initialized
const isFirebaseAvailable = firebaseAuth && firebaseDb;
import { RefreshCw, Shield, Users, Truck, Package, AlertTriangle } from 'lucide-react';

type Profile = {
  company_id?: string;
  role?: string;
  displayName?: string;
  email?: string;
};

type Inspection = {
  id: string;
  vehicle_id?: string;
  inspected_at?: string;
  has_defect?: boolean;
  inspected_by?: string;
};

type Defect = {
  id: string;
  vehicle_id?: string;
  reported_at?: string;
  severity?: string;
  description?: string;
};

type Vehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
};

type HistoryItem = {
  id: string;
  tool_id?: string;
  action?: string;
  user_id?: string;
  timestamp?: string;
};

type AccessCode = {
  id: string;
  companyId?: string;
  used?: boolean;
  expiresAt?: string;
};

const formatDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString();
    }
    return new Date(value).toLocaleString();
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

  const [assetsCount, setAssetsCount] = useState<number | null>(null);
  const [vehiclesCount, setVehiclesCount] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [inspectionsCount, setInspectionsCount] = useState<number | null>(null);

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});

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
        throw new Error('Access restricted to managers.');
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
    async (companyId: string) => {
      if (!isFirebaseAvailable) {
        setError('Firebase is not configured properly');
        return;
      }
      
      // CRITICAL: Always validate company_id exists for data isolation
      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // CRITICAL: Always filter by company_id to ensure company data isolation
        // Even admins can only see their own company's business data
        const toolsQ = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId));
        const vehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId));
        const teamQ = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
        const inspectionsQ = query(collection(firebaseDb!, 'vehicle_inspections'), where('company_id', '==', companyId));

        const [toolsCount, vehiclesCountVal, teamCountVal, inspectionsCountVal] = await Promise.all([
          safeCount(toolsQ),
          safeCount(vehiclesQ),
          safeCount(teamQ),
          safeCount(inspectionsQ),
        ]);

        setAssetsCount(toolsCount);
        setVehiclesCount(vehiclesCountVal);
        setTeamCount(teamCountVal);
        setInspectionsCount(inspectionsCountVal);

        // Fetch vehicles for mapping
        const vehiclesSnap = await getDocs(vehiclesQ);
        const vehiclesMap: Record<string, Vehicle> = {};
        vehiclesSnap.docs.forEach(doc => {
          vehiclesMap[doc.id] = { id: doc.id, ...doc.data() } as Vehicle;
        });
        setVehicles(vehiclesMap);

        const recentInspectionsQ = query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          orderBy('inspected_at', 'desc'),
          limit(5)
        );
        const defectsQ = query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', companyId),
          orderBy('reported_at', 'desc'),
          limit(5)
        );
        const historyQ = query(
          collection(firebaseDb!, 'tool_history'),
          where('company_id', '==', companyId),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const accessCodesQ = query(
          collection(firebaseDb!, 'access_codes'),
          where('companyId', '==', companyId),
          limit(5)
        );

        const [inspSnap, defectsSnap, historySnap, codesSnap] = await Promise.all([
          getDocs(recentInspectionsQ).catch(() => null),
          getDocs(defectsQ).catch(() => null),
          getDocs(historyQ).catch(() => null),
          getDocs(accessCodesQ).catch(() => null),
        ]);

        if (inspSnap) {
          setInspections(
            inspSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as DocumentData),
            }))
          );
        }
        if (defectsSnap) {
          setDefects(
            defectsSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as DocumentData),
            }))
          );
        }
        if (historySnap) {
          setHistoryItems(
            historySnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as DocumentData),
            }))
          );
        }
        if (codesSnap) {
          setAccessCodes(
            codesSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as DocumentData),
            }))
          );
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load data');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!authUser) return;
    loadProfile(authUser)
      .then((p) => {
        if (p.company_id) {
          fetchData(p.company_id);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      });
  }, [authUser, fetchData, loadProfile]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isFirebaseAvailable) {
        throw new Error('Firebase is not configured properly');
      }
      const cred = await signInWithEmailAndPassword(firebaseAuth!, email.trim(), password);
      await loadProfile(cred.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseAvailable) return;
    await signOut(firebaseAuth!);
    setProfile(null);
    setInspections([]);
    setDefects([]);
    setHistoryItems([]);
    setAccessCodes([]);
    setAssetsCount(null);
    setVehiclesCount(null);
    setTeamCount(null);
    setInspectionsCount(null);
  };

  const isAuthedManager = useMemo(() => {
    return !!authUser && profile && (profile.role === 'manager' || profile.role === 'admin') && profile.company_id;
  }, [authUser, profile]);

  return (
    <div className="min-h-screen bg-black">
      {!authUser && <Navbar />}
      <div className={`${!authUser ? 'container mx-auto px-4 pt-28 pb-16' : ''}`}>
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {!authUser && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-black border border-primary/30 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manager Sign In</h2>
                <p className="text-white/60 text-sm mt-2">Access your organization's dashboard</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-black border border-primary/30 px-3 py-2 text-white focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-black border border-primary/30 px-3 py-2 text-white focus:border-primary outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-2 transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <p className="text-white/60 text-center text-sm mt-4">
                Managers only. Contact your admin if you need access.
              </p>
            </div>
          </div>
        )}

        {isAuthedManager && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-white/70 text-sm mt-1">
                  Overview of your organization's assets and activities.
                </p>
              </div>
              <button
                onClick={() => profile?.company_id && fetchData(profile.company_id)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-primary/40 text-white hover:border-primary transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Assets', value: assetsCount, icon: Package },
                { title: 'Vehicles', value: vehiclesCount, icon: Truck },
                { title: 'Team Members', value: teamCount, icon: Users },
                { title: 'Inspections', value: inspectionsCount, icon: Shield },
              ].map((item) => (
                <div key={item.title} className="bg-black border border-primary/25 rounded-xl p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">{item.title}</p>
                    <p className="text-white text-xl font-semibold">
                      {item.value === null ? '—' : item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Recent Inspections</h3>
                  <span className="text-xs text-white/50">Latest 5</span>
                </div>
                <div className="space-y-3">
                  {inspections.length === 0 && (
                    <p className="text-white/60 text-sm">No inspections found.</p>
                  )}
                  {inspections.map((insp) => {
                    const vehicle = insp.vehicle_id ? vehicles[insp.vehicle_id] : null;
                    return (
                      <div key={insp.id} className="rounded-lg border border-primary/15 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-semibold">
                            Vehicle: {vehicle ? `${vehicle.registration} (${vehicle.make} ${vehicle.model})` : (insp.vehicle_id ?? '—')}
                          </p>
                          {insp.has_defect && (
                            <span className="text-xs text-red-300 border border-red-400/50 px-2 py-0.5 rounded">
                              Defect
                            </span>
                          )}
                        </div>
                        <p className="text-white/70 text-xs mt-1">Inspected at: {formatDate(insp.inspected_at)}</p>
                        <p className="text-white/60 text-xs">Inspector: {insp.inspected_by ?? '—'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Defects</h3>
                  <span className="text-xs text-white/50">Latest 5</span>
                </div>
                <div className="space-y-3">
                  {defects.length === 0 && <p className="text-white/60 text-sm">No defects reported.</p>}
                  {defects.map((d) => {
                    const vehicle = d.vehicle_id ? vehicles[d.vehicle_id] : null;
                    return (
                      <div key={d.id} className="rounded-lg border border-primary/15 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-semibold">
                            Vehicle: {vehicle ? `${vehicle.registration} (${vehicle.make} ${vehicle.model})` : (d.vehicle_id ?? '—')}
                          </p>
                          <AlertTriangle className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-white/70 text-xs mt-1">Reported: {formatDate(d.reported_at)}</p>
                        <p className="text-white/70 text-xs">Severity: {d.severity ?? '—'}</p>
                        <p className="text-white/60 text-xs mt-1 line-clamp-2">
                          {d.description ?? 'No description'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Tool History</h3>
                  <span className="text-xs text-white/50">Latest 5</span>
                </div>
                <div className="space-y-3">
                  {historyItems.length === 0 && <p className="text-white/60 text-sm">No history available.</p>}
                  {historyItems.map((h) => (
                    <div key={h.id} className="rounded-lg border border-primary/15 p-3">
                      <p className="text-white text-sm font-semibold">Tool: {h.tool_id ?? '—'}</p>
                      <p className="text-white/70 text-xs">Action: {h.action ?? '—'}</p>
                      <p className="text-white/70 text-xs">User: {h.user_id ?? '—'}</p>
                      <p className="text-white/60 text-xs mt-1">When: {formatDate(h.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Access Codes (read-only)</h3>
                  <span className="text-xs text-white/50">Latest 5</span>
                </div>
                <p className="text-white/60 text-sm mb-3">
                  Codes are generated in the app. Displayed here for reference only.
                </p>
                <div className="space-y-3">
                  {accessCodes.length === 0 && <p className="text-white/60 text-sm">No access codes found.</p>}
                  {accessCodes.map((c) => (
                    <div key={c.id} className="rounded-lg border border-primary/15 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-semibold">Code: {c.id}</p>
                        <p className="text-white/70 text-xs">Expires: {formatDate(c.expiresAt)}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          c.used ? 'bg-white/10 text-white/70' : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {c.used ? 'Used' : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
