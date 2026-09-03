'use client';

import React, { useState } from 'react';
import styles from './ReportFilters.module.css';
import { Calendar, Filter, Search, RotateCcw } from 'lucide-react';
import { ReportFilters as ReportFiltersType } from '@/lib/api/admin/reports';

interface ServiceOption {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: ReportFiltersType) => void;
  services?: ServiceOption[];
}

type DatePreset = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom' | 'all_time';

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  services = [],
}) => {
  const [activePreset, setActivePreset] = useState<DatePreset>('all_time');
  const [fromDate, setFromDate] = useState<string>(filters.from || '');
  const [toDate, setToDate] = useState<string>(filters.to || '');
  const [serviceId, setServiceId] = useState<string>(filters.serviceId || 'ALL');
  const [applicationStatus, setApplicationStatus] = useState<string>(filters.applicationStatus || 'ALL');
  const [paymentStatus, setPaymentStatus] = useState<string>(filters.paymentStatus || 'ALL');
  const [search, setSearch] = useState<string>(filters.search || '');

  const applyPreset = (preset: DatePreset) => {
    setActivePreset(preset);
    const now = new Date();
    let from = '';
    let to = '';

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      from = formatDate(now);
      to = formatDate(now);
    } else if (preset === 'this_week') {
      const start = new Date(now);
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      from = formatDate(start);
      to = formatDate(now);
    } else if (preset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      from = formatDate(start);
      to = formatDate(now);
    } else if (preset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      from = formatDate(start);
      to = formatDate(end);
    } else if (preset === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1);
      from = formatDate(start);
      to = formatDate(now);
    } else if (preset === 'all_time') {
      from = '';
      to = '';
    }

    setFromDate(from);
    setToDate(to);

    onChange({
      ...filters,
      from: from || undefined,
      to: to || undefined,
      serviceId,
      applicationStatus,
      paymentStatus,
      search: search || undefined,
      page: 1,
    });
  };

  const handleCustomDateChange = (fromVal: string, toVal: string) => {
    setFromDate(fromVal);
    setToDate(toVal);
    setActivePreset('custom');
    onChange({
      ...filters,
      from: fromVal || undefined,
      to: toVal || undefined,
      serviceId,
      applicationStatus,
      paymentStatus,
      search: search || undefined,
      page: 1,
    });
  };

  const handleSelectChange = (
    field: 'serviceId' | 'applicationStatus' | 'paymentStatus',
    val: string
  ) => {
    if (field === 'serviceId') setServiceId(val);
    if (field === 'applicationStatus') setApplicationStatus(val);
    if (field === 'paymentStatus') setPaymentStatus(val);

    onChange({
      ...filters,
      from: fromDate || undefined,
      to: toDate || undefined,
      serviceId: field === 'serviceId' ? val : serviceId,
      applicationStatus: field === 'applicationStatus' ? val : applicationStatus,
      paymentStatus: field === 'paymentStatus' ? val : paymentStatus,
      search: search || undefined,
      page: 1,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      ...filters,
      from: fromDate || undefined,
      to: toDate || undefined,
      serviceId,
      applicationStatus,
      paymentStatus,
      search: search || undefined,
      page: 1,
    });
  };

  const handleReset = () => {
    setActivePreset('all_time');
    setFromDate('');
    setToDate('');
    setServiceId('ALL');
    setApplicationStatus('ALL');
    setPaymentStatus('ALL');
    setSearch('');
    onChange({
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className={styles.filterCard}>
      {/* Date Presets Row */}
      <div className={styles.presetRow}>
        <div className={styles.presetLabel}>
          <Calendar size={15} />
          <span>Date Range:</span>
        </div>
        <div className={styles.presetsList}>
          {[
            { id: 'all_time', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'this_year', label: 'This Year' },
            { id: 'custom', label: 'Custom' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.presetBtn} ${activePreset === p.id ? styles.presetActive : ''}`}
              onClick={() => applyPreset(p.id as DatePreset)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Bar */}
      <div className={styles.controlsGrid}>
        {/* From Date */}
        <div className={styles.inputGroup}>
          <label htmlFor="fromDate">From Date</label>
          <input
            id="fromDate"
            type="date"
            className={styles.input}
            value={fromDate}
            onChange={(e) => handleCustomDateChange(e.target.value, toDate)}
          />
        </div>

        {/* To Date */}
        <div className={styles.inputGroup}>
          <label htmlFor="toDate">To Date</label>
          <input
            id="toDate"
            type="date"
            className={styles.input}
            value={toDate}
            onChange={(e) => handleCustomDateChange(fromDate, e.target.value)}
          />
        </div>

        {/* Service */}
        <div className={styles.inputGroup}>
          <label htmlFor="serviceSelect">Service</label>
          <select
            id="serviceSelect"
            className={styles.select}
            value={serviceId}
            onChange={(e) => handleSelectChange('serviceId', e.target.value)}
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Application Status */}
        <div className={styles.inputGroup}>
          <label htmlFor="appStatusSelect">Application Status</label>
          <select
            id="appStatusSelect"
            className={styles.select}
            value={applicationStatus}
            onChange={(e) => handleSelectChange('applicationStatus', e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Payment Status */}
        <div className={styles.inputGroup}>
          <label htmlFor="payStatusSelect">Payment Status</label>
          <select
            id="payStatusSelect"
            className={styles.select}
            value={paymentStatus}
            onChange={(e) => handleSelectChange('paymentStatus', e.target.value)}
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Search & Reset Row */}
      <div className={styles.actionRow}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Search by customer, application #, or service..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            <Filter size={15} />
            <span>Apply</span>
          </button>
        </form>

        <button type="button" className={styles.resetBtn} onClick={handleReset} title="Reset all filters">
          <RotateCcw size={15} />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};
