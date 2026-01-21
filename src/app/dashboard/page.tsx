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
  deleteDoc,
  updateDoc,
  serverTimestamp,
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
import { RefreshCw, Shield, Users, Truck, Package, AlertTriangle, Trash2, TrendingUp, TrendingDown, Activity, CheckCircle, Clock, AlertCircle, BarChart3, Calendar, Target, Key } from 'lucide-react';

type Profile = {
  id: string;
  company_id?: string;
  role?: string;
  displayName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
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
  status?: 'pending' | 'resolved' | 'investigating';
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
  role?: string;
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

  // Enhanced metrics
  const [activeAssetsCount, setActiveAssetsCount] = useState<number | null>(null);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState<number | null>(null);
  const [defectsCount, setDefectsCount] = useState<number | null>(null);
  const [resolvedDefectsCount, setResolvedDefectsCount] = useState<number | null>(null);
  const [todayInspectionsCount, setTodayInspectionsCount] = useState<number | null>(null);
  const [criticalDefectsCount, setCriticalDefectsCount] = useState<number | null>(null);

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [users, setUsers] = useState<Record<string, Profile>>({});

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
      // Only allow managers and admins - block users with role "user"
      if (data.role !== 'manager' && data.role !== 'admin') {
        throw new Error('Access restricted. Only managers and admins can access the dashboard.');
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

        // Enhanced queries for detailed metrics
        const activeToolsQ = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId), where('status', '==', 'active'));
        const activeVehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId), where('status', '==', 'active'));
        const defectsQ = query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId));
        const resolvedDefectsQ = query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId), where('status', '==', 'resolved'));
        const criticalDefectsQ = query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId), where('severity', '==', 'critical'));

        // Today's inspections
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayInspectionsQ = query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', Timestamp.fromDate(startOfDay))
        );

        const [
          toolsCount, vehiclesCountVal, teamCountVal, inspectionsCountVal,
          activeToolsCount, activeVehiclesCount, defectsCountVal, resolvedDefectsCountVal,
          todayInspectionsCountVal, criticalDefectsCountVal
        ] = await Promise.all([
          safeCount(toolsQ),
          safeCount(vehiclesQ),
          safeCount(teamQ),
          safeCount(inspectionsQ),
          safeCount(activeToolsQ),
          safeCount(activeVehiclesQ),
          safeCount(defectsQ),
          safeCount(resolvedDefectsQ),
          safeCount(todayInspectionsQ),
          safeCount(criticalDefectsQ),
        ]);

        setAssetsCount(toolsCount);
        setVehiclesCount(vehiclesCountVal);
        setTeamCount(teamCountVal);
        setInspectionsCount(inspectionsCountVal);
        setActiveAssetsCount(activeToolsCount);
        setActiveVehiclesCount(activeVehiclesCount);
        setDefectsCount(defectsCountVal);
        setResolvedDefectsCount(resolvedDefectsCountVal);
        setTodayInspectionsCount(todayInspectionsCountVal);
        setCriticalDefectsCount(criticalDefectsCountVal);

        // Fetch vehicles for mapping
        const vehiclesSnap = await getDocs(vehiclesQ);
        const vehiclesMap: Record<string, Vehicle> = {};
        vehiclesSnap.docs.forEach(doc => {
          vehiclesMap[doc.id] = { id: doc.id, ...doc.data() } as Vehicle;
        });
        setVehicles(vehiclesMap);

        // Fetch users for mapping inspected_by to names
        const usersSnap = await getDocs(teamQ);
        const usersMap: Record<string, Profile> = {};
        usersSnap.docs.forEach(doc => {
          usersMap[doc.id] = { id: doc.id, ...doc.data() } as Profile;
        });
        setUsers(usersMap);

        const recentInspectionsQ = query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          orderBy('inspected_at', 'desc'),
          limit(5)
        );
        const recentDefectsQ = query(
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
          getDocs(recentDefectsQ).catch(() => null),
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
      
      // Update last_login timestamp in user's profile
      try {
        const profileRef = doc(firebaseDb!, 'profiles', cred.user.uid);
        await updateDoc(profileRef, {
          last_login: serverTimestamp(),
        });
      } catch (updateError) {
        // Log but don't fail login if last_login update fails
        console.error('Failed to update last_login:', updateError);
      }
      
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
    setActiveAssetsCount(null);
    setActiveVehiclesCount(null);
    setDefectsCount(null);
    setResolvedDefectsCount(null);
    setTodayInspectionsCount(null);
    setCriticalDefectsCount(null);
  };

  const handleDeleteInspection = async (inspectionId: string) => {
    if (!isAdmin) {
      alert('Only admins can delete inspections.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this inspection? This action cannot be undone.') || !isFirebaseAvailable) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'vehicle_inspections', inspectionId));
      
      // Update local state
      setInspections(prev => prev.filter(i => i.id !== inspectionId));
      if (inspectionsCount !== null) {
        setInspectionsCount(Math.max(0, inspectionsCount - 1));
      }
      alert('Inspection deleted successfully.');
      
      // Refresh data to update counts
      if (profile?.company_id) {
        fetchData(profile.company_id);
      }
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert('Failed to delete inspection.');
    }
  };

  const isAdmin = profile?.role === 'admin';
  
  // Helper to get user display name
  const displayNameFor = (userId?: string): string => {
    if (!userId) return 'Unknown User';
    const user = users[userId];
    if (!user) return userId;
    
    // Try first_name + last_name first
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    // Fall back to displayName, name, email prefix
    return user.displayName || user.name || user.email?.split('@')[0] || userId;
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
                  Comprehensive view of your organization's fleet and asset management.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white/50 text-xs">Last updated</p>
                  <p className="text-white text-sm">{new Date().toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => profile?.company_id && fetchData(profile.company_id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-primary/40 text-white hover:border-primary transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: 'Total Assets',
                  value: assetsCount,
                  subtitle: activeAssetsCount ? `${activeAssetsCount} active` : null,
                  icon: Package,
                  trend: activeAssetsCount && assetsCount ? (activeAssetsCount / assetsCount) * 100 : null
                },
                {
                  title: 'Total Vehicles',
                  value: vehiclesCount,
                  subtitle: activeVehiclesCount ? `${activeVehiclesCount} active` : null,
                  icon: Truck,
                  trend: activeVehiclesCount && vehiclesCount ? (activeVehiclesCount / vehiclesCount) * 100 : null
                },
                {
                  title: 'Team Members',
                  value: teamCount,
                  icon: Users
                },
                {
                  title: 'Inspections',
                  value: inspectionsCount,
                  subtitle: todayInspectionsCount ? `${todayInspectionsCount} today` : null,
                  icon: Shield
                },
              ].map((item) => (
                <div key={item.title} className="bg-black border border-primary/25 rounded-xl p-5 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm">{item.title}</p>
                      <p className="text-white text-2xl font-semibold">
                        {item.value === null ? '—' : item.value}
                      </p>
                    </div>
                  </div>
                  {item.subtitle && (
                    <p className="text-white/50 text-xs">{item.subtitle}</p>
                  )}
                  {item.trend !== null && item.trend !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {item.trend >= 80 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : item.trend >= 60 ? (
                        <Activity className="h-3 w-3 text-yellow-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={`text-xs ${
                        item.trend >= 80 ? 'text-green-400' :
                        item.trend >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(item.trend)}% active
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Alerts & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Critical Alerts */}
              <div className="bg-black border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Critical Alerts</h3>
                </div>
                <div className="space-y-3">
                  {criticalDefectsCount && criticalDefectsCount > 0 ? (
                    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div>
                        <p className="text-red-400 text-sm font-medium">Critical Defects</p>
                        <p className="text-red-300/70 text-xs">{criticalDefectsCount} require immediate attention</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div>
                        <p className="text-green-400 text-sm font-medium">All Clear</p>
                        <p className="text-green-300/70 text-xs">No critical issues detected</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                  )}

                  {defectsCount && resolvedDefectsCount !== null ? (
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div>
                        <p className="text-blue-400 text-sm font-medium">Defect Resolution</p>
                        <p className="text-blue-300/70 text-xs">
                          {resolvedDefectsCount}/{defectsCount} defects resolved
                        </p>
                      </div>
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Today's Activity */}
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Today's Activity</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{todayInspectionsCount || 0}</p>
                    <p className="text-white/60 text-sm">Inspections completed</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-white font-semibold">{inspections.length}</p>
                      <p className="text-white/50">Recent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{historyItems.length}</p>
                      <p className="text-white/50">Tool actions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  <a
                    href="/dashboard/assets"
                    className="flex items-center justify-between p-3 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-white text-sm">Manage Assets</span>
                    <Package className="h-4 w-4 text-primary" />
                  </a>
                  <a
                    href="/dashboard/fleet"
                    className="flex items-center justify-between p-3 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-white text-sm">Manage Fleet</span>
                    <Truck className="h-4 w-4 text-primary" />
                  </a>
                  <a
                    href="/dashboard/defects"
                    className="flex items-center justify-between p-3 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-white text-sm">View Defects</span>
                    <AlertTriangle className="h-4 w-4 text-primary" />
                  </a>
                  <a
                    href="/dashboard/analytics"
                    className="flex items-center justify-between p-3 rounded-lg border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-white text-sm">View Analytics</span>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </a>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-green-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Recent Inspections</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{inspections.length}</p>
                    <p className="text-white/50 text-xs">Last 5</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {inspections.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No recent inspections</p>
                    </div>
                  ) : (
                    inspections.map((insp) => {
                      const vehicle = insp.vehicle_id ? vehicles[insp.vehicle_id] : null;
                      return (
                        <div key={insp.id} className="rounded-lg border border-primary/15 p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-white text-sm font-semibold">
                                {vehicle ? `${vehicle.registration} (${vehicle.make} ${vehicle.model})` : (insp.vehicle_id ?? 'Unknown Vehicle')}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-white/50" />
                                <span className="text-white/60 text-xs">{formatDate(insp.inspected_at)}</span>
                                {insp.has_defect && (
                                  <span className="inline-block text-xs text-red-300 border border-red-400/50 px-2 py-0.5 rounded">
                                    Issue Found
                                  </span>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteInspection(insp.id)}
                                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete Inspection (Admin Only)"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-white/50" />
                            <span className="text-white/60 text-xs">
                              Inspector: {insp.inspected_by ? displayNameFor(insp.inspected_by) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Active Defects</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{defects.length}</p>
                    <p className="text-white/50 text-xs">Outstanding</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {defects.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                      <p className="text-green-400 text-sm font-medium">All Clear!</p>
                      <p className="text-white/60 text-xs">No outstanding defects</p>
                    </div>
                  ) : (
                    defects.map((d) => {
                      const vehicle = d.vehicle_id ? vehicles[d.vehicle_id] : null;
                      return (
                        <div key={d.id} className="rounded-lg border border-primary/15 p-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-white text-sm font-semibold">
                                  {vehicle ? `${vehicle.registration} (${vehicle.make} ${vehicle.model})` : (d.vehicle_id ?? 'Unknown Vehicle')}
                                </p>
                                <span className={`inline-block text-xs px-2 py-0.5 rounded capitalize font-medium
                                  ${d.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    d.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                    d.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}
                                >
                                  {d.severity || 'low'}
                                </span>
                              </div>
                              <p className="text-white/70 text-sm line-clamp-2">
                                {d.description || 'No description provided'}
                              </p>
                            </div>
                            <AlertTriangle className={`h-5 w-5 ${
                              d.severity === 'critical' ? 'text-red-400' :
                              d.severity === 'high' ? 'text-orange-400' :
                              d.severity === 'medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-white/50" />
                              <span className="text-white/60">Reported {formatDate(d.reported_at)}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              d.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                              d.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {d.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Additional Activity Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Tool Activity</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{historyItems.length}</p>
                    <p className="text-white/50 text-xs">Last 5 actions</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {historyItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No recent tool activity</p>
                    </div>
                  ) : (
                    historyItems.map((h) => (
                      <div key={h.id} className="rounded-lg border border-primary/15 p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-sm font-semibold">
                            Tool: {h.tool_id ?? 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-white/50" />
                            <span className="text-white/60 text-xs">{formatDate(h.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm capitalize">
                              Action: {h.action ?? 'Unknown'}
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                              User: {h.user_id ?? 'Unknown'}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (h.action?.toLowerCase().includes('out') || h.action?.toLowerCase().includes('checkout'))
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {(h.action?.toLowerCase().includes('out') || h.action?.toLowerCase().includes('checkout'))
                              ? 'Checked Out'
                              : 'Checked In'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Key className="h-4 w-4 text-cyan-400" />
                    </div>
                    <h3 className="text-white text-lg font-semibold">Access Codes</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{accessCodes.length}</p>
                    <p className="text-white/50 text-xs">Active codes</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {accessCodes.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No active access codes</p>
                      <p className="text-white/40 text-xs mt-1">Generate codes to invite team members</p>
                    </div>
                  ) : (
                    accessCodes.map((c) => (
                      <div key={c.id} className="rounded-lg border border-primary/15 p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white text-sm font-semibold font-mono">{c.id}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-white/50" />
                              <span className="text-white/60 text-xs">Expires {formatDate(c.expiresAt)}</span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              c.used ? 'bg-gray-500/20 text-gray-400' : 'bg-cyan-500/20 text-cyan-400'
                            }`}
                          >
                            {c.used ? 'Used' : 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-white/50" />
                          <span className="text-white/60 text-xs capitalize">
                            Role: {c.role || 'user'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
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
