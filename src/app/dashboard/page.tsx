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
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, startOfWeek, startOfMonth, differenceInDays } from 'date-fns';
import ExportButton from './components/ExportButton';
import PrintButton from './components/PrintButton';
import ChartErrorBoundary from './components/ChartErrorBoundary';

// Check if Firebase is properly initialized
const isFirebaseAvailable = firebaseAuth && firebaseDb;
import { RefreshCw, Users, Truck, Package, TrendingUp, TrendingDown, Activity, CheckCircle, Clock, BarChart3, Calendar, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Profile = {
  id: string;
  company_id?: string;
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
  status?: string;
  created_at?: Timestamp | string;
};

type Asset = {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  location?: string;
  created_at?: Timestamp | string;
};

type Inspection = {
  id: string;
  vehicle_id?: string;
  inspected_at?: Timestamp | string;
  has_defect?: boolean;
  inspected_by?: string;
};

type Defect = {
  id: string;
  vehicle_id?: string;
  reported_at?: Timestamp | string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  status?: 'pending' | 'resolved' | 'investigating';
};

type HistoryItem = {
  id: string;
  tool_id?: string;
  action?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
};

const COLORS = ['#00D9FF', '#FF6B6B', '#FFD93D', '#6BCF7F', '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71'];

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

const formatShortDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    const date = value && typeof value === 'object' && 'toDate' in value
      ? value.toDate()
      : new Date(value as string);
    return format(date, 'MMM dd');
  } catch {
    return '—';
  }
};

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Date range filter
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');

  // Analytics data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Counts
  const [assetsCount, setAssetsCount] = useState<number | null>(null);
  const [vehiclesCount, setVehiclesCount] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [inspectionsCount, setInspectionsCount] = useState<number | null>(null);
  const [activeAssetsCount, setActiveAssetsCount] = useState<number | null>(null);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState<number | null>(null);
  const [defectsCount, setDefectsCount] = useState<number | null>(null);
  const [resolvedDefectsCount, setResolvedDefectsCount] = useState<number | null>(null);
  
  // Company subscription info
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

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
        throw new Error('Access restricted. Only managers can access the dashboard.');
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
      
      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        let startDate: Date | null = null;
        
        if (dateRange !== 'all') {
          startDate = startOfDay(subDays(now, parseInt(dateRange)));
        }

        // Base queries for counts
        const toolsQ = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId));
        const vehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId));
        const teamQ = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
        const inspectionsQ = query(collection(firebaseDb!, 'vehicle_inspections'), where('company_id', '==', companyId));
        const activeToolsQ = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId), where('status', '==', 'active'));
        const activeVehiclesQ = query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId), where('status', '==', 'active'));
        const defectsQ = query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId));
        const resolvedDefectsQ = query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId), where('status', '==', 'resolved'));

        // Get counts
        const [
          toolsCountVal, vehiclesCountVal, teamCountVal, inspectionsCountVal,
          activeToolsCountVal, activeVehiclesCountVal, defectsCountVal, resolvedDefectsCountVal
        ] = await Promise.all([
          safeCount(toolsQ),
          safeCount(vehiclesQ),
          safeCount(teamQ),
          safeCount(inspectionsQ),
          safeCount(activeToolsQ),
          safeCount(activeVehiclesQ),
          safeCount(defectsQ),
          safeCount(resolvedDefectsQ),
        ]);

        setAssetsCount(toolsCountVal);
        setVehiclesCount(vehiclesCountVal);
        setTeamCount(teamCountVal);
        setInspectionsCount(inspectionsCountVal);
        setActiveAssetsCount(activeToolsCountVal);
        setActiveVehiclesCount(activeVehiclesCountVal);
        setDefectsCount(defectsCountVal);
        setResolvedDefectsCount(resolvedDefectsCountVal);

        // Fetch company subscription status
        try {
          const companySnap = await getDoc(doc(firebaseDb!, 'companies', companyId));
          if (companySnap.exists()) {
            const companyData = companySnap.data();
            setSubscriptionStatus(companyData.subscription_status || null);
            setSubscriptionTier(companyData.subscription_tier || null);
          }
        } catch (err) {
          console.error('Error fetching company subscription:', err);
        }

        // Fetch full data for analytics
        const vehiclesSnap = await getDocs(vehiclesQ);
        setVehicles(vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));

        const assetsSnap = await getDocs(toolsQ);
        setAssets(assetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Asset)));

        const usersSnap = await getDocs(teamQ);
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile)));

        // Fetch inspections with date filter
        let inspQuery = query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          orderBy('inspected_at', 'desc')
        );
        if (startDate) {
          inspQuery = query(
            collection(firebaseDb!, 'vehicle_inspections'),
            where('company_id', '==', companyId),
            where('inspected_at', '>=', Timestamp.fromDate(startDate)),
            orderBy('inspected_at', 'desc')
          );
        }
        const inspSnap = await getDocs(inspQuery);
        let inspectionsData = inspSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
        
        // Limit to 8 most recent inspections per user (matching app behavior)
        const inspectionsByUser: Record<string, Inspection[]> = {};
        inspectionsData.forEach(insp => {
          const userId = insp.inspected_by || 'unknown';
          if (!inspectionsByUser[userId]) {
            inspectionsByUser[userId] = [];
          }
          inspectionsByUser[userId].push(insp);
        });
        
        // Sort each user's inspections by date (most recent first) and take top 8
        const filteredInspections: Inspection[] = [];
        Object.values(inspectionsByUser).forEach(userInspections => {
          userInspections.sort((a, b) => {
            const aDate = a.inspected_at && typeof a.inspected_at === 'object' && 'toDate' in a.inspected_at
              ? a.inspected_at.toDate()
              : (a.inspected_at ? new Date(a.inspected_at as string) : new Date(0));
            const bDate = b.inspected_at && typeof b.inspected_at === 'object' && 'toDate' in b.inspected_at
              ? b.inspected_at.toDate()
              : (b.inspected_at ? new Date(b.inspected_at as string) : new Date(0));
            return bDate.getTime() - aDate.getTime();
          });
          filteredInspections.push(...userInspections.slice(0, 8));
        });
        
        setInspections(filteredInspections);

        // Fetch defects with date filter
        let defQuery = query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', companyId),
          orderBy('reported_at', 'desc')
        );
        if (startDate) {
          defQuery = query(
            collection(firebaseDb!, 'vehicle_defects'),
            where('company_id', '==', companyId),
            where('reported_at', '>=', Timestamp.fromDate(startDate)),
            orderBy('reported_at', 'desc')
          );
        }
        const defSnap = await getDocs(defQuery);
        setDefects(defSnap.docs.map(d => ({ id: d.id, ...d.data() } as Defect)));

        // Fetch history with date filter
        let histQuery = query(
          collection(firebaseDb!, 'tool_history'),
          where('company_id', '==', companyId),
          orderBy('timestamp', 'desc'),
          limit(500)
        );
        if (startDate) {
          histQuery = query(
            collection(firebaseDb!, 'tool_history'),
            where('company_id', '==', companyId),
            where('timestamp', '>=', Timestamp.fromDate(startDate)),
            orderBy('timestamp', 'desc'),
            limit(500)
          );
        }
        const histSnap = await getDocs(histQuery);
        setHistoryItems(histSnap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem)));

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load data');
      } finally {
        setLoading(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    if (!authUser) return;
    
    let isMounted = true;
    
    loadProfile(authUser)
      .then((p) => {
        if (isMounted && p.company_id && p.company_id.trim()) {
          fetchData(p.company_id);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load profile');
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [authUser, fetchData, loadProfile]);

  // Refetch when date range changes (only if profile is already loaded)
  useEffect(() => {
    if (profile?.company_id && profile.company_id.trim()) {
      fetchData(profile.company_id);
    }
    // Note: fetchData already has dateRange in its dependencies, 
    // so this effect will trigger when dateRange changes
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!isFirebaseAvailable) return;
    await signOut(firebaseAuth!);
    setProfile(null);
    setVehicles([]);
    setAssets([]);
    setUsers([]);
    setInspections([]);
    setDefects([]);
    setHistoryItems([]);
  };

  // ============================================
  // ANALYTICS COMPUTATIONS
  // ============================================

  // Vehicle Analytics
  const vehicleStatusBreakdown = useMemo(() => {
    const statusMap: Record<string, number> = {};
    vehicles.forEach(v => {
      const status = v.status || 'unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [vehicles]);

  const vehiclesByMake = useMemo(() => {
    const makeMap: Record<string, number> = {};
    vehicles.forEach(v => {
      const make = v.make || 'Unknown';
      makeMap[make] = (makeMap[make] || 0) + 1;
    });
    return Object.entries(makeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [vehicles]);

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

  // Asset Analytics
  const assetStatusBreakdown = useMemo(() => {
    const statusMap: Record<string, number> = {};
    assets.forEach(a => {
      const status = a.status || 'unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [assets]);

  const assetsByType = useMemo(() => {
    const typeMap: Record<string, number> = {};
    assets.forEach(a => {
      const type = a.type || 'Unknown';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    return Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [assets]);

  const assetUsageByAction = useMemo(() => {
    const actionMap: Record<string, number> = {};
    historyItems.forEach(h => {
      const action = h.action || 'unknown';
      actionMap[action] = (actionMap[action] || 0) + 1;
    });
    return Object.entries(actionMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [historyItems]);

  // User Analytics
  const usersByRole = useMemo(() => {
    const roleMap: Record<string, number> = {};
    users.forEach(u => {
      const role = u.role || 'user';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });
    return Object.entries(roleMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [users]);

  // From profile: first_name + last_name > display_name > displayName > name > email prefix > fallback
  const getUserDisplayName = (u: Profile | undefined, fallback: string = 'Unknown') => {
    if (!u) return fallback;
    if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
    if (u.display_name) return u.display_name.trim();
    if (u.displayName) return u.displayName;
    if (u.name) return u.name;
    if (u.email) return u.email.split('@')[0];
    return fallback;
  };

  const userActivity = useMemo(() => {
    const userActionMap: Record<string, { inspections: number; actions: number; name: string }> = {};
    
    inspections.forEach(insp => {
      const uId = insp.inspected_by || 'unknown';
      if (!userActionMap[uId]) {
        const u = users.find(u => u.id === uId);
        userActionMap[uId] = {
          inspections: 0,
          actions: 0,
          name: getUserDisplayName(u, uId)
        };
      }
      userActionMap[uId].inspections++;
    });

    historyItems.forEach(h => {
      const uId = h.user_id || 'unknown';
      if (!userActionMap[uId]) {
        const u = users.find(u => u.id === uId);
        userActionMap[uId] = {
          inspections: 0,
          actions: 0,
          name: getUserDisplayName(u, uId)
        };
      }
      userActionMap[uId].actions++;
    });

    return Object.entries(userActionMap)
      .map(([id, data]) => ({ id, ...data, total: data.inspections + data.actions }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [inspections, historyItems, users]);

  // Time-based Analytics
  const inspectionsOverTime = useMemo(() => {
    const dateMap: Record<string, number> = {};
    inspections.forEach(insp => {
      if (!insp.inspected_at) return;
      const date = insp.inspected_at && typeof insp.inspected_at === 'object' && 'toDate' in insp.inspected_at
        ? insp.inspected_at.toDate()
        : new Date(insp.inspected_at as string);
      const dateKey = format(date, 'MMM dd');
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });
    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .slice(-14);
  }, [inspections]);

  const defectsTrend = useMemo(() => {
    const dateMap: Record<string, { reported: number; resolved: number }> = {};
    defects.forEach(d => {
      if (!d.reported_at) return;
      const date = d.reported_at && typeof d.reported_at === 'object' && 'toDate' in d.reported_at
        ? d.reported_at.toDate()
        : new Date(d.reported_at as string);
      const dateKey = format(date, 'MMM dd');
      if (!dateMap[dateKey]) dateMap[dateKey] = { reported: 0, resolved: 0 };
      dateMap[dateKey].reported++;
      if (d.status === 'resolved') dateMap[dateKey].resolved++;
    });
    return Object.entries(dateMap)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-14);
  }, [defects]);

  const defectsBySeverity = useMemo(() => {
    const severityMap: Record<string, number> = {};
    defects.forEach(d => {
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

  // KPI Calculations
  const fleetUtilization = useMemo(() => {
    if (!vehiclesCount || vehiclesCount === 0) return 0;
    return Math.round(((activeVehiclesCount || 0) / vehiclesCount) * 100);
  }, [vehiclesCount, activeVehiclesCount]);

  const assetUtilization = useMemo(() => {
    if (!assetsCount || assetsCount === 0) return 0;
    return Math.round(((activeAssetsCount || 0) / assetsCount) * 100);
  }, [assetsCount, activeAssetsCount]);

  const defectResolutionRate = useMemo(() => {
    if (!defectsCount || defectsCount === 0) return 100;
    return Math.round(((resolvedDefectsCount || 0) / defectsCount) * 100);
  }, [defectsCount, resolvedDefectsCount]);

  const avgInspectionsPerDay = useMemo(() => {
    if (inspections.length === 0) return 0;
    const days = dateRange === 'all' ? 30 : parseInt(dateRange);
    return (inspections.length / days).toFixed(1);
  }, [inspections, dateRange]);

  // Export data preparation
  const exportData = useMemo(() => ({
    vehicles: vehicles.map(v => ({
      Registration: v.registration || '',
      Make: v.make || '',
      Model: v.model || '',
      Status: v.status || '',
      'Created At': formatDate(v.created_at),
    })),
    assets: assets.map(a => ({
      Name: a.name || '',
      Type: a.type || '',
      Status: a.status || '',
      Location: a.location || '',
      'Created At': formatDate(a.created_at),
    })),
    users: users.map(u => ({
      Name: getUserDisplayName(u, ''),
      Email: u.email || '',
      Role: u.role || '',
      'Last Login': formatDate(u.last_login),
    })),
    inspections: inspections.map(i => {
      const v = vehicles.find(v => v.id === i.vehicle_id);
      const u = users.find(u => u.id === i.inspected_by);
      return {
        Vehicle: v ? v.registration : i.vehicle_id || '',
        'Inspected At': formatDate(i.inspected_at),
        'Has Defect': i.has_defect ? 'Yes' : 'No',
        Inspector: getUserDisplayName(u, i.inspected_by || ''),
      };
    }),
    defects: defects.map(d => {
      const v = vehicles.find(v => v.id === d.vehicle_id);
      return {
        Vehicle: v ? v.registration : d.vehicle_id || '',
        Description: d.description || '',
        Severity: d.severity || '',
        Status: d.status || '',
        'Reported At': formatDate(d.reported_at),
      };
    }),
  }), [vehicles, assets, users, inspections, defects]);

  const isAuthedManager = useMemo(() => {
    return !!authUser && profile && (profile.role === 'manager' || profile.role === 'admin') && profile.company_id;
  }, [authUser, profile]);

  return (
    <div className="min-h-screen bg-black">
      {!authUser && <Navbar />}
      <div className={`${!authUser ? 'container mx-auto px-4 pt-28 pb-16' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex flex-wrap items-center justify-between gap-2" role="alert">
              <span>{error}</span>
              {profile?.company_id && (
                <button
                  type="button"
                  onClick={() => { setError(null); if (profile?.company_id) fetchData(profile.company_id); }}
                  className="text-blue-500 hover:underline font-medium whitespace-nowrap"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {!authUser && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="dashboard-card p-8 max-w-md w-full shadow-xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h2>
                <p className="text-white/60 text-sm mt-2">Sign in to view your organisation’s analytics</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-black font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
              <p className="text-white/60 text-center text-sm mt-4">Managers only.</p>
              <p className="text-white/50 text-center text-xs mt-2">
                New user? <a href="/onboarding" className="text-blue-500 hover:underline">Create an account</a> or download the app to get started.
              </p>
            </div>
            </div>
          )}

          {isAuthedManager && (
            <div id="analytics-report" className="print-content space-y-8">
              {/* Header with controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 no-print">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
                    {subscriptionStatus === 'trial' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        7-Day Free Trial
                      </span>
                    )}
                    {subscriptionStatus === 'active' && subscriptionTier && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        {subscriptionTier.replace('PRO_', '')}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    Vehicles, assets and team performance at a glance
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-sm hidden sm:inline">Period</span>
                    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
                      {['7', '30', '90', 'all'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range as '7' | '30' | '90' | 'all')}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            dateRange === range
                              ? 'bg-blue-500 text-white'
                              : 'text-white/70 hover:text-white'
                          }`}
                          aria-label={range === 'all' ? 'All time' : `Last ${range} days`}
                        >
                          {range === 'all' ? 'All' : `${range}d`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ExportButton
                    data={exportData.vehicles}
                    filename={`analytics-report-${format(new Date(), 'yyyy-MM-dd')}`}
                    multiSheetData={[
                      { name: 'Vehicles', data: exportData.vehicles },
                      { name: 'Assets', data: exportData.assets },
                      { name: 'Users', data: exportData.users },
                      { name: 'Inspections', data: exportData.inspections },
                      { name: 'Defects', data: exportData.defects },
                    ]}
                  />
                  <PrintButton title="Analytics Report" contentId="analytics-report" />
                  <button
                    onClick={() => profile?.company_id && fetchData(profile.company_id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors disabled:opacity-60"
                    disabled={loading}
                    aria-label={loading ? 'Refreshing data' : 'Refresh dashboard data'}
                  >
                    <RefreshCw className={`h-4 w-4 shrink-0 ${loading ? 'animate-spin' : ''}`} aria-hidden />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Print Header (hidden on screen) */}
              <div className="print-header hidden print:block mb-8">
                <h1 className="text-2xl font-bold">Analytics Report</h1>
                <p className="text-sm text-gray-600">Generated on {format(new Date(), 'PPP')}</p>
              </div>

              {/* Loading overlay for data */}
              {loading && vehicles.length === 0 && assets.length === 0 && (
                <div className="mb-8 flex items-center gap-3 text-white/60 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                  <span>Loading analytics…</span>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="dashboard-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${fleetUtilization >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                      {fleetUtilization >= 70 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {fleetUtilization}%
                    </span>
                  </div>
                  <p className="dashboard-kpi-value">{vehiclesCount ?? '—'}</p>
                  <p className="dashboard-kpi-label">Fleet vehicles</p>
                  <p className="text-white/40 text-xs mt-1">{activeVehiclesCount ?? 0} active</p>
                </div>

                <div className="dashboard-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${assetUtilization >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
                      {assetUtilization >= 70 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {assetUtilization}%
                    </span>
                  </div>
                  <p className="dashboard-kpi-value">{assetsCount ?? '—'}</p>
                  <p className="dashboard-kpi-label">Total assets</p>
                  <p className="text-white/40 text-xs mt-1">{activeAssetsCount ?? 0} active</p>
                </div>

                <div className="dashboard-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="dashboard-kpi-value">{teamCount ?? '—'}</p>
                  <p className="dashboard-kpi-label">Team members</p>
                  <p className="text-white/40 text-xs mt-1">{userActivity.length} active</p>
                </div>

                <div className="dashboard-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                      <Target className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${defectResolutionRate >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                      {defectResolutionRate}%
                    </span>
                  </div>
                  <p className="dashboard-kpi-value">{inspectionsCount ?? '—'}</p>
                  <p className="dashboard-kpi-label">Total inspections</p>
                  <p className="text-white/40 text-xs mt-1">~{avgInspectionsPerDay}/day avg</p>
                </div>
              </div>

              {/* Fleet Analytics Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-5 w-5 text-blue-400 shrink-0" />
                  <h2 className="dashboard-section-title">Fleet analytics</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Vehicle Status */}
                  <ChartErrorBoundary>
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Vehicle Status Distribution</h3>
                    {vehicleStatusBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={vehicleStatusBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {vehicleStatusBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No vehicle data</div>
                    )}
                  </div>
                  </ChartErrorBoundary>

                  {/* Vehicles by Make */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Vehicles by make</h3>
                    {vehiclesByMake.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={vehiclesByMake} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis type="number" stroke="#888" />
                          <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#00D9FF" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No vehicle data</div>
                    )}
                  </div>

                  {/* Inspections by Vehicle */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Top inspected vehicles</h3>
                    {inspectionsByVehicle.length > 0 ? (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {inspectionsByVehicle.map((v, i) => (
                          <div key={v.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-white/50 text-sm w-6">{i + 1}.</span>
                              <span className="text-white text-sm font-medium">{v.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-blue-500 text-sm">{v.count} insp</span>
                              {v.defects > 0 && (
                                <span className="text-red-400 text-xs">{v.defects} defects</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No inspection data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Asset Analytics Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-5 w-5 text-purple-400 shrink-0" />
                  <h2 className="dashboard-section-title">Asset analytics</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Asset Status */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Asset Status Distribution</h3>
                    {assetStatusBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={assetStatusBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {assetStatusBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No asset data</div>
                    )}
                  </div>

                  {/* Assets by Type */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Assets by type</h3>
                    {assetsByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={assetsByType} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis type="number" stroke="#888" />
                          <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#9B59B6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No asset data</div>
                    )}
                  </div>

                  {/* Asset Usage Actions */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Asset activity</h3>
                    {assetUsageByAction.length > 0 ? (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {assetUsageByAction.map((a, i) => (
                          <div key={a.name} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <span className="text-white text-sm capitalize">{a.name}</span>
                            <span className="text-purple-400 text-sm font-semibold">{a.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No activity data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Analytics Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-emerald-400 shrink-0" />
                  <h2 className="dashboard-section-title">User analytics</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Users by Role */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Team by role</h3>
                    {usersByRole.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={usersByRole}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {usersByRole.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No user data</div>
                    )}
                  </div>

                  {/* Top Active Users */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Most active users</h3>
                    {userActivity.length > 0 ? (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {userActivity.map((u, i) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-black font-bold text-sm">
                                {i + 1}
                              </div>
                              <span className="text-white text-sm font-medium">{u.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <div className="text-center">
                                <p className="text-blue-500 font-semibold">{u.inspections}</p>
                                <p className="text-white/50">inspections</p>
                              </div>
                              <div className="text-center">
                                <p className="text-purple-400 font-semibold">{u.actions}</p>
                                <p className="text-white/50">actions</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-white/50">No activity data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trends Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-5 w-5 text-cyan-400 shrink-0" />
                  <h2 className="dashboard-section-title">Trends & insights</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inspections Over Time */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Inspections Over Time</h3>
                    {inspectionsOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={inspectionsOverTime}>
                          <defs>
                            <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="count" stroke="#00D9FF" fill="url(#colorInsp)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-white/50">No data for selected period</div>
                    )}
                  </div>

                  {/* Defects Trend */}
                  <div className="dashboard-card p-6">
                    <h3 className="text-white font-semibold mb-4">Defects Trend</h3>
                    {defectsTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={defectsTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#888" />
                          <YAxis stroke="#888" />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                          <Legend />
                          <Bar dataKey="reported" fill="#FF6B6B" name="Reported" />
                          <Bar dataKey="resolved" fill="#6BCF7F" name="Resolved" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-white/50">No defect data for selected period</div>
                    )}
                  </div>
                </div>

                {/* Defects by Severity */}
                <div className="mt-6 dashboard-card p-6">
                  <h3 className="text-white font-semibold mb-4">Defects by Severity</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {defectsBySeverity.length > 0 ? (
                      defectsBySeverity.map((d, i) => (
                        <div 
                          key={d.name} 
                          className={`p-4 rounded-xl border ${
                            d.name === 'Critical' ? 'border-red-500/30 bg-red-500/10' :
                            d.name === 'High' ? 'border-orange-500/30 bg-orange-500/10' :
                            d.name === 'Medium' ? 'border-yellow-500/30 bg-yellow-500/10' :
                            'border-blue-500/30 bg-blue-500/10'
                          }`}
                        >
                          <p className={`text-3xl font-bold ${
                            d.name === 'Critical' ? 'text-red-400' :
                            d.name === 'High' ? 'text-orange-400' :
                            d.name === 'Medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            {d.value}
                          </p>
                          <p className="text-white/70 text-sm">{d.name} Severity</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 py-8 text-center text-white/50">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                        <p>No defects in selected period</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Statistics Table */}
              <div className="dashboard-card p-6">
                <h3 className="text-white font-semibold mb-4">Summary statistics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-white/70 text-sm font-medium">Metric</th>
                        <th className="px-4 py-3 text-white/70 text-sm font-medium">Total</th>
                        <th className="px-4 py-3 text-white/70 text-sm font-medium">Active</th>
                        <th className="px-4 py-3 text-white/70 text-sm font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="px-4 py-3 text-white">Fleet Vehicles</td>
                        <td className="px-4 py-3 text-white">{vehiclesCount ?? '—'}</td>
                        <td className="px-4 py-3 text-blue-500">{activeVehiclesCount ?? '—'}</td>
                        <td className="px-4 py-3 text-green-400">{fleetUtilization}%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white">Assets</td>
                        <td className="px-4 py-3 text-white">{assetsCount ?? '—'}</td>
                        <td className="px-4 py-3 text-blue-500">{activeAssetsCount ?? '—'}</td>
                        <td className="px-4 py-3 text-green-400">{assetUtilization}%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white">Inspections ({dateRange === 'all' ? 'All Time' : `Last ${dateRange} Days`})</td>
                        <td className="px-4 py-3 text-white">{inspections.length}</td>
                        <td className="px-4 py-3 text-blue-500">—</td>
                        <td className="px-4 py-3 text-cyan-400">{avgInspectionsPerDay}/day</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white">Defects</td>
                        <td className="px-4 py-3 text-white">{defectsCount ?? '—'}</td>
                        <td className="px-4 py-3 text-green-400">{resolvedDefectsCount ?? '—'} resolved</td>
                        <td className="px-4 py-3 text-green-400">{defectResolutionRate}% resolved</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white">Team Members</td>
                        <td className="px-4 py-3 text-white">{teamCount ?? '—'}</td>
                        <td className="px-4 py-3 text-blue-500">{userActivity.length} active</td>
                        <td className="px-4 py-3 text-cyan-400">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
