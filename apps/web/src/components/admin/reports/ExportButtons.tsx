'use client';

import React, { useState } from 'react';
import styles from './ExportButtons.module.css';
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ReportFilters } from '@/lib/api/admin/reports';

interface ExportButtonsProps {
  filters: ReportFilters;
  activeTab?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ filters, activeTab = 'overview' }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'excel' | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setDownloadingFormat(format);
      const params = new URLSearchParams();
      params.append('format', format);
      if (activeTab && activeTab !== 'overview') {
        params.append('section', activeTab);
      }
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.serviceId && filters.serviceId !== 'ALL') params.append('serviceId', filters.serviceId);
      if (filters.applicationStatus && filters.applicationStatus !== 'ALL') params.append('applicationStatus', filters.applicationStatus);
      if (filters.paymentStatus && filters.paymentStatus !== 'ALL') params.append('paymentStatus', filters.paymentStatus);
      if (filters.search) params.append('search', filters.search);

      const url = `/api/admin/reports/export?${params.toString()}`;
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Export generation failed');
      }

      const blobData = await res.blob();
      const mimeType =
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf';

      const fileBlob = new Blob([blobData], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      const sectionSuffix = activeTab && activeTab !== 'overview' ? `-${activeTab}` : '';
      a.download = `amman-communications-report${sectionSuffix}-${dateStr}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();

      // Delay revoking the object URL to allow browsers/download managers to complete the download
      setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }, 5000);
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Failed to generate export: ${error.message || 'Please try again'}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getSectionLabel = () => {
    switch (activeTab) {
      case 'applications':
        return 'Applications';
      case 'services':
        return 'Services';
      case 'customers':
        return 'Customers';
      case 'documents':
        return 'Documents';
      case 'appointments':
        return 'Appointments';
      case 'finance':
        return 'Finance';
      default:
        return 'Report';
    }
  };

  return (
    <div className={styles.exportContainer}>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPdf}`}
        onClick={() => handleExport('pdf')}
        disabled={downloadingFormat !== null}
        title={`Download official PDF for ${getSectionLabel()}`}
      >
        {downloadingFormat === 'pdf' ? (
          <Loader2 className={styles.spinner} size={16} />
        ) : (
          <FileText size={16} />
        )}
        <span>Export PDF</span>
      </button>

      <button
        type="button"
        className={`${styles.btn} ${styles.btnExcel}`}
        onClick={() => handleExport('excel')}
        disabled={downloadingFormat !== null}
        title={`Download multi-sheet Excel spreadsheet for ${getSectionLabel()}`}
      >
        {downloadingFormat === 'excel' ? (
          <Loader2 className={styles.spinner} size={16} />
        ) : (
          <FileSpreadsheet size={16} />
        )}
        <span>Export Excel</span>
      </button>
    </div>
  );
};
