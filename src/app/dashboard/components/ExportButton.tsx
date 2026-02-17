'use client';

import React, { useState } from 'react';
import { Download, Loader2, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportMultipleSheetsToExcel } from '@/lib/exportUtils';

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
}

export default function ExportButton({
  data,
  filename,
  headers,
  fieldMappings,
  className = '',
  disabled = false,
  sheetName = 'Data',
  multiSheetData,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExportCSV = async () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);
    setShowDropdown(false);
    try {
      exportToCSV(data, filename, headers, fieldMappings);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    setShowDropdown(false);
    try {
      if (multiSheetData && multiSheetData.length > 0) {
        exportMultipleSheetsToExcel(multiSheetData, filename);
      } else if (data && data.length > 0) {
        exportToExcel(data, filename, sheetName, fieldMappings);
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || exporting || !hasData}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Export Data"
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
          <div className="absolute right-0 mt-2 w-48 bg-black border border-primary/30 rounded-lg shadow-xl z-20 overflow-hidden">
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-primary/10 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-400" />
              Export to Excel (.xlsx)
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-primary/10 transition-colors border-t border-white/10"
            >
              <FileText className="h-4 w-4 text-blue-400" />
              Export to CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
