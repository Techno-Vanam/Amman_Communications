'use client';

import React from 'react';
import styles from './ApplicationReport.module.css';
import { Column, ReportTable } from './ReportTable';

export interface ApplicationItem {
  id: string;
  applicationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  serviceFee: number;
  status: string;
  createdAt: string;
}

export interface ApplicationReportData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  items: ApplicationItem[];
}

interface ApplicationReportProps {
  data?: ApplicationReportData;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  SUBMITTED: 'badge_blue',
  UNDER_REVIEW: 'badge_amber',
  APPROVED: 'badge_green',
  REJECTED: 'badge_red',
  DRAFT: 'badge_gray',
};

export const ApplicationReport: React.FC<ApplicationReportProps> = ({
  data,
  loading,
  onPageChange,
}) => {
  const statusCounts = data?.statusCounts || {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    APPROVED: 0,
    REJECTED: 0,
  };

  const total = data?.total || 0;

  const columns: Column<ApplicationItem>[] = [
    {
      header: 'Application #',
      accessor: 'applicationNumber',
      render: (row) => <span className={styles.appNumber}>{row.applicationNumber}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div className={styles.customerCell}>
          <span className={styles.custName}>{row.customerName}</span>
          <span className={styles.custSub}>{row.customerEmail || row.customerPhone}</span>
        </div>
      ),
    },
    {
      header: 'Service',
      accessor: 'serviceName',
      render: (row) => <span className={styles.serviceName}>{row.serviceName}</span>,
    },
    {
      header: 'Fee',
      accessor: 'serviceFee',
      align: 'right',
      render: (row) => <span>₹{row.serviceFee.toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => {
        const cls = STATUS_BADGE_CLASS[row.status] || 'badge_gray';
        const label = row.status.replace(/_/g, ' ');
        return <span className={`${styles.statusBadge} ${styles[cls]}`}>{label}</span>;
      },
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      align: 'right',
      render: (row) => (
        <span className={styles.dateText}>
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Application Report</h2>
          <p className={styles.sectionSubtitle}>
            Application volume, processing workflow, and status distributions.
          </p>
        </div>
        <div className={styles.totalBadge}>
          <span>Total: <strong>{total.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div className={styles.statusStrip}>
        <div className={`${styles.statusPill} ${styles.pill_blue}`}>
          <span className={styles.pillLabel}>Submitted</span>
          <span className={styles.pillValue}>{(statusCounts.SUBMITTED || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className={`${styles.statusPill} ${styles.pill_amber}`}>
          <span className={styles.pillLabel}>Under Review</span>
          <span className={styles.pillValue}>{(statusCounts.UNDER_REVIEW || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className={`${styles.statusPill} ${styles.pill_green}`}>
          <span className={styles.pillLabel}>Approved</span>
          <span className={styles.pillValue}>{(statusCounts.APPROVED || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className={`${styles.statusPill} ${styles.pill_red}`}>
          <span className={styles.pillLabel}>Rejected</span>
          <span className={styles.pillValue}>{(statusCounts.REJECTED || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Visual Distribution Bar */}
      {total > 0 && (
        <div className={styles.distributionBar}>
          {statusCounts.SUBMITTED > 0 && (
            <div
              className={styles.bar_blue}
              style={{ width: `${(statusCounts.SUBMITTED / total) * 100}%` }}
              title={`Submitted: ${statusCounts.SUBMITTED}`}
            />
          )}
          {statusCounts.UNDER_REVIEW > 0 && (
            <div
              className={styles.bar_amber}
              style={{ width: `${(statusCounts.UNDER_REVIEW / total) * 100}%` }}
              title={`Under Review: ${statusCounts.UNDER_REVIEW}`}
            />
          )}
          {statusCounts.APPROVED > 0 && (
            <div
              className={styles.bar_green}
              style={{ width: `${(statusCounts.APPROVED / total) * 100}%` }}
              title={`Approved: ${statusCounts.APPROVED}`}
            />
          )}
          {statusCounts.REJECTED > 0 && (
            <div
              className={styles.bar_red}
              style={{ width: `${(statusCounts.REJECTED / total) * 100}%` }}
              title={`Rejected: ${statusCounts.REJECTED}`}
            />
          )}
        </div>
      )}

      {/* Applications Table */}
      <ReportTable<ApplicationItem>
        columns={columns}
        data={data?.items || []}
        loading={loading}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        totalRecords={total}
        onPageChange={onPageChange}
        emptyMessage="No applications found for the selected criteria."
      />
    </div>
  );
};
