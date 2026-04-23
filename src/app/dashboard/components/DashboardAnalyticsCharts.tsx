'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Truck, Users, TrendingUp, CheckCircle } from 'lucide-react';
import ChartErrorBoundary from './ChartErrorBoundary';

const COLORS = ['#2563eb', '#7c3aed', '#0f766e', '#ea580c', '#c026d3', '#0284c7', '#16a34a', '#475569'];

export type DashboardAnalyticsChartsProps = {
  vehicleStatusBreakdown: { name: string; value: number }[];
  vehiclesByMake: { name: string; value: number }[];
  inspectionsByVehicle: { id: string; count: number; defects: number; name: string }[];
  usersByRole: { name: string; value: number }[];
  userActivity: { id: string; inspections: number; actions: number; name: string; total: number }[];
  inspectionsOverTime: { date: string; count: number }[];
  defectsTrend: { date: string; reported: number; resolved: number }[];
  defectsBySeverity: { name: string; value: number }[];
};

export default function DashboardAnalyticsCharts({
  vehicleStatusBreakdown,
  vehiclesByMake,
  inspectionsByVehicle,
  usersByRole,
  userActivity,
  inspectionsOverTime,
  defectsTrend,
  defectsBySeverity,
}: DashboardAnalyticsChartsProps) {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="h-5 w-5 text-blue-400 shrink-0" />
          <h2 className="dashboard-section-title">Fleet analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartErrorBoundary>
            <div className="dashboard-card p-6">
              <h3 className="text-white font-semibold mb-4">Vehicle Status Distribution</h3>
              {vehicleStatusBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 0, right: 8, bottom: 8, left: 8 }}>
                    <Pie
                      data={vehicleStatusBreakdown}
                      cx="50%"
                      cy="42%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                    >
                      {vehicleStatusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: 12 }}
                      formatter={(value: string, entry: { payload?: { value?: number } }) => {
                        const v = entry?.payload?.value ?? 0;
                        const total = vehicleStatusBreakdown.reduce((s, x) => s + x.value, 0);
                        const pct = total ? ((v / total) * 100).toFixed(0) : '0';
                        return `${value}: ${v} (${pct}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-white/50">No vehicle data</div>
              )}
            </div>
          </ChartErrorBoundary>

          <div className="dashboard-card p-6">
            <h3 className="text-white font-semibold mb-4">Vehicles by make</h3>
            {vehiclesByMake.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={vehiclesByMake} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-white/50">No vehicle data</div>
            )}
          </div>

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
                      <span className="text-blue-300 text-sm">{v.count} insp</span>
                      {v.defects > 0 && <span className="text-red-300 text-xs">{v.defects} defects</span>}
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

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-emerald-400 shrink-0" />
          <h2 className="dashboard-section-title">User analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card p-6">
            <h3 className="text-white font-semibold mb-4">Team by role</h3>
            {usersByRole.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={usersByRole} cx="50%" cy="45%" outerRadius={72} dataKey="value" label={false}>
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: 12 }}
                    formatter={(value: string, entry: { payload?: { value?: number } }) => {
                      const v = entry?.payload?.value ?? 0;
                      const total = usersByRole.reduce((s, x) => s + x.value, 0);
                      const pct = total ? ((v / total) * 100).toFixed(0) : '0';
                      return `${value}: ${v} (${pct}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-white/50">No user data</div>
            )}
          </div>

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

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-cyan-400 shrink-0" />
          <h2 className="dashboard-section-title">Trends & insights</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card p-6">
            <h3 className="text-white font-semibold mb-4">Inspections Over Time</h3>
            {inspectionsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={inspectionsOverTime}>
                  <defs>
                    <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorInsp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">No data for selected period</div>
            )}
          </div>

          <div className="dashboard-card p-6">
            <h3 className="text-white font-semibold mb-4">Defects Trend</h3>
            {defectsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={defectsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #3b82f6', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="reported" fill="#f97316" name="Reported" />
                  <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-white/50">No defect data for selected period</div>
            )}
          </div>
        </div>

        <div className="mt-6 dashboard-card p-6">
          <h3 className="text-white font-semibold mb-4">Defects by Severity</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {defectsBySeverity.length > 0 ? (
              defectsBySeverity.map((d) => (
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
                    className={`text-3xl font-bold ${
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
    </>
  );
}
