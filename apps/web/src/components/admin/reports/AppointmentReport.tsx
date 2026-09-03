'use client';

import React from 'react';
import styles from './AppointmentReport.module.css';
import { Column, ReportTable } from './ReportTable';

export interface AppointmentReportItem {
  id: string;
  appointmentNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  appointmentDate: string;
  mode: string;
  status: string;
  createdAt: string;
}

export interface AppointmentReportData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  items: AppointmentReportItem[];
}

interface AppointmentReportProps {
  data?: AppointmentReportData;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const APT_STATUS_BADGE: Record<string, string> = {
  CONFIRMED: 'badge_green',
  PENDING: 'badge_amber',
  RESCHEDULED: 'badge_blue',
  COMPLETED: 'badge_teal',
  CANCELLED: 'badge_red',
};

export const AppointmentReport: React.FC<AppointmentReportProps> = ({
  data,
  loading,
  onPageChange,
}) => {
  const counts = data?.statusCounts || {
    CONFIRMED: 0,
    PENDING: 0,
    RESCHEDULED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  const columns: Column<AppointmentReportItem>[] = [
    {
      header: 'Appointment #',
      accessor: 'appointmentNumber',
      render: (row) => <span className={styles.aptNo}>{row.appointmentNumber}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div className={styles.customerCell}>
          <span className={styles.customerName}>{row.customerName}</span>
          <span className={styles.contactSub}>{row.customerEmail || row.customerPhone}</span>
        </div>
      ),
    },
    {
      header: 'Service',
      accessor: 'serviceName',
      render: (row) => <span className={styles.serviceText}>{row.serviceName}</span>,
    },
    {
      header: 'Mode',
      accessor: 'mode',
      render: (row) => (
        <span className={styles.modeBadge}>{row.mode}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => {
        const cls = APT_STATUS_BADGE[row.status] || 'badge_gray';
        return <span className={`${styles.statusBadge} ${styles[cls]}`}>{row.status}</span>;
      },
    },
    {
      header: 'Date & Time',
      accessor: 'appointmentDate',
      align: 'right',
      render: (row) => (
        <span className={styles.dateText}>
          {new Date(row.appointmentDate).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Appointment & Consultation Report</h2>
          <p className={styles.sectionSubtitle}>
            Booking trends, consultation modalities, and attendance statuses.
          </p>
        </div>
      </div>

      {/* Appointment Counters */}
      <div className={styles.countersGrid}>
        <div className={`${styles.countCard} ${styles.card_green}`}>
          <span className={styles.countLabel}>Confirmed</span>
          <h4 className={styles.countVal}>{(counts.CONFIRMED || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.countCard} ${styles.card_amber}`}>
          <span className={styles.countLabel}>Pending</span>
          <h4 className={styles.countVal}>{(counts.PENDING || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.countCard} ${styles.card_blue}`}>
          <span className={styles.countLabel}>Rescheduled</span>
          <h4 className={styles.countVal}>{(counts.RESCHEDULED || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.countCard} ${styles.card_teal}`}>
          <span className={styles.countLabel}>Completed</span>
          <h4 className={styles.countVal}>{(counts.COMPLETED || 0).toLocaleString('en-IN')}</h4>
        </div>
        <div className={`${styles.countCard} ${styles.card_red}`}>
          <span className={styles.countLabel}>Cancelled</span>
          <h4 className={styles.countVal}>{(counts.CANCELLED || 0).toLocaleString('en-IN')}</h4>
        </div>
      </div>

      <ReportTable<AppointmentReportItem>
        columns={columns}
        data={data?.items || []}
        loading={loading}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        totalRecords={data?.total || 0}
        onPageChange={onPageChange}
        emptyMessage="No appointments scheduled for the selected filters."
      />
    </div>
  );
};
