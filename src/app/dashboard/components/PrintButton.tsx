'use client';

import React, { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';

interface PrintButtonProps {
  title?: string;
  contentId?: string;
  className?: string;
  disabled?: boolean;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export default function PrintButton({
  title = 'Report',
  contentId,
  className = '',
  disabled = false,
  onBeforePrint,
  onAfterPrint,
}: PrintButtonProps) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    
    try {
      if (onBeforePrint) {
        onBeforePrint();
      }

      // Small delay to ensure any state updates are rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create print styles
      const printStyles = `
        @media print {
          body * {
            visibility: hidden;
          }
          ${contentId ? `#${contentId}, #${contentId} *` : '.print-content, .print-content *'} {
            visibility: visible;
          }
          ${contentId ? `#${contentId}` : '.print-content'} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
          }
          /* Make charts and graphs print-friendly */
          svg {
            max-width: 100%;
            height: auto;
          }
          /* Table styles for print */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `;

      // Add print styles temporarily
      const styleElement = document.createElement('style');
      styleElement.id = 'print-styles';
      styleElement.innerHTML = printStyles;
      document.head.appendChild(styleElement);

      // Set document title for print
      const originalTitle = document.title;
      document.title = `${title} - ${new Date().toLocaleDateString()}`;

      // Trigger print
      window.print();

      // Cleanup
      document.title = originalTitle;
      const printStyleElement = document.getElementById('print-styles');
      if (printStyleElement) {
        printStyleElement.remove();
      }

      if (onAfterPrint) {
        onAfterPrint();
      }
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={disabled || printing}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Print Report"
    >
      {printing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Preparing...</span>
        </>
      ) : (
        <>
          <Printer className="h-4 w-4" />
          <span className="text-sm">Print</span>
        </>
      )}
    </button>
  );
}
