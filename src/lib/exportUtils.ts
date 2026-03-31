/**
 * Export utilities for converting data to CSV, Excel, and PDF formats
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers. If not provided, uses object keys
 * @returns CSV string
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Create header row
  const headerRow = csvHeaders.map(escapeCSV).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Format dates if they're Timestamp objects
      if (value && typeof value === 'object' && 'toDate' in value) {
        return escapeCSV(value.toDate().toLocaleString());
      }
      return escapeCSV(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Exports data to Excel (XLSX) format
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param sheetName Optional sheet name
 * @param fieldMappings Optional mapping of field names to display names
 */
export function exportToExcel(
  data: any[],
  filename: string,
  sheetName: string = 'Data',
  fieldMappings?: Record<string, string>
): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const formattedData = formatDataForExport(data, fieldMappings);
  
  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Auto-size columns
  const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
    wch: Math.max(key.length, ...formattedData.map(row => String(row[key] || '').length)) + 2
  }));
  ws['!cols'] = colWidths;
  
  // Download the file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Exports multiple sheets to a single Excel file
 * @param sheets Array of sheet configurations
 * @param filename Name of the file
 */
export function exportMultipleSheetsToExcel(
  sheets: Array<{
    name: string;
    data: any[];
    fieldMappings?: Record<string, string>;
  }>,
  filename: string
): void {
  if (!sheets || sheets.length === 0) {
    alert('No data to export');
    return;
  }

  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    if (sheet.data && sheet.data.length > 0) {
      const formattedData = formatDataForExport(sheet.data, sheet.fieldMappings);
      const ws = XLSX.utils.json_to_sheet(formattedData);
      
      // Auto-size columns
      const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...formattedData.map(row => String(row[key] || '').length)) + 2
      }));
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31)); // Excel limit: 31 chars
    }
  });

  if (wb.SheetNames.length === 0) {
    const ws = XLSX.utils.json_to_sheet([{ Message: 'No data rows to export for the selected filters.' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Info');
  }
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Downloads CSV data as a file
 * @param csvContent CSV string content
 * @param filename Name of the file (without .csv extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Formats data for export by flattening nested objects and formatting dates
 * @param data Array of objects to format
 * @param fieldMappings Optional mapping of field names to display names
 * @returns Formatted array ready for CSV export
 */
export function formatDataForExport(
  data: any[],
  fieldMappings?: Record<string, string>
): any[] {
  return data.map(item => {
    const formatted: any = {};
    
    Object.keys(item).forEach(key => {
      const displayKey = fieldMappings?.[key] || key;
      let value = item[key];
      
      // Handle Timestamp objects
      if (value && typeof value === 'object' && 'toDate' in value) {
        value = value.toDate().toLocaleString();
      }
      
      // Handle nested objects (flatten them)
      if (value && typeof value === 'object' && !('toDate' in value) && !Array.isArray(value)) {
        // For nested objects, stringify or extract key values
        value = JSON.stringify(value);
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      formatted[displayKey] = value;
    });
    
    return formatted;
  });
}

/**
 * Exports data to CSV file
 * @param data Array of objects to export
 * @param filename Name of the file (without .csv extension)
 * @param headers Optional custom headers
 * @param fieldMappings Optional mapping of field names to display names
 */
export function exportToCSV(
  data: any[],
  filename: string,
  headers?: string[],
  fieldMappings?: Record<string, string>
): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const formattedData = formatDataForExport(data, fieldMappings);
  const csvContent = convertToCSV(formattedData, headers);
  downloadCSV(csvContent, filename);
}

export type ExportSheetInput = {
  name: string;
  data: any[];
  fieldMappings?: Record<string, string>;
};

export type PdfArchiveMeta = {
  organization?: string;
};

function evidenceReferenceId(prefix: string): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${prefix}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/**
 * Formal footer on every page — call immediately before `doc.save()`.
 * Keeps a consistent audit trail for printed / archived PDFs.
 */
export function applyEvidenceRecordFooters(
  doc: InstanceType<typeof jsPDF>,
  referenceId: string,
  marginMm = 12
): void {
  const pageCount = doc.getNumberOfPages();
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const gen = new Date().toLocaleString('en-GB');
  const line2 =
    'Stock Track PRO — management evidence for operator records; not a statutory roadworthiness certificate, MOT pass, or DVSA inspection outcome.';

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(marginMm, pageH - 13, pageW - marginMm, pageH - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Reference: ${referenceId}  ·  Page ${i} of ${pageCount}  ·  Generated: ${gen}`, marginMm, pageH - 9);
    const wrapped = doc.splitTextToSize(line2, pageW - marginMm * 2);
    doc.text(wrapped, marginMm, pageH - 5);
  }
}

/**
 * Multi-sheet PDF (landscape A4). Suitable for weekly / archive downloads.
 * Long text cells are truncated for PDF layout stability.
 */
export function exportMultipleSheetsToPDF(
  sheets: ExportSheetInput[],
  filename: string,
  reportTitle?: string,
  meta?: PdfArchiveMeta
): void {
  const nonEmpty = sheets.filter((s) => s.data && s.data.length > 0);
  if (nonEmpty.length === 0) {
    alert('No data to export');
    return;
  }

  const referenceId = evidenceReferenceId('STP-DAT');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 12;
  let isFirstPage = true;

  const truncate = (val: unknown, max = 100): string => {
    if (val === null || val === undefined) return '';
    const s = String(val).replace(/\r?\n/g, ' ');
    return s.length > max ? `${s.slice(0, max - 3)}...` : s;
  };

  nonEmpty.forEach((sheet, idx) => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    let y = margin;

    if (idx === 0 && reportTitle) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(reportTitle, doc.internal.pageSize.getWidth() - margin * 2);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 5.5 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      if (meta?.organization) {
        doc.text(`Organisation: ${meta.organization}`, margin, y);
        y += 5;
      }
      doc.text(`Reference: ${referenceId}`, margin, y);
      y += 5;
      doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, margin, y);
      y += 6;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
      y += 5;

      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const coverNote = doc.splitTextToSize(
        'Formal data extract from Stock Track PRO for retention, audit, and supporting evidence (e.g. operator licence / DVSA enquiries). Contents reflect system records at generation time.',
        doc.internal.pageSize.getWidth() - margin * 2
      );
      doc.text(coverNote, margin, y);
      y += coverNote.length * 3.6 + 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    const sectionTitle = sheet.name.substring(0, 90);
    doc.text(sectionTitle, margin, y);
    y += 7;

    const formatted = formatDataForExport(sheet.data, sheet.fieldMappings);
    const keys = Object.keys(formatted[0] || {});
    if (keys.length === 0) return;

    const body = formatted.map((row) =>
      keys.map((k) => truncate(row[k], 120))
    );

    autoTable(doc, {
      startY: y,
      head: [keys],
      body,
      styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak', cellWidth: 'wrap' },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin, bottom: 18 },
    });
  });

  applyEvidenceRecordFooters(doc, referenceId, margin);
  doc.save(`${filename}.pdf`);
}
