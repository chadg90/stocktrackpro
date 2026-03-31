'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Package, Truck, Users, Clock, Target, ArrowUpRight, ArrowDownRight, FileText, Filter } from 'lucide-react';
import { format, subDays, startOfDay, differenceInDays, eachDayOfInterval, parseISO } from 'date-fns';
import { activityHistoryStartFromDashboardRange, TOOL_HISTORY_ANALYTICS_CAP } from '@/lib/dvsaRetention';
import ExportButton from '../components/ExportButton';

type Profile = {
  id?: string;
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
};

type Asset = {
  id: string;
  name?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  type?: string;
  category?: string;
  status?: string;
  location?: string;
  condition?: string;
  notes?: string;
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
  resolved_by?: string;
  resolution_notes?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'resolved' | 'investigating';
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
  description?: string;
};

type HistoryItem = {
  id: string;
  tool_id?: string;
  vehicle_id?: string;
  action?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
  notes?: string;
  location?: string;
};

const COLORS = ['#2563eb', '#7c3aed', '#0f766e', '#ea580c', '#c026d3', '#0284c7', '#16a34a', '#475569'];
const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
};

const getDateValue = (value?: Timestamp | string): Date | null => {
  if (!value) return null;
  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate();
  }
  return new Date(value as string);
};

const formatDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    const date = getDateValue(value);
    return date ? date.toLocaleString() : '—';
  } catch {
    return '—';
  }
};

function getUserDisplayName(u: Profile | undefined, fallback = ''): string {
  if (!u) return fallback || 'Unknown';
  if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  if (u.display_name) return u.display_name.trim();
  if (u.displayName) return u.displayName;
  if (u.name) return u.name;
  if (u.email) return u.email.split('@')[0] || fallback || 'Unknown';
  return fallback || 'Unknown';
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'assets' | 'users'>('overview');
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile({ ...data, id: user.uid });
          if (data.company_id) {
            fetchAnalytics(data.company_id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (profile?.company_id) {
      fetchAnalytics(profile.company_id);
    }
  }, [dateRange, profile?.company_id]);

  const fetchAnalytics = async (companyId: string) => {
    if (!firebaseDb || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rangeStart = activityHistoryStartFromDashboardRange(dateRange);

      // Fetch vehicles
      const vehiclesQ = query(collection(firebaseDb, 'vehicles'), where('company_id', '==', companyId));
      const vehiclesSnap = await getDocs(vehiclesQ);
      setVehicles(vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));

      // Fetch assets
      const assetsQ = query(collection(firebaseDb, 'tools'), where('company_id', '==', companyId));
      const assetsSnap = await getDocs(assetsQ);
      setAssets(assetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Asset)));

      // Fetch users
      const usersQ = query(collection(firebaseDb, 'profiles'), where('company_id', '==', companyId));
      const usersSnap = await getDocs(usersQ);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Profile)));

      const inspectionsQuery = query(
        collection(firebaseDb, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        where('inspected_at', '>=', Timestamp.fromDate(rangeStart)),
        orderBy('inspected_at', 'desc')
      );

      try {
        const inspectionsSnap = await getDocs(inspectionsQuery);
        const inspectionsData = inspectionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
        setInspections(inspectionsData);
      } catch (inspError: any) {
        console.error('[Analytics] Error fetching inspections (may need Firestore index):', inspError);
        // If index error, try fallback query without orderBy
        if (inspError?.code === 'failed-precondition' || inspError?.message?.includes('index')) {
          console.warn('[Analytics] Missing Firestore index, using fallback query without orderBy');
          try {
            const fallbackQuery = query(
              collection(firebaseDb, 'vehicle_inspections'),
              where('company_id', '==', companyId)
            );
            const fallbackSnap = await getDocs(fallbackQuery);
            const inspectionsData = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
            setInspections(inspectionsData);
          } catch (fallbackError) {
            console.error('[Analytics] Fallback query also failed:', fallbackError);
            setInspections([]);
          }
        } else {
          // Other error, set empty array
          setInspections([]);
        }
      }

      const defectsQuery = query(
        collection(firebaseDb, 'vehicle_defects'),
        where('company_id', '==', companyId),
        where('reported_at', '>=', Timestamp.fromDate(rangeStart)),
        orderBy('reported_at', 'desc')
      );

      const defectsSnap = await getDocs(defectsQuery);
      setDefects(defectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Defect)));

      const historyQuery = query(
        collection(firebaseDb, 'tool_history'),
        where('company_id', '==', companyId),
        where('timestamp', '>=', Timestamp.fromDate(rangeStart)),
        orderBy('timestamp', 'desc'),
        limit(TOOL_HISTORY_ANALYTICS_CAP)
      );

      const historySnap = await getDocs(historyQuery);
      setHistoryItems(historySnap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem)));

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      if (err instanceof Error && err.message.includes('index')) {
        console.error('Firestore index missing. Create composite index for:', {
          collection: 'vehicle_inspections',
          fields: ['company_id', 'inspected_at']
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ANALYTICS COMPUTATIONS
  // ============================================

  // Daily activity breakdown
  const dailyActivity = useMemo(() => {
    const days = dateRange === 'all' ? 30 : parseInt(dateRange);
    const dateMap: Record<string, { inspections: number; defects: number; actions: number }> = {};
    
    // Initialize all dates
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    eachDayOfInterval({ start: startDate, end: endDate }).forEach(date => {
      const key = format(date, 'MMM dd');
      dateMap[key] = { inspections: 0, defects: 0, actions: 0 };
    });

    inspections.forEach(i => {
      const date = getDateValue(i.inspected_at);
      if (date) {
        const key = format(date, 'MMM dd');
        if (dateMap[key]) dateMap[key].inspections++;
      }
    });

    defects.forEach(d => {
      const date = getDateValue(d.reported_at);
      if (date) {
        const key = format(date, 'MMM dd');
        if (dateMap[key]) dateMap[key].defects++;
      }
    });

    historyItems.forEach(h => {
      const date = getDateValue(h.timestamp);
      if (date) {
        const key = format(date, 'MMM dd');
        if (dateMap[key]) dateMap[key].actions++;
      }
    });

    return Object.entries(dateMap).map(([date, data]) => ({ date, ...data }));
  }, [inspections, defects, historyItems, dateRange]);

  // Fleet health score
  const fleetHealthScore = useMemo(() => {
    const totalVehicles = vehicles.length;
    if (totalVehicles === 0) return 100;
    
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const pendingDefects = defects.filter(d => d.status !== 'resolved').length;
    const criticalDefects = defects.filter(d => d.severity === 'critical' && d.status !== 'resolved').length;
    
    let score = 100;
    score -= (pendingDefects * 5);
    score -= (criticalDefects * 15);
    score += ((activeVehicles / totalVehicles) * 20) - 20;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [vehicles, defects]);

  // Vehicle performance rankings
  const vehiclePerformance = useMemo(() => {
    const vehicleStats: Record<string, { 
      id: string; 
      name: string; 
      inspections: number; 
      defects: number; 
      resolved: number;
      score: number;
    }> = {};

    vehicles.forEach(v => {
      vehicleStats[v.id] = {
        id: v.id,
        name: v.registration || v.id,
        inspections: 0,
        defects: 0,
        resolved: 0,
        score: 100,
      };
    });

    // Debug: log vehicle IDs and inspection vehicle_ids
    if (inspections.length > 0) {
      console.log('[Analytics] Vehicle IDs:', vehicles.map(v => v.id));
      console.log('[Analytics] Inspection vehicle_ids:', inspections.map(i => i.vehicle_id));
    }

    inspections.forEach(i => {
      if (i.vehicle_id && vehicleStats[i.vehicle_id]) {
        vehicleStats[i.vehicle_id].inspections++;
      } else if (i.vehicle_id) {
        console.warn('[Analytics] Inspection has vehicle_id but no matching vehicle:', i.vehicle_id, 'Available vehicle IDs:', Object.keys(vehicleStats));
      }
    });

    defects.forEach(d => {
      if (d.vehicle_id && vehicleStats[d.vehicle_id]) {
        vehicleStats[d.vehicle_id].defects++;
        if (d.status === 'resolved') {
          vehicleStats[d.vehicle_id].resolved++;
        }
      }
    });

    // Calculate score
    Object.values(vehicleStats).forEach(v => {
      v.score = 100 - (v.defects * 10) + (v.resolved * 5);
      v.score = Math.max(0, Math.min(100, v.score));
    });

    return Object.values(vehicleStats)
      .sort((a, b) => {
        // Sort by inspections first (most active), then by score
        if (b.inspections !== a.inspections) {
          return b.inspections - a.inspections;
        }
        return b.score - a.score;
      });
    // Removed .slice(0, 10) to show all vehicles
  }, [vehicles, inspections, defects]);

  // User performance
  const userPerformance = useMemo(() => {
    const userStats: Record<string, {
      id: string;
      name: string;
      inspections: number;
      actions: number;
      defectsFound: number;
    }> = {};

    users.forEach(u => {
      // From profile: first_name + last_name > display_name > displayName > name > email prefix > Unknown
      let userName = 'Unknown';
      if (u.first_name || u.last_name) {
        userName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
      } else if (u.display_name) {
        userName = u.display_name.trim();
      } else if (u.displayName) {
        userName = u.displayName;
      } else if (u.name) {
        userName = u.name;
      } else if (u.email) {
        userName = u.email.split('@')[0];
      }
      if (!userName || !userName.trim()) userName = 'Unknown';

      userStats[u.id || ''] = {
        id: u.id || '',
        name: userName,
        inspections: 0,
        actions: 0,
        defectsFound: 0,
      };
    });

    inspections.forEach(i => {
      if (i.inspected_by && userStats[i.inspected_by]) {
        userStats[i.inspected_by].inspections++;
        if (i.has_defect) {
          userStats[i.inspected_by].defectsFound++;
        }
      }
    });

    historyItems.forEach(h => {
      if (h.user_id && userStats[h.user_id]) {
        userStats[h.user_id].actions++;
      }
    });

    return Object.values(userStats)
      .filter(u => u.inspections > 0 || u.actions > 0)
      .sort((a, b) => (b.inspections + b.actions) - (a.inspections + a.actions))
      .slice(0, 10);
  }, [users, inspections, historyItems]);

  // Defect resolution time
  const avgResolutionTime = useMemo(() => {
    const resolvedDefects = defects.filter(d => d.status === 'resolved' && d.reported_at && d.resolved_at);
    if (resolvedDefects.length === 0) return null;

    const totalDays = resolvedDefects.reduce((acc, d) => {
      const reported = getDateValue(d.reported_at);
      const resolved = getDateValue(d.resolved_at);
      if (reported && resolved) {
        return acc + differenceInDays(resolved, reported);
      }
      return acc;
    }, 0);

    return (totalDays / resolvedDefects.length).toFixed(1);
  }, [defects]);

  // Asset utilization by type
  const assetUtilizationByType = useMemo(() => {
    const typeMap: Record<string, { total: number; active: number }> = {};
    
    assets.forEach(a => {
      const type = a.type || 'Unknown';
      if (!typeMap[type]) typeMap[type] = { total: 0, active: 0 };
      typeMap[type].total++;
      if (a.status === 'active' || a.status === 'checked_out') {
        typeMap[type].active++;
      }
    });

    return Object.entries(typeMap).map(([name, data]) => ({
      name,
      total: data.total,
      active: data.active,
      rate: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0,
    }));
  }, [assets]);

  // Export data — summary tabs plus full registers for audits / weekly PDF
  const exportSheets = useMemo(() => {
    const vehicleRegister = vehicles.map((v) => ({
      'Vehicle ID': v.id,
      Registration: v.registration || '',
      Make: v.make || '',
      Model: v.model || '',
      Year: v.year ?? '',
      VIN: v.vin || '',
      Mileage: v.mileage ?? '',
      Status: v.status || '',
      Notes: v.notes || '',
    }));

    const assetRegister = assets.map((a) => ({
      'Asset ID': a.id,
      Name: a.name || '',
      Brand: a.brand || '',
      Model: a.model || '',
      'Serial Number': a.serial_number || '',
      Type: a.type || '',
      Category: a.category || '',
      Status: a.status || '',
      Location: a.location || '',
      Condition: a.condition || '',
      Notes: a.notes || '',
    }));

    const inspectionLog = inspections.map((i) => {
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
    });

    const defectLog = defects.map((d) => {
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
        'Reported By': getUserDisplayName(reporter, d.reported_by || ''),
        'Resolved At': formatDate(d.resolved_at),
        'Resolved By': d.resolved_by || '',
        'Resolution Notes': d.resolution_notes || '',
      };
    });

    const historyLog = historyItems.map((h) => {
      const asset = assets.find((x) => x.id === h.tool_id);
      const actor = users.find((u) => u.id === h.user_id);
      return {
        'Record ID': h.id,
        Timestamp: formatDate(h.timestamp),
        Action: h.action || '',
        'Asset ID': h.tool_id || '',
        'Asset Name': asset?.name || '',
        Location: h.location || '',
        Notes: h.notes || '',
        User: getUserDisplayName(actor, h.user_id || ''),
      };
    });

    const teamExport = users.map((u) => ({
      'User ID': u.id || '',
      Name: getUserDisplayName(u, ''),
      Email: u.email || '',
      Role: u.role || '',
      'Last Login': formatDate(u.last_login),
    }));

    return [
      {
        name: 'Daily Activity',
        data: dailyActivity,
        fieldMappings: { date: 'Date', inspections: 'Inspections', defects: 'Defects Reported', actions: 'Asset Actions' },
      },
      {
        name: 'Vehicle Performance',
        data: vehiclePerformance.map((v) => ({
          Vehicle: v.name,
          Inspections: v.inspections,
          Defects: v.defects,
          Resolved: v.resolved,
          'Health Score': v.score,
        })),
      },
      {
        name: 'User Performance',
        data: userPerformance.map((u) => ({
          User: u.name,
          Inspections: u.inspections,
          'Asset Actions': u.actions,
          'Defects Found': u.defectsFound,
        })),
      },
      {
        name: 'Asset Utilization',
        data: assetUtilizationByType.map((a) => ({
          Type: a.name,
          Total: a.total,
          Active: a.active,
          'Utilization Rate': `${a.rate}%`,
        })),
      },
      { name: 'Vehicles Register', data: vehicleRegister },
      { name: 'Assets Register', data: assetRegister },
      { name: 'Team', data: teamExport },
      { name: 'Inspections Log', data: inspectionLog },
      { name: 'Defects Log', data: defectLog },
      { name: 'Asset History', data: historyLog },
    ];
  }, [
    dailyActivity,
    vehiclePerformance,
    userPerformance,
    assetUtilizationByType,
    vehicles,
    assets,
    users,
    inspections,
    defects,
    historyItems,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex flex-wrap items-center justify-between gap-2 no-print dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100"
          role="alert"
        >
          <span>{error}</span>
          {profile?.company_id && (
            <button
              type="button"
              onClick={() => { setError(null); fetchAnalytics(profile.company_id!); }}
              className="text-blue-600 hover:underline font-medium whitespace-nowrap dark:text-blue-400"
            >
              Try again
            </button>
          )}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-bold text-white">Detailed Reports</h1>
          <p className="text-white/70 text-sm mt-1">
            {dateRange === 'all' ? 'All-time metrics and exportable reports' : `Last ${dateRange} days — change period above to see different ranges`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1 dark:border-blue-500/30 dark:bg-black">
            {['7', '30', '90', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as '7' | '30' | '90' | 'all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-500 text-white keep-light-on-dark'
                    : 'text-zinc-700 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white'
                }`}
              >
                {range === 'all' ? 'All' : `${range}d`}
              </button>
            ))}
          </div>
          <ExportButton
            data={dailyActivity}
            filename={`stp-analytics-export-${format(new Date(), 'yyyy-MM-dd')}`}
            reportTitle={`Stock Track PRO — Analytics data export (${format(new Date(), 'PPP')}) · Range: ${dateRange === 'all' ? 'All time' : `Last ${dateRange} days`}`}
            pdfMeta={{ organization: profile?.company_name }}
            multiSheetData={exportSheets}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-print">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'fleet', label: 'Fleet Details', icon: Truck },
          { id: 'assets', label: 'Asset Details', icon: Package },
          { id: 'users', label: 'User Details', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white keep-light-on-dark'
                : 'border border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-100 dark:border-blue-500/30 dark:bg-black dark:text-white/70 dark:hover:border-blue-500/50 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Health Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-black border border-blue-500/25 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Fleet Health</h3>
                <div className={`text-2xl font-bold ${fleetHealthScore >= 80 ? 'text-green-300' : fleetHealthScore >= 60 ? 'text-amber-300' : 'text-red-300'}`}>
                  {fleetHealthScore}%
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${fleetHealthScore >= 80 ? 'bg-green-300' : fleetHealthScore >= 60 ? 'bg-amber-300' : 'bg-red-300'}`}
                  style={{ width: `${fleetHealthScore}%` }}
                />
              </div>
            </div>

            <div className="bg-black border border-blue-500/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Total Inspections</h3>
              <p className="text-3xl font-bold text-blue-500">{inspections.length}</p>
              <p className="text-white/50 text-sm">{dateRange === 'all' ? 'all time' : `last ${dateRange} days`}</p>
            </div>

            <div className="bg-black border border-blue-500/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Active Defects</h3>
              <p className="text-3xl font-bold text-red-400">{defects.filter(d => d.status !== 'resolved').length}</p>
              <p className="text-white/50 text-sm">{dateRange === 'all' ? 'all time' : `last ${dateRange} days`}</p>
            </div>

            <div className="bg-black border border-blue-500/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Avg Resolution Time</h3>
              <p className="text-3xl font-bold text-cyan-400">{avgResolutionTime || '—'}</p>
              <p className="text-white/50 text-sm">days to resolve</p>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-black border border-blue-500/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Daily Activity Overview</h3>
            {dailyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailyActivity}>
                  <defs>
                    <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDef" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B59B6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9B59B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="inspections" stroke="#3b82f6" fill="url(#colorInsp)" name="Inspections" />
                  <Area type="monotone" dataKey="defects" stroke="#64748b" fill="url(#colorDef)" name="Defects" />
                  <Area type="monotone" dataKey="actions" stroke="#9B59B6" fill="url(#colorAct)" name="Asset Actions" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-white/50">No data for selected period</div>
            )}
          </div>
        </div>
      )}

      {/* Fleet Tab */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Vehicle Performance Rankings */}
          <div className="bg-black border border-blue-500/25 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Vehicle Performance Rankings</h3>
              {vehiclePerformance.length > 0 && (
                <span className="text-white/50 text-sm">
                  Showing {vehiclePerformance.length} {vehiclePerformance.length === 1 ? 'vehicle' : 'vehicles'}
                </span>
              )}
            </div>
            {vehiclePerformance.length === 0 ? (
              <div className="py-8 text-center text-white/50">
                No vehicles found. Add vehicles in the Fleet page.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-white/70 text-sm">Rank</th>
                      <th className="px-4 py-3 text-left text-white/70 text-sm">Vehicle</th>
                      <th className="px-4 py-3 text-right text-white/70 text-sm">Inspections</th>
                      <th className="px-4 py-3 text-right text-white/70 text-sm">Defects</th>
                      <th className="px-4 py-3 text-right text-white/70 text-sm">Resolved</th>
                      <th className="px-4 py-3 text-right text-white/70 text-sm">Health Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vehiclePerformance.map((v, i) => (
                    <tr key={v.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500 text-black' :
                          i === 1 ? 'bg-gray-300 text-black' :
                          i === 2 ? 'bg-blue-400 text-white' :
                          'bg-white/10 text-white'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{v.name}</td>
                      <td className="px-4 py-3 text-right text-blue-300">{v.inspections}</td>
                      <td className="px-4 py-3 text-right text-red-300">{v.defects}</td>
                      <td className="px-4 py-3 text-right text-green-300">{v.resolved}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${
                          v.score >= 80 ? 'text-green-300' :
                          v.score >= 60 ? 'text-amber-300' :
                          'text-red-300'
                        }`}>
                          {v.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Defect Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black border border-blue-500/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Defects by Severity</h3>
              {defects.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critical', value: defects.filter(d => d.severity === 'critical').length, color: SEVERITY_COLORS.critical },
                        { name: 'High', value: defects.filter(d => d.severity === 'high').length, color: SEVERITY_COLORS.high },
                        { name: 'Medium', value: defects.filter(d => d.severity === 'medium').length, color: SEVERITY_COLORS.medium },
                        { name: 'Low', value: defects.filter(d => d.severity === 'low' || !d.severity).length, color: SEVERITY_COLORS.low },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[
                        { name: 'Critical', value: defects.filter(d => d.severity === 'critical').length, color: SEVERITY_COLORS.critical },
                        { name: 'High', value: defects.filter(d => d.severity === 'high').length, color: SEVERITY_COLORS.high },
                        { name: 'Medium', value: defects.filter(d => d.severity === 'medium').length, color: SEVERITY_COLORS.medium },
                        { name: 'Low', value: defects.filter(d => d.severity === 'low' || !d.severity).length, color: SEVERITY_COLORS.low },
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
                    <p>No defects in selected period</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black border border-blue-500/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Defect Status</h3>
              {defects.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Pending', value: defects.filter(d => d.status === 'pending').length },
                    { name: 'Investigating', value: defects.filter(d => d.status === 'investigating').length },
                    { name: 'Resolved', value: defects.filter(d => d.status === 'resolved').length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-white/50">No defect data</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Asset Utilization by Type */}
          <div className="bg-black border border-blue-500/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Asset Utilization by Type</h3>
            {assetUtilizationByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetUtilizationByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} 
                    formatter={(value, name) => [`${value}%`, 'Utilization Rate']}
                  />
                  <Bar dataKey="rate" fill="#9B59B6" name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">No asset data</div>
            )}
          </div>

          {/* Asset Details Table */}
          <div className="bg-black border border-blue-500/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Asset Type Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white/70 text-sm">Type</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Total</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Active</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assetUtilizationByType.map((a) => (
                    <tr key={a.name} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                      <td className="px-4 py-3 text-right text-white">{a.total}</td>
                      <td className="px-4 py-3 text-right text-blue-300">{a.active}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${
                          a.rate >= 70 ? 'text-green-300' :
                          a.rate >= 40 ? 'text-amber-300' :
                          'text-red-300'
                        }`}>
                          {a.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Performance Table */}
          <div className="bg-black border border-blue-500/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">User Activity Rankings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white/70 text-sm">Rank</th>
                    <th className="px-4 py-3 text-left text-white/70 text-sm">User</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Inspections</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Asset Actions</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Defects Found</th>
                    <th className="px-4 py-3 text-right text-white/70 text-sm">Total Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {userPerformance.map((u, i) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500 text-black' :
                          i === 1 ? 'bg-gray-300 text-black' :
                          i === 2 ? 'bg-blue-400 text-white' :
                          'bg-white/10 text-white'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-right text-blue-300">{u.inspections}</td>
                      <td className="px-4 py-3 text-right text-purple-400">{u.actions}</td>
                      <td className="px-4 py-3 text-right text-amber-300">{u.defectsFound}</td>
                      <td className="px-4 py-3 text-right text-white font-semibold">{u.inspections + u.actions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Activity Chart */}
          <div className="bg-black border border-blue-500/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">User Activity Comparison</h3>
            {userPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userPerformance.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="inspections" fill="#3b82f6" name="Inspections" />
                  <Bar dataKey="actions" fill="#9B59B6" name="Asset Actions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">No user activity data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
