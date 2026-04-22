'use client';

import React, { useRef, useState } from 'react';
import { Download, Loader2, FileSpreadsheet, ChevronDown, ClipboardList } from 'lucide-react';
import {
  exportToExcel,
  exportMultipleSheetsToExcel,
  type PdfArchiveMeta,
} from '@/lib/exportUtils';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: string[];
  fieldMappings?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  sheetName?: string;
  // For multi-sheet exports
  multiSheetData?: Array<{
    name: string;
    data: any[];
    fieldMappings?: Record<string, string>;
  }>;
  /** Shown on PDF cover page (e.g. weekly report title) */
  reportTitle?: string;
  /** Optional structured fleet health PDF (dashboard) */
  fleetHealthPdf?: { onExport: () => void };
  /** Shown on multi-sheet PDF cover and footers */
  pdfMeta?: PdfArchiveMeta;
}

const EXPORT_COOLDOWN_MS = 5000;
const MAX_EXPORT_ROWS = 5000;

export default function ExportButton({
  data,
  filename,
  fieldMappings,
  className = '',
  disabled = false,
  sheetName = 'Data',
  multiSheetData,
  fleetHealthPdf,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const lastExportAtRef = useRef(0);

  const guardSpam = (): boolean => {
    const now = Date.now();
    if (now - lastExportAtRef.current < EXPORT_COOLDOWN_MS) {
      const wait = Math.ceil((EXPORT_COOLDOWN_MS - (now - lastExportAtRef.current)) / 1000);
      alert(`Please wait ${wait}s before exporting again.`);
      return false;
    }
    lastExportAtRef.current = now;
    return true;
  };

  const clampRows = (rows: any[]): any[] => {
    if (rows.length <= MAX_EXPORT_ROWS) return rows;
    alert(`Export limited to ${MAX_EXPORT_ROWS} rows (${rows.length} in this view).`);
    return rows.slice(0, MAX_EXPORT_ROWS);
  };

  const handleExportExcel = async () => {
    if (!guardSpam()) return;
    setExporting(true);
    setShowDropdown(false);
    try {
      if (multiSheetData && multiSheetData.length > 0) {
        const clampedSheets = multiSheetData.map((s) => ({
          ...s,
          data: clampRows(s.data),
        }));
        exportMultipleSheetsToExcel(clampedSheets, filename);
      } else if (data && data.length > 0) {
        exportToExcel(clampRows(data), filename, sheetName, fieldMappings);
      } else {
        alert('No data to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const hasData = (data && data.length > 0) || (multiSheetData && multiSheetData.some(s => s.data.length > 0));
  const canOpenMenu = hasData || !!fleetHealthPdf?.onExport;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || exporting || !canOpenMenu}
        className={`btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/40 text-blue-600 hover:border-blue-500 hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-blue-400 ${className}`}
        title="Export as a formatted PDF report or an Excel workbook."
        aria-label={exporting ? 'Exporting data' : 'Export data'}
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Exporting...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span className="text-sm">Export</span>
            <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
      
      {showDropdown && !exporting && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="export-dropdown absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white shadow-xl z-20 overflow-hidden dark:border-blue-500/25 dark:bg-zinc-950">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/45">
                Export report
              </p>
            </div>
            {fleetHealthPdf?.onExport && (
              <button
                type="button"
                onClick={() => {
                  if (!guardSpam()) return;
                  setShowDropdown(false);
                  fleetHealthPdf.onExport();
                }}
                className="w-full flex items-start gap-3 px-4 py-3 text-sm text-zinc-800 hover:bg-blue-50 transition-colors text-left dark:text-white dark:hover:bg-blue-500/10"
              >
                <ClipboardList className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 dark:text-sky-400" />
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">Fleet compliance report (PDF)</span>
                  <span className="text-[11px] font-normal text-zinc-500 dark:text-white/55">
                    Executive summary with defects, MOT/Tax and actions.
                  </span>
                </span>
              </button>
            )}
            {hasData && (
              <button
                onClick={handleExportExcel}
                className={`w-full flex items-start gap-3 px-4 py-3 text-sm text-zinc-800 hover:bg-blue-50 transition-colors text-left dark:text-white dark:hover:bg-blue-500/10 ${
                  fleetHealthPdf?.onExport ? 'border-t border-zinc-200 dark:border-white/10' : ''
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 dark:text-emerald-400" />
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">Excel workbook (.xlsx)</span>
                  <span className="text-[11px] font-normal text-zinc-500 dark:text-white/55">
                    Full data for analysts and finance teams.
                  </span>
                </span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
