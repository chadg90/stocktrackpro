'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Package, Truck, Users, Clock, Target, ArrowUpRight, ArrowDownRight, FileText, Filter } from 'lucide-react';
import { format, subDays, startOfDay, differenceInDays, eachDayOfInterval, parseISO } from 'date-fns';
import ExportButton from '../components/ExportButton';
import PrintButton from '../components/PrintButton';

type Profile = {
  id?: string;
  company_id?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  displayName?: string;
  name?: string;
  email?: string;
  created_at?: Timestamp | string;
};

type Vehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
  status?: string;
  mileage?: number;
};

type Asset = {
  id: string;
  name?: string;
  type?: string;
  status?: string;
};

type Inspection = {
  id: string;
  vehicle_id?: string;
  inspected_at?: Timestamp | string;
  has_defect?: boolean;
  inspected_by?: string;
  mileage?: number;
};

type Defect = {
  id: string;
  vehicle_id?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'resolved' | 'investigating';
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
  description?: string;
};

type HistoryItem = {
  id: string;
  tool_id?: string;
  action?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
};

const COLORS = ['#00D9FF', '#FF6B6B', '#FFD93D', '#6BCF7F', '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71'];
const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#3B82F6',
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

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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
    try {
      const now = new Date();
      let startDate: Date | null = null;
      
      if (dateRange !== 'all') {
        startDate = startOfDay(subDays(now, parseInt(dateRange)));
      }

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

      // Fetch inspections with date filter
      let inspectionsQuery;
      if (startDate) {
        inspectionsQuery = query(
          collection(firebaseDb, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', Timestamp.fromDate(startDate)),
          orderBy('inspected_at', 'desc')
        );
      } else {
        inspectionsQuery = query(
          collection(firebaseDb, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          orderBy('inspected_at', 'desc')
        );
      }
      
      try {
        const inspectionsSnap = await getDocs(inspectionsQuery);
        let inspectionsData = inspectionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
        
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
            const aDate = getDateValue(a.inspected_at);
            const bDate = getDateValue(b.inspected_at);
            if (!aDate && !bDate) return 0;
            if (!aDate) return 1;
            if (!bDate) return -1;
            return bDate.getTime() - aDate.getTime();
          });
          filteredInspections.push(...userInspections.slice(0, 8));
        });
        
        console.log('[Analytics] Fetched inspections:', inspectionsData.length, 'Filtered to 8 per user:', filteredInspections.length);
        setInspections(filteredInspections);
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
            let inspectionsData = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as Inspection));
            
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
                const aDate = getDateValue(a.inspected_at);
                const bDate = getDateValue(b.inspected_at);
                if (!aDate && !bDate) return 0;
                if (!aDate) return 1;
                if (!bDate) return -1;
                return bDate.getTime() - aDate.getTime();
              });
              filteredInspections.push(...userInspections.slice(0, 8));
            });
            
            console.log('[Analytics] Fetched inspections (fallback, no orderBy):', inspectionsData.length, 'Filtered to 8 per user:', filteredInspections.length);
            setInspections(filteredInspections);
          } catch (fallbackError) {
            console.error('[Analytics] Fallback query also failed:', fallbackError);
            setInspections([]);
          }
        } else {
          // Other error, set empty array
          setInspections([]);
        }
      }

      // Fetch defects
      let defectsQuery = query(
        collection(firebaseDb, 'vehicle_defects'),
        where('company_id', '==', companyId),
        orderBy('reported_at', 'desc')
      );
      
      if (startDate) {
        defectsQuery = query(
          collection(firebaseDb, 'vehicle_defects'),
          where('company_id', '==', companyId),
          where('reported_at', '>=', Timestamp.fromDate(startDate)),
          orderBy('reported_at', 'desc')
        );
      }
      
      const defectsSnap = await getDocs(defectsQuery);
      setDefects(defectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Defect)));

      // Fetch history
      let historyQuery = query(
        collection(firebaseDb, 'tool_history'),
        where('company_id', '==', companyId),
        orderBy('timestamp', 'desc')
      );
      
      if (startDate) {
        historyQuery = query(
          collection(firebaseDb, 'tool_history'),
          where('company_id', '==', companyId),
          where('timestamp', '>=', Timestamp.fromDate(startDate)),
          orderBy('timestamp', 'desc')
        );
      }
      
      const historySnap = await getDocs(historyQuery);
      setHistoryItems(historySnap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryItem)));

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // If it's an index error, log it clearly
      if (error instanceof Error && error.message.includes('index')) {
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
      // Name only: first_name + last_name > displayName > name > Unknown (never show email)
      let userName = 'Unknown';
      if (u.first_name || u.last_name) {
        userName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
      } else if (u.displayName) {
        userName = u.displayName;
      } else if (u.name) {
        userName = u.name;
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

  // Export data
  const exportSheets = useMemo(() => [
    {
      name: 'Daily Activity',
      data: dailyActivity,
      fieldMappings: { date: 'Date', inspections: 'Inspections', defects: 'Defects Reported', actions: 'Asset Actions' },
    },
    {
      name: 'Vehicle Performance',
      data: vehiclePerformance.map(v => ({
        Vehicle: v.name,
        Inspections: v.inspections,
        Defects: v.defects,
        Resolved: v.resolved,
        'Health Score': v.score,
      })),
    },
    {
      name: 'User Performance',
      data: userPerformance.map(u => ({
        User: u.name,
        Inspections: u.inspections,
        'Asset Actions': u.actions,
        'Defects Found': u.defectsFound,
      })),
    },
    {
      name: 'Asset Utilization',
      data: assetUtilizationByType.map(a => ({
        Type: a.name,
        Total: a.total,
        Active: a.active,
        'Utilization Rate': `${a.rate}%`,
      })),
    },
  ], [dailyActivity, vehiclePerformance, userPerformance, assetUtilizationByType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div id="detailed-analytics" className="print-content">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-bold text-white">Detailed Reports</h1>
          <p className="text-white/70 text-sm mt-1">
            {dateRange === 'all' ? 'All-time metrics and exportable reports' : `Last ${dateRange} days — change period above to see different ranges`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-black border border-primary/30 rounded-lg p-1">
            {['7', '30', '90', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as '7' | '30' | '90' | 'all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-primary text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All' : `${range}d`}
              </button>
            ))}
          </div>
          <ExportButton
            data={dailyActivity}
            filename={`detailed-analytics-${format(new Date(), 'yyyy-MM-dd')}`}
            multiSheetData={exportSheets}
          />
          <PrintButton title="Detailed Analytics Report" contentId="detailed-analytics" />
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
                ? 'bg-primary text-black'
                : 'bg-black border border-primary/30 text-white/70 hover:text-white hover:border-primary/50'
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
            <div className="bg-black border border-primary/25 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Fleet Health</h3>
                <div className={`text-2xl font-bold ${fleetHealthScore >= 80 ? 'text-green-400' : fleetHealthScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {fleetHealthScore}%
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${fleetHealthScore >= 80 ? 'bg-green-400' : fleetHealthScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${fleetHealthScore}%` }}
                />
              </div>
            </div>

            <div className="bg-black border border-primary/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Total Inspections</h3>
              <p className="text-3xl font-bold text-primary">{inspections.length}</p>
              <p className="text-white/50 text-sm">{dateRange === 'all' ? 'all time' : `last ${dateRange} days`}</p>
            </div>

            <div className="bg-black border border-primary/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Active Defects</h3>
              <p className="text-3xl font-bold text-red-400">{defects.filter(d => d.status !== 'resolved').length}</p>
              <p className="text-white/50 text-sm">{dateRange === 'all' ? 'all time' : `last ${dateRange} days`}</p>
            </div>

            <div className="bg-black border border-primary/25 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Avg Resolution Time</h3>
              <p className="text-3xl font-bold text-cyan-400">{avgResolutionTime || '—'}</p>
              <p className="text-white/50 text-sm">days to resolve</p>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-black border border-primary/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Daily Activity Overview</h3>
            {dailyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailyActivity}>
                  <defs>
                    <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDef" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B59B6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9B59B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="inspections" stroke="#00D9FF" fill="url(#colorInsp)" name="Inspections" />
                  <Area type="monotone" dataKey="defects" stroke="#FF6B6B" fill="url(#colorDef)" name="Defects" />
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
          <div className="bg-black border border-primary/25 rounded-xl p-6">
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
                          i === 2 ? 'bg-orange-400 text-black' :
                          'bg-white/10 text-white'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{v.name}</td>
                      <td className="px-4 py-3 text-right text-primary">{v.inspections}</td>
                      <td className="px-4 py-3 text-right text-red-400">{v.defects}</td>
                      <td className="px-4 py-3 text-right text-green-400">{v.resolved}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${
                          v.score >= 80 ? 'text-green-400' :
                          v.score >= 60 ? 'text-yellow-400' :
                          'text-red-400'
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
            <div className="bg-black border border-primary/25 rounded-xl p-6">
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
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
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

            <div className="bg-black border border-primary/25 rounded-xl p-6">
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
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#00D9FF" />
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
          <div className="bg-black border border-primary/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Asset Utilization by Type</h3>
            {assetUtilizationByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetUtilizationByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#888" width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} 
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
          <div className="bg-black border border-primary/25 rounded-xl p-6">
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
                      <td className="px-4 py-3 text-right text-primary">{a.active}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${
                          a.rate >= 70 ? 'text-green-400' :
                          a.rate >= 40 ? 'text-yellow-400' :
                          'text-red-400'
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
          <div className="bg-black border border-primary/25 rounded-xl p-6">
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
                          i === 2 ? 'bg-orange-400 text-black' :
                          'bg-white/10 text-white'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-right text-primary">{u.inspections}</td>
                      <td className="px-4 py-3 text-right text-purple-400">{u.actions}</td>
                      <td className="px-4 py-3 text-right text-yellow-400">{u.defectsFound}</td>
                      <td className="px-4 py-3 text-right text-white font-semibold">{u.inspections + u.actions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Activity Chart */}
          <div className="bg-black border border-primary/25 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">User Activity Comparison</h3>
            {userPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userPerformance.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="inspections" fill="#00D9FF" name="Inspections" />
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
