/**
 * Export utilities for converting data to CSV format
 */

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
