'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Timestamp } from 'firebase/firestore';
import { differenceInDays, eachDayOfInterval, format, subDays } from 'date-fns';
import {
  CheckCircle,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import ChartErrorBoundary from './ChartErrorBoundary';

// Recharts is heavy — load it client-side only.
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
};

type Vehicle = {
  id: string;
  registration?: string;
  status?: string;
};

type Asset = {
  id: string;
  type?: string;
  status?: string;
};

type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  displayName?: string;
  name?: string;
  email?: string;
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
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'resolved' | 'investigating';
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
};

type HistoryItem = {
  id: string;
  tool_id?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
};

export type DashboardDetailedViewProps = {
  vehicles: Vehicle[];
  assets: Asset[];
  users: Profile[];
  inspections: Inspection[];
  defects: Defect[];
  historyItems: HistoryItem[];
  rangeSpanDays: number;
  rangeLabel: string;
};

const getDateValue = (value?: Timestamp | string): Date | null => {
  if (!value) return null;
  if (typeof value === 'object' && 'toDate' in value) return value.toDate();
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? null : d;
};

const getUserDisplayName = (u: Profile | undefined, fallback = 'Unknown'): string => {
  if (!u) return fallback;
  if (u.first_name || u.last_name)
    return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  if (u.display_name) return u.display_name.trim();
  if (u.displayName) return u.displayName;
  if (u.name) return u.name;
  if (u.email) return u.email.split('@')[0];
  return fallback;
};

export default function DashboardDetailedView({
  vehicles,
  assets,
  users,
  inspections,
  defects,
  historyItems,
  rangeSpanDays,
  rangeLabel,
}: DashboardDetailedViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'users'>(
    'overview'
  );

  const dailyActivity = useMemo(() => {
    const days = Math.min(rangeSpanDays, 180);
    const dateMap: Record<
      string,
      { inspections: number; defects: number; actions: number }
    > = {};
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    eachDayOfInterval({ start: startDate, end: endDate }).forEach((date) => {
      dateMap[format(date, 'MMM dd')] = { inspections: 0, defects: 0, actions: 0 };
    });
    inspections.forEach((i) => {
      const d = getDateValue(i.inspected_at);
      if (!d) return;
      const k = format(d, 'MMM dd');
      if (dateMap[k]) dateMap[k].inspections++;
    });
    defects.forEach((x) => {
      const d = getDateValue(x.reported_at);
      if (!d) return;
      const k = format(d, 'MMM dd');
      if (dateMap[k]) dateMap[k].defects++;
    });
    historyItems.forEach((h) => {
      const d = getDateValue(h.timestamp);
      if (!d) return;
      const k = format(d, 'MMM dd');
      if (dateMap[k]) dateMap[k].actions++;
    });
    return Object.entries(dateMap).map(([date, data]) => ({ date, ...data }));
  }, [inspections, defects, historyItems, rangeSpanDays]);

  const fleetHealthScore = useMemo(() => {
    const total = vehicles.length;
    if (total === 0) return 100;
    const active = vehicles.filter((v) => v.status === 'active').length;
    const pending = defects.filter((d) => d.status !== 'resolved').length;
    const critical = defects.filter(
      (d) => d.severity === 'critical' && d.status !== 'resolved'
    ).length;
    let score = 100;
    score -= pending * 5;
    score -= critical * 15;
    score += (active / total) * 20 - 20;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [vehicles, defects]);

  const avgResolutionTime = useMemo(() => {
    const resolved = defects.filter(
      (d) => d.status === 'resolved' && d.reported_at && d.resolved_at
    );
    if (resolved.length === 0) return null;
    const total = resolved.reduce((acc, d) => {
      const r = getDateValue(d.reported_at);
      const f = getDateValue(d.resolved_at);
      return r && f ? acc + differenceInDays(f, r) : acc;
    }, 0);
    return (total / resolved.length).toFixed(1);
  }, [defects]);

  const vehiclePerformance = useMemo(() => {
    const stats: Record<
      string,
      {
        id: string;
        name: string;
        inspections: number;
        defects: number;
        resolved: number;
        score: number;
      }
    > = {};
    vehicles.forEach((v) => {
      stats[v.id] = {
        id: v.id,
        name: v.registration || v.id,
        inspections: 0,
        defects: 0,
        resolved: 0,
        score: 100,
      };
    });
    inspections.forEach((i) => {
      if (i.vehicle_id && stats[i.vehicle_id]) stats[i.vehicle_id].inspections++;
    });
    defects.forEach((d) => {
      if (d.vehicle_id && stats[d.vehicle_id]) {
        stats[d.vehicle_id].defects++;
        if (d.status === 'resolved') stats[d.vehicle_id].resolved++;
      }
    });
    Object.values(stats).forEach((v) => {
      v.score = Math.max(0, Math.min(100, 100 - v.defects * 10 + v.resolved * 5));
    });
    return Object.values(stats).sort((a, b) =>
      b.inspections !== a.inspections ? b.inspections - a.inspections : b.score - a.score
    );
  }, [vehicles, inspections, defects]);

  const userPerformance = useMemo(() => {
    const stats: Record<
      string,
      { id: string; name: string; inspections: number; actions: number; defectsFound: number }
    > = {};
    users.forEach((u) => {
      stats[u.id] = {
        id: u.id,
        name: getUserDisplayName(u),
        inspections: 0,
        actions: 0,
        defectsFound: 0,
      };
    });
    inspections.forEach((i) => {
      if (i.inspected_by && stats[i.inspected_by]) {
        stats[i.inspected_by].inspections++;
        if (i.has_defect) stats[i.inspected_by].defectsFound++;
      }
    });
    historyItems.forEach((h) => {
      if (h.user_id && stats[h.user_id]) stats[h.user_id].actions++;
    });
    return Object.values(stats)
      .filter((u) => u.inspections > 0 || u.actions > 0)
      .sort((a, b) => b.inspections + b.actions - (a.inspections + a.actions))
      .slice(0, 10);
  }, [users, inspections, historyItems]);

  const assetUtilizationByType = useMemo(() => {
    const typeMap: Record<string, { total: number; active: number }> = {};
    assets.forEach((a) => {
      const type = a.type || 'Unknown';
      if (!typeMap[type]) typeMap[type] = { total: 0, active: 0 };
      typeMap[type].total++;
      if (a.status === 'active' || a.status === 'checked_out') typeMap[type].active++;
    });
    return Object.entries(typeMap).map(([name, data]) => ({
      name,
      total: data.total,
      active: data.active,
      rate: data.total > 0 ? Math.round((data.active / data.total) * 100) : 0,
    }));
  }, [assets]);

  const defectsBySeverity = useMemo(
    () =>
      [
        { name: 'Critical', value: defects.filter((d) => d.severity === 'critical').length, color: SEVERITY_COLORS.critical },
        { name: 'High', value: defects.filter((d) => d.severity === 'high').length, color: SEVERITY_COLORS.high },
        { name: 'Medium', value: defects.filter((d) => d.severity === 'medium').length, color: SEVERITY_COLORS.medium },
        { name: 'Low', value: defects.filter((d) => d.severity === 'low' || !d.severity).length, color: SEVERITY_COLORS.low },
      ].filter((d) => d.value > 0),
    [defects]
  );

  const defectStatusData = useMemo(
    () => [
      { name: 'Pending', value: defects.filter((d) => d.status === 'pending').length },
      { name: 'Investigating', value: defects.filter((d) => d.status === 'investigating').length },
      { name: 'Resolved', value: defects.filter((d) => d.status === 'resolved').length },
    ],
    [defects]
  );

  const tooltipStyle = {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    border: '1px solid rgba(59,130,246,0.4)',
    borderRadius: 8,
    color: '#fff',
  } as const;

  const rankBadge = (i: number) =>
    `inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
      i === 0
        ? 'bg-yellow-400 text-zinc-900'
        : i === 1
        ? 'bg-zinc-300 text-zinc-900'
        : i === 2
        ? 'bg-blue-400 text-white keep-light-on-dark'
        : 'bg-zinc-200 text-zinc-800 dark:bg-white/10 dark:text-white'
    }`;

  const scoreText = (score: number) =>
    score >= 80
      ? 'text-green-700 dark:text-green-300'
      : score >= 60
      ? 'text-amber-700 dark:text-amber-300'
      : 'text-red-700 dark:text-red-300';

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-print">
        {(
          [
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'fleet', label: 'Fleet details', icon: Truck },
            { id: 'users', label: 'User details', icon: Users },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border ${
              activeTab === tab.id
                ? 'bg-blue-600 border-blue-600 text-white keep-light-on-dark dark:bg-blue-500 dark:border-blue-500'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:border-blue-500/30 dark:bg-black dark:text-white/70 dark:hover:border-blue-500/50 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Fleet health</h3>
                <div className={`text-2xl font-bold ${scoreText(fleetHealthScore)}`}>
                  {fleetHealthScore}%
                </div>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    fleetHealthScore >= 80
                      ? 'bg-green-500'
                      : fleetHealthScore >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${fleetHealthScore}%` }}
                />
              </div>
            </div>

            <div className="dashboard-card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Total inspections
              </h3>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                {inspections.length}
              </p>
              <p className="text-zinc-500 dark:text-white/50 text-sm">{rangeLabel}</p>
            </div>

            <div className="dashboard-card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Active defects</h3>
              <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                {defects.filter((d) => d.status !== 'resolved').length}
              </p>
              <p className="text-zinc-500 dark:text-white/50 text-sm">{rangeLabel}</p>
            </div>

            <div className="dashboard-card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                Avg resolution time
              </h3>
              <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">
                {avgResolutionTime ?? '—'}
              </p>
              <p className="text-zinc-500 dark:text-white/50 text-sm">days to resolve</p>
            </div>
          </div>

          <div className="dashboard-card p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              Daily activity overview
            </h3>
            {dailyActivity.length > 0 ? (
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dailyActivity}>
                    <defs>
                      <linearGradient id="ddInsp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ddDef" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ddAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="inspections"
                      stroke="#3b82f6"
                      fill="url(#ddInsp)"
                      name="Inspections"
                    />
                    <Area
                      type="monotone"
                      dataKey="defects"
                      stroke="#64748b"
                      fill="url(#ddDef)"
                      name="Defects"
                    />
                    <Area
                      type="monotone"
                      dataKey="actions"
                      stroke="#8b5cf6"
                      fill="url(#ddAct)"
                      name="Workflow actions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-zinc-500 dark:text-white/50">
                No data for selected period
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Vehicle performance rankings
              </h3>
              {vehiclePerformance.length > 0 && (
                <span className="text-zinc-500 dark:text-white/50 text-sm">
                  Showing {vehiclePerformance.length}{' '}
                  {vehiclePerformance.length === 1 ? 'vehicle' : 'vehicles'}
                </span>
              )}
            </div>
            {vehiclePerformance.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 dark:text-white/50">
                No vehicles found. Add vehicles in the Fleet page.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-200 dark:border-white/10">
                    <tr className="text-zinc-600 dark:text-white/70 text-sm">
                      <th className="px-4 py-3 text-left font-medium">Rank</th>
                      <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                      <th className="px-4 py-3 text-right font-medium">Inspections</th>
                      <th className="px-4 py-3 text-right font-medium">Defects</th>
                      <th className="px-4 py-3 text-right font-medium">Resolved</th>
                      <th className="px-4 py-3 text-right font-medium">Health score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {vehiclePerformance.map((v, i) => (
                      <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3">
                          <span className={rankBadge(i)}>{i + 1}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium">
                          {v.name}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-700 dark:text-blue-300">
                          {v.inspections}
                        </td>
                        <td className="px-4 py-3 text-right text-red-700 dark:text-red-300">
                          {v.defects}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 dark:text-green-300">
                          {v.resolved}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${scoreText(v.score)}`}>{v.score}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Defects by severity
              </h3>
              {defectsBySeverity.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={defectsBySeverity}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {defectsBySeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-zinc-500 dark:text-white/50">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 dark:text-green-400" />
                    <p>No defects in selected period</p>
                  </div>
                </div>
              )}
            </div>

            <div className="dashboard-card p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Defect status</h3>
              {defects.length > 0 ? (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={defectStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-zinc-500 dark:text-white/50">
                  No defect data
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="dashboard-card p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              User activity rankings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-white/10">
                  <tr className="text-zinc-600 dark:text-white/70 text-sm">
                    <th className="px-4 py-3 text-left font-medium">Rank</th>
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-right font-medium">Inspections</th>
                    <th className="px-4 py-3 text-right font-medium">Workflow actions</th>
                    <th className="px-4 py-3 text-right font-medium">Defects found</th>
                    <th className="px-4 py-3 text-right font-medium">Total activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {userPerformance.map((u, i) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className={rankBadge(i)}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-700 dark:text-blue-300">
                        {u.inspections}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-700 dark:text-purple-300">
                        {u.actions}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-700 dark:text-amber-300">
                        {u.defectsFound}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-white">
                        {u.inspections + u.actions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-card p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              User activity comparison
            </h3>
            {userPerformance.length > 0 ? (
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userPerformance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="inspections" fill="#3b82f6" name="Inspections" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="actions" fill="#8b5cf6" name="Workflow actions" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartErrorBoundary>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-500 dark:text-white/50">
                No user activity data
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
