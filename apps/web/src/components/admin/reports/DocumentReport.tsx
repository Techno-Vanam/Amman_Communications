'use client';

import React from 'react';
import styles from './DocumentReport.module.css';
import { Column, ReportTable } from './ReportTable';

export interface DocumentReportItem {
  id: string;
  fileName: string;
  documentType: string;
  status: string;
  rejectionReason?: string;
  customerName: string;
  customerEmail: string;
  applicationNumber: string;
  uploadedAt: string;
}

export interface DocumentReportData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  items: DocumentReportItem[];
}

interface DocumentReportProps {
  data?: DocumentReportData;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const DOC_STATUS_BADGE: Record<string, string> = {
  UPLOADED: 'badge_blue',
  UNDER_REVIEW: 'badge_amber',
  VERIFIED: 'badge_green',
  REJECTED: 'badge_red',
  ACTION_REQUIRED: 'badge_purple',
};

export const DocumentReport: React.FC<DocumentReportProps> = ({
  data,
  loading,
  onPageChange,
}) => {
  const counts = data?.statusCounts || {
    UPLOADED: 0,
    UNDER_REVIEW: 0,
    VERIFIED: 0,
    REJECTED: 0,
    ACTION_REQUIRED: 0,
  };

  const columns: Column<DocumentReportItem>[] = [
    {
      header: 'File Name',
      accessor: 'fileName',
      render: (row) => (
        <div className={styles.fileCell}>
          <span className={styles.fileName}>{row.fileName}</span>
          <span className={styles.typeSub}>{row.documentType.replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      header: 'Application #',
      accessor: 'applicationNumber',
      render: (row) => <span className={styles.appNo}>{row.applicationNumber}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => <span className={styles.customerText}>{row.customerName}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => {
        const cls = DOC_STATUS_BADGE[row.status] || 'badge_gray';
        const label = row.status.replace(/_/g, ' ');
        return <span className={`${styles.statusBadge} ${styles[cls]}`}>{label}</span>;
      },
    },
    {
      header: 'Uploaded Date',
      accessor: 'uploadedAt',
      align: 'right',
      render: (row) => (
        <span className={styles.dateText}>
          {new Date(row.uploadedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Remarks',
      accessor: 'rejectionReason',
      render: (row) => (
        <span className={styles.remarksText}>
          {row.rejectionReason || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Document Verification Report</h2>
          <p className={styles.sectionSubtitle}>
            Verification pipeline, document statuses, and resubmission requests.
          </p>
        </div>
      </div>

      {/* Document Pipeline Counters */}
      <div className={styles.pipelineGrid}>
        <div className={`${styles.pipeCard} ${styles.pipe_blue}`}>
          <span className={styles.pipeLabel}>Uploaded</span>
          <h4 className={styles.pipeVal}>{(counts.UPLOADED || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.pipeCard} ${styles.pipe_amber}`}>
          <span className={styles.pipeLabel}>Under Review</span>
          <h4 className={styles.pipeVal}>{(counts.UNDER_REVIEW || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.pipeCard} ${styles.pipe_purple}`}>
          <span className={styles.pipeLabel}>Action Required</span>
          <h4 className={styles.pipeVal}>{(counts.ACTION_REQUIRED || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.pipeCard} ${styles.pipe_green}`}>
          <span className={styles.pipeLabel}>Verified</span>
          <h4 className={styles.pipeVal}>{(counts.VERIFIED || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.pipeCard} ${styles.pipe_red}`}>
          <span className={styles.pipeLabel}>Rejected</span>
          <h4 className={styles.pipeVal}>{(counts.REJECTED || 0).toLocaleString('en-IN')}</h4>
        </div>
      </div>

      <ReportTable<DocumentReportItem>
        columns={columns}
        data={data?.items || []}
        loading={loading}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        totalRecords={data?.total || 0}
        onPageChange={onPageChange}
        emptyMessage="No documents found matching the filter criteria."
      />
    </div>
  );
};
