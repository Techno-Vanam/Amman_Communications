'use client';

import React, { useState } from 'react';
import styles from './ServiceReport.module.css';
import { Column, ReportTable } from './ReportTable';
import { ArrowUpDown, Search } from 'lucide-react';

export interface ServiceReportItem {
  id: string;
  name: string;
  status: string;
  governmentFee: number;
  serviceFee: number;
  totalFee: number;
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  revenue: number;
}

export interface ServiceReportData {
  total: number;
  items: ServiceReportItem[];
}

interface ServiceReportProps {
  data?: ServiceReportData;
  loading?: boolean;
}

type SortField = 'name' | 'totalApplications' | 'approved' | 'revenue';

export const ServiceReport: React.FC<ServiceReportProps> = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalApplications');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredItems = (data?.items || [])
    .filter((svc) =>
      svc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortOrder === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  const columns: Column<ServiceReportItem>[] = [
    {
      header: 'Service Name',
      accessor: 'name',
      render: (row) => (
        <div className={styles.serviceCell}>
          <span className={styles.serviceName}>{row.name}</span>
          <span className={styles.feeSub}>Fee: ₹{row.totalFee.toLocaleString('en-IN')}</span>
        </div>
      ),
    },
    {
      header: 'Applications',
      accessor: 'totalApplications',
      align: 'center',
      render: (row) => (
        <span className={styles.countBadge}>{row.totalApplications}</span>
      ),
    },
    {
      header: 'Pending',
      accessor: 'pending',
      align: 'center',
      render: (row) => (
        <span className={`${styles.statusMini} ${styles.mini_amber}`}>{row.pending}</span>
      ),
    },
    {
      header: 'Approved',
      accessor: 'approved',
      align: 'center',
      render: (row) => (
        <span className={`${styles.statusMini} ${styles.mini_green}`}>{row.approved}</span>
      ),
    },
    {
      header: 'Rejected',
      accessor: 'rejected',
      align: 'center',
      render: (row) => (
        <span className={`${styles.statusMini} ${styles.mini_red}`}>{row.rejected}</span>
      ),
    },
    {
      header: 'Revenue Collected',
      accessor: 'revenue',
      align: 'right',
      render: (row) => (
        <strong className={styles.revenueText}>
          ₹{row.revenue.toLocaleString('en-IN')}
        </strong>
      ),
    },
  ];

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Service Performance Report</h2>
          <p className={styles.sectionSubtitle}>
            Application conversion rates and collected revenue across services.
          </p>
        </div>

        {/* Search & Sort Actions */}
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.sortButtons}>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortField === 'totalApplications' ? styles.sortActive : ''}`}
              onClick={() => handleSort('totalApplications')}
              title="Sort by application volume"
            >
              <ArrowUpDown size={13} />
              <span>Volume</span>
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortField === 'revenue' ? styles.sortActive : ''}`}
              onClick={() => handleSort('revenue')}
              title="Sort by collected revenue"
            >
              <ArrowUpDown size={13} />
              <span>Revenue</span>
            </button>
          </div>
        </div>
      </div>

      <ReportTable<ServiceReportItem>
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyMessage="No service records found."
      />
    </div>
  );
};
