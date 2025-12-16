'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: string[];
  fieldMappings?: Record<string, string>;
  className?: string;
  disabled?: boolean;
}

export default function ExportButton({
  data,
  filename,
  headers,
  fieldMappings,
  className = '',
  disabled = false,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);
    try {
      exportToCSV(data, filename, headers, fieldMappings);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting || !data || data.length === 0}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Export to CSV"
    >
      {exporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Exporting...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="text-sm">Export CSV</span>
        </>
      )}
    </button>
  );
}
