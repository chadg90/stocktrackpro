'use client';

import React, { useRef, useState } from 'react';
import { Download, Loader2, FileSpreadsheet, FileText, ChevronDown, ClipboardList } from 'lucide-react';
import {
  exportToCSV,
  exportToExcel,
  exportMultipleSheetsToExcel,
  exportMultipleSheetsToPDF,
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
}

const EXPORT_COOLDOWN_MS = 5000;
const MAX_EXPORT_ROWS = 5000;

export default function ExportButton({
  data,
  filename,
  headers,
  fieldMappings,
  className = '',
  disabled = false,
  sheetName = 'Data',
  multiSheetData,
  reportTitle,
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

  const handleExportCSV = async () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    if (!guardSpam()) return;

    setExporting(true);
    setShowDropdown(false);
    try {
      exportToCSV(clampRows(data), filename, headers, fieldMappings);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
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

  const handleExportPDF = async () => {
    if (!guardSpam()) return;
    setExporting(true);
    setShowDropdown(false);
    try {
      const title =
        reportTitle ||
        `Stock Track PRO — ${filename.replace(/-/g, ' ')}`;
      if (multiSheetData && multiSheetData.length > 0) {
        const clampedSheets = multiSheetData.map((s) => ({
          ...s,
          data: clampRows(s.data),
        }));
        exportMultipleSheetsToPDF(clampedSheets, filename, title);
      } else if (data && data.length > 0) {
        exportMultipleSheetsToPDF(
          [{ name: sheetName, data: clampRows(data), fieldMappings }],
          filename,
          title
        );
      } else {
        alert('No data to export');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF. Please try again.');
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
        className={`btn-dashboard-action inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/40 text-blue-500 hover:border-blue-500 hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Export data (Excel, CSV, or PDF — use PDF for a weekly archive report)"
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
          <div className="export-dropdown absolute right-0 mt-2 w-60 bg-black border border-blue-500/30 rounded-lg shadow-xl z-20 overflow-hidden">
            {fleetHealthPdf?.onExport && (
              <button
                type="button"
                onClick={() => {
                  if (!guardSpam()) return;
                  setShowDropdown(false);
                  fleetHealthPdf.onExport();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-blue-500/10 transition-colors text-left"
              >
                <ClipboardList className="h-4 w-4 text-sky-400 shrink-0" />
                Fleet health PDF
              </button>
            )}
            {hasData && (
              <button
                onClick={handleExportExcel}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-blue-500/10 transition-colors text-left ${fleetHealthPdf?.onExport ? 'border-t border-white/10' : ''}`}
              >
                <FileSpreadsheet className="h-4 w-4 text-green-400 shrink-0" />
                Excel (.xlsx)
              </button>
            )}
            {hasData && (
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-blue-500/10 transition-colors border-t border-white/10 text-left"
              >
                <FileText className="h-4 w-4 text-rose-400 shrink-0" />
                PDF report (archive)
              </button>
            )}
            {hasData && (
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-blue-500/10 transition-colors border-t border-white/10 text-left"
              >
                <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                CSV
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
