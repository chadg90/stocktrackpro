'use client';

import React from 'react';
import { format } from 'date-fns';
import type { CompliancePeriodPreset } from '@/lib/fleetReportLogic';

export const FLEET_REPORT_PERIOD_OPTIONS: { value: CompliancePeriodPreset; label: string }[] = [
  { value: 'week', label: 'This week' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'month', label: 'Choose month' },
];

type FleetReportPeriodControlsProps = {
  period: CompliancePeriodPreset;
  monthValue: string;
  onPeriodChange: (period: CompliancePeriodPreset) => void;
  onMonthChange: (monthValue: string) => void;
};

export default function FleetReportPeriodControls({
  period,
  monthValue,
  onPeriodChange,
  onMonthChange,
}: FleetReportPeriodControlsProps) {
  return (
    <div className="flex flex-col gap-2 shrink-0">
      <span className="text-xs font-medium text-zinc-500 dark:text-white/50">Period</span>
      <div className="flex flex-wrap items-center gap-2">
        {FLEET_REPORT_PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPeriodChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              period === opt.value
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {period === 'month' && (
        <input
          type="month"
          value={monthValue}
          max={format(new Date(), 'yyyy-MM')}
          onChange={(e) => onMonthChange(e.target.value)}
          className="mt-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-white/15 dark:bg-white/5 dark:text-white"
          aria-label="Choose month"
        />
      )}
    </div>
  );
}
