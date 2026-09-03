'use client';

import React from 'react';
import styles from './FinanceReport.module.css';
import { Column, ReportTable } from './ReportTable';
import { IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
}

export interface ServiceRevenueItem {
  serviceName: string;
  revenue: number;
}

export interface InvoiceReportItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  serviceName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface FinanceReportData {
  totalBilled: number;
  totalCollected: number;
  pendingPayments: number;
  overduePayments: number;
  cancelledPayments: number;
  outstandingAmount: number;
  monthlyRevenue: MonthlyRevenueItem[];
  revenueByService: ServiceRevenueItem[];
  invoices: InvoiceReportItem[];
}

interface FinanceReportProps {
  data?: FinanceReportData;
  loading?: boolean;
}

export const FinanceReport: React.FC<FinanceReportProps> = ({ data, loading }) => {
  const billed = data?.totalBilled || 0;
  const collected = data?.totalCollected || 0;
  const pending = data?.pendingPayments || 0;
  const overdue = data?.overduePayments || 0;
  const outstanding = data?.outstandingAmount || 0;

  const monthlyRev = data?.monthlyRevenue || [];
  const serviceRev = data?.revenueByService || [];

  const maxMonthRev = Math.max(...monthlyRev.map((m) => m.revenue), 1);

  const columns: Column<InvoiceReportItem>[] = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      render: (row) => <span className={styles.invoiceNo}>{row.invoiceNumber}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => <span className={styles.custText}>{row.customerName}</span>,
    },
    {
      header: 'Service',
      accessor: 'serviceName',
      render: (row) => <span className={styles.svcText}>{row.serviceName}</span>,
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      align: 'right',
      render: (row) => <strong>₹{row.totalAmount.toLocaleString('en-IN')}</strong>,
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => {
        const isPaid = row.status === 'PAID';
        const isOverdue = row.status === 'OVERDUE';
        return (
          <span
            className={`${styles.invBadge} ${
              isPaid
                ? styles.invPaid
                : isOverdue
                ? styles.invOverdue
                : styles.invPending
            }`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      header: 'Date',
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
          <h2 className={styles.sectionTitle}>Financial Performance Report</h2>
          <p className={styles.sectionSubtitle}>
            Revenue collection, billing reconciliations, and overdue balances.
          </p>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className={styles.financeCardsGrid}>
        <div className={styles.finCard}>
          <div className={`${styles.finIcon} ${styles.iconBilled}`}>
            <IndianRupee size={20} />
          </div>
          <div>
            <span className={styles.finLabel}>Total Billed</span>
            <h3 className={styles.finValue}>₹{billed.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className={styles.finCard}>
          <div className={`${styles.finIcon} ${styles.iconCollected}`}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span className={styles.finLabel}>Collected Revenue</span>
            <h3 className={styles.finValue}>₹{collected.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className={styles.finCard}>
          <div className={`${styles.finIcon} ${styles.iconPending}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className={styles.finLabel}>Pending Payments</span>
            <h3 className={styles.finValue}>₹{pending.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className={styles.finCard}>
          <div className={`${styles.finIcon} ${styles.iconOverdue}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className={styles.finLabel}>Overdue Balance</span>
            <h3 className={styles.finValue}>₹{overdue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Visual Revenue Breakdown Section */}
      <div className={styles.chartsGrid}>
        {/* Monthly Revenue Bars */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Revenue by Month</h4>
          {monthlyRev.length === 0 ? (
            <p className={styles.noData}>No monthly revenue data available for this range.</p>
          ) : (
            <div className={styles.barsContainer}>
              {monthlyRev.map((m) => (
                <div key={m.month} className={styles.barColumn}>
                  <span className={styles.barVal}>
                    ₹{(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        height: `${Math.max(8, (m.revenue / maxMonthRev) * 100)}%`,
                      }}
                      title={`${m.month}: ₹${m.revenue.toLocaleString('en-IN')}`}
                    />
                  </div>
                  <span className={styles.barLabel}>{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Service */}
        <div className={styles.chartCard}>
          <h4 className={styles.chartTitle}>Revenue by Service</h4>
          {serviceRev.length === 0 ? (
            <p className={styles.noData}>No service revenue records found.</p>
          ) : (
            <div className={styles.serviceList}>
              {serviceRev.slice(0, 5).map((s) => (
                <div key={s.serviceName} className={styles.serviceRow}>
                  <div className={styles.serviceRowInfo}>
                    <span className={styles.serviceRowName}>{s.serviceName}</span>
                    <strong className={styles.serviceRowVal}>
                      ₹{s.revenue.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className={styles.serviceProgressTrack}>
                    <div
                      className={styles.serviceProgressFill}
                      style={{
                        width: `${Math.min(100, (s.revenue / (collected || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className={styles.tableWrap}>
        <h4 className={styles.tableTitle}>Recent Billed Invoices</h4>
        <ReportTable<InvoiceReportItem>
          columns={columns}
          data={data?.invoices || []}
          loading={loading}
          emptyMessage="No billing records found for the selected period."
        />
      </div>
    </div>
  );
};
