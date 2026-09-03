'use client';

import React from 'react';
import styles from './CustomerReport.module.css';
import { Column, ReportTable } from './ReportTable';
import { UserCheck, FileText, AlertCircle } from 'lucide-react';

export interface CustomerReportItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  applicationsCount: number;
  documentsCount: number;
  appointmentsCount: number;
  createdAt: string;
}

export interface CustomerReportData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  metrics: {
    totalCustomers: number;
    customersWithApplications: number;
    customersWithPendingActions: number;
  };
  items: CustomerReportItem[];
}

interface CustomerReportProps {
  data?: CustomerReportData;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export const CustomerReport: React.FC<CustomerReportProps> = ({
  data,
  loading,
  onPageChange,
}) => {
  const metrics = data?.metrics || {
    totalCustomers: 0,
    customersWithApplications: 0,
    customersWithPendingActions: 0,
  };

  const columns: Column<CustomerReportItem>[] = [
    {
      header: 'Customer Name',
      accessor: 'name',
      render: (row) => (
        <div className={styles.nameCell}>
          <span className={styles.customerName}>{row.name}</span>
          <span className={styles.emailSub}>{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => <span>{row.phone || '—'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => (
        <span
          className={`${styles.statusBadge} ${
            row.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Applications',
      accessor: 'applicationsCount',
      align: 'center',
      render: (row) => (
        <span className={styles.numBadge}>{row.applicationsCount}</span>
      ),
    },
    {
      header: 'Documents',
      accessor: 'documentsCount',
      align: 'center',
      render: (row) => (
        <span className={styles.numBadge}>{row.documentsCount}</span>
      ),
    },
    {
      header: 'Joined Date',
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
          <h2 className={styles.sectionTitle}>Customer Report</h2>
          <p className={styles.sectionSubtitle}>
            Customer engagement, registration metrics, and active service requests.
          </p>
        </div>
      </div>

      {/* Customer Stat Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.iconWrap} ${styles.iconGreen}`}>
            <UserCheck size={18} />
          </div>
          <div>
            <span className={styles.metricLabel}>Total Registered</span>
            <h4 className={styles.metricValue}>
              {metrics.totalCustomers.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.iconWrap} ${styles.iconBlue}`}>
            <FileText size={18} />
          </div>
          <div>
            <span className={styles.metricLabel}>With Applications</span>
            <h4 className={styles.metricValue}>
              {metrics.customersWithApplications.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.iconWrap} ${styles.iconAmber}`}>
            <AlertCircle size={18} />
          </div>
          <div>
            <span className={styles.metricLabel}>Pending Document Actions</span>
            <h4 className={styles.metricValue}>
              {metrics.customersWithPendingActions.toLocaleString('en-IN')}
            </h4>
          </div>
        </div>
      </div>

      <ReportTable<CustomerReportItem>
        columns={columns}
        data={data?.items || []}
        loading={loading}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        totalRecords={data?.total || 0}
        onPageChange={onPageChange}
        emptyMessage="No customers found for the selected period."
      />
    </div>
  );
};
