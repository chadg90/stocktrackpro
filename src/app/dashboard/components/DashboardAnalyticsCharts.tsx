'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle } from 'lucide-react';
import ChartErrorBoundary from './ChartErrorBoundary';
import { defectWord } from '@/lib/defectWord';

export type DashboardAnalyticsChartsProps = {
  inspectionsByVehicle: { id: string; count: number; defects: number; name: string }[];
  inspectionsOverTime: { date: string; count: number }[];
  defectsTrend: { date: string; reported: number; resolved: number }[];
  defectsBySeverity: { name: string; value: number }[];
  rangeLabel: string;
};

const CHART_AXIS = '#64748b';
const CHART_GRID = '#94a3b8';
const CHART_TOOLTIP = {
  backgroundColor: '#0f172a',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  color: '#f8fafc',
};
const CHART_TOOLTIP_ITEM = { color: '#f8fafc' };
const CHART_TOOLTIP_LABEL = { color: '#e2e8f0' };

export default function DashboardAnalyticsCharts({
  inspectionsByVehicle,
  inspectionsOverTime,
  defectsTrend,
  defectsBySeverity,
  rangeLabel,
}: DashboardAnalyticsChartsProps) {
  const emptyInspections = inspectionsOverTime.length === 0;
  const emptyDefects = defectsTrend.length === 0 && defectsBySeverity.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="dashboard-section-title mb-4">Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartErrorBoundary>
            <div className="dashboard-card p-6">
              <h3 className="text-white font-semibold mb-1">Inspections</h3>
              <p className="text-white/50 text-xs mb-4">Daily checks in {rangeLabel}</p>
              {emptyInspections ? (
                <div className="h-[240px] flex flex-col items-center justify-center text-center px-4">
                  <p className="text-white/70 text-sm">No inspections in {rangeLabel}.</p>
                  <p className="text-white/45 text-xs mt-1">
                    Walkaround checks from the app will show here.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={inspectionsOverTime}>
                    <defs>
                      <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                    <XAxis dataKey="date" stroke={CHART_AXIS} />
                    <YAxis stroke={CHART_AXIS} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP} itemStyle={CHART_TOOLTIP_ITEM} labelStyle={CHART_TOOLTIP_LABEL} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorInsp)" strokeWidth={2} name="Inspections" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartErrorBoundary>

          <ChartErrorBoundary>
            <div className="dashboard-card p-6">
              <h3 className="text-white font-semibold mb-1">Defects</h3>
              <p className="text-white/50 text-xs mb-4">Reported vs resolved in {rangeLabel}</p>
              {emptyDefects ? (
                <div className="h-[240px] flex flex-col items-center justify-center text-center px-4">
                  <CheckCircle className="h-8 w-8 mb-2 text-green-400" aria-hidden />
                  <p className="text-white/70 text-sm">No defects in {rangeLabel}.</p>
                </div>
              ) : defectsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={defectsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                    <XAxis dataKey="date" stroke={CHART_AXIS} />
                    <YAxis stroke={CHART_AXIS} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_TOOLTIP} itemStyle={CHART_TOOLTIP_ITEM} labelStyle={CHART_TOOLTIP_LABEL} />
                    <Legend />
                    <Bar dataKey="reported" fill="#f97316" name="Reported" />
                    <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-white/50 text-sm">
                  No defect trend for this period
                </div>
              )}
            </div>
          </ChartErrorBoundary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card p-6">
          <h3 className="text-white font-semibold mb-1">Open defects by severity</h3>
          <p className="text-white/50 text-xs mb-4">Still open in {rangeLabel}</p>
          {defectsBySeverity.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {defectsBySeverity.map((d) => (
                <div
                  key={d.name}
                  className={`p-4 rounded-xl border ${
                    d.name === 'Critical'
                      ? 'border-red-500/30 bg-red-500/10'
                      : d.name === 'High'
                        ? 'border-orange-500/30 bg-orange-500/10'
                        : d.name === 'Medium'
                          ? 'border-yellow-500/30 bg-yellow-500/10'
                          : 'border-blue-500/30 bg-blue-500/10'
                  }`}
                >
                  <p
                    className={`text-2xl font-bold tabular-nums ${
                      d.name === 'Critical'
                        ? 'text-red-300'
                        : d.name === 'High'
                          ? 'text-orange-300'
                          : d.name === 'Medium'
                            ? 'text-amber-300'
                            : 'text-green-300'
                    }`}
                  >
                    {d.value}
                  </p>
                  <p className="text-white/70 text-sm">{d.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm py-6">No open defects in this period.</p>
          )}
        </div>

        <div className="dashboard-card p-6">
          <h3 className="text-white font-semibold mb-1">Most inspected vehicles</h3>
          <p className="text-white/50 text-xs mb-4">In {rangeLabel}</p>
          {inspectionsByVehicle.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {inspectionsByVehicle.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white/50 text-sm w-6 shrink-0">{i + 1}.</span>
                    <span className="text-white text-sm font-medium truncate">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-blue-300 text-sm tabular-nums">{v.count}</span>
                    {v.defects > 0 && (
                      <span className="text-red-300 text-xs">
                        {v.defects} {defectWord(v.defects)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm py-6">No inspection data for this period.</p>
          )}
        </div>
      </div>
    </div>
  );
}
