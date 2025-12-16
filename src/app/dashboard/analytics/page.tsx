'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Package, Truck } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import ExportButton from '../components/ExportButton';

type Profile = {
  company_id?: string;
  role?: string;
};

type Inspection = {
  id: string;
  vehicle_id?: string;
  inspected_at?: Timestamp | string;
  has_defect?: boolean;
};

type Defect = {
  id: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'resolved' | 'investigating';
  reported_at?: Timestamp | string;
};

type HistoryItem = {
  id: string;
  action?: string;
  timestamp?: Timestamp | string;
};

const COLORS = ['#00D9FF', '#FF6B6B', '#FFD93D', '#6BCF7F', '#9B59B6'];

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');
  
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  const [inspectionsCount, setInspectionsCount] = useState(0);
  const [defectsResolved, setDefectsResolved] = useState(0);
  const [defectsPending, setDefectsPending] = useState(0);
  const [assetsCheckedOut, setAssetsCheckedOut] = useState(0);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const { doc, getDoc } = await import('firebase/firestore');
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
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

      // Fetch inspections
      let inspectionsQuery = query(
        collection(firebaseDb, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        orderBy('inspected_at', 'desc')
      );
      
      if (startDate) {
        inspectionsQuery = query(
          collection(firebaseDb, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', Timestamp.fromDate(startDate)),
          orderBy('inspected_at', 'desc')
        );
      }
      
      const inspectionsSnap = await getDocs(inspectionsQuery);
      const inspectionsData = inspectionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Inspection));
      setInspections(inspectionsData);
      setInspectionsCount(inspectionsData.length);

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
      const defectsData = defectsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Defect));
      setDefects(defectsData);
      setDefectsResolved(defectsData.filter(d => d.status === 'resolved').length);
      setDefectsPending(defectsData.filter(d => d.status !== 'resolved').length);

      // Fetch history for asset checkouts
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
      const historyData = historySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HistoryItem));
      setHistoryItems(historyData);
      setAssetsCheckedOut(historyData.filter(h => h.action?.toLowerCase().includes('checkout') || h.action?.toLowerCase().includes('out')).length);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const inspectionsByDate = React.useMemo(() => {
    const dateMap: Record<string, number> = {};
    inspections.forEach(insp => {
      let date: Date;
      if (insp.inspected_at instanceof Timestamp) {
        date = insp.inspected_at.toDate();
      } else if (insp.inspected_at) {
        date = new Date(insp.inspected_at);
      } else {
        return;
      }
      const dateKey = format(date, 'MMM dd');
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });
    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [inspections]);

  const defectsBySeverity = React.useMemo(() => {
    const severityMap: Record<string, number> = {};
    defects.forEach(defect => {
      const severity = defect.severity || 'low';
      severityMap[severity] = (severityMap[severity] || 0) + 1;
    });
    return Object.entries(severityMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [defects]);

  const assetUsage = React.useMemo(() => {
    const actionMap: Record<string, number> = {};
    historyItems.forEach(item => {
      const action = item.action || 'unknown';
      actionMap[action] = (actionMap[action] || 0) + 1;
    });
    return Object.entries(actionMap)
      .slice(0, 5) // Top 5 actions
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [historyItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-white/70 text-sm mt-1">Insights into your fleet and asset management</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7' | '30' | '90' | 'all')}
            className="bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-black border border-primary/25 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Inspections</p>
              <p className="text-white text-2xl font-semibold mt-1">{inspectionsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-black border border-primary/25 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Defects Resolved</p>
              <p className="text-white text-2xl font-semibold mt-1">{defectsResolved}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-black border border-primary/25 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Defects Pending</p>
              <p className="text-white text-2xl font-semibold mt-1">{defectsPending}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-black border border-primary/25 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Assets Checked Out</p>
              <p className="text-white text-2xl font-semibold mt-1">{assetsCheckedOut}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inspections Over Time */}
        <div className="bg-black border border-primary/25 rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Inspections Over Time</h3>
          {inspectionsByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inspectionsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#00D9FF" strokeWidth={2} name="Inspections" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-white/50">
              No inspection data available
            </div>
          )}
        </div>

        {/* Defects by Severity */}
        <div className="bg-black border border-primary/25 rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Defects by Severity</h3>
          {defectsBySeverity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defectsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {defectsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-white/50">
              No defect data available
            </div>
          )}
        </div>

        {/* Asset Usage */}
        <div className="bg-black border border-primary/25 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Asset Usage Frequency</h3>
            <ExportButton
              data={assetUsage}
              filename="asset-usage"
              fieldMappings={{
                name: 'Action',
                value: 'Count',
              }}
            />
          </div>
          {assetUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #00D9FF', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#00D9FF" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-white/50">
              No asset usage data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
