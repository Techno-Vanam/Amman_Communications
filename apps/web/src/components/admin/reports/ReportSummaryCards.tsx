'use client';

import React from 'react';
import styles from './ReportSummaryCards.module.css';
import {
  Users,
  FileText,
  Layers,
  IndianRupee,
  Clock,
  FileCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export interface SummaryData {
  totalCustomers: number;
  totalApplications: number;
  activeServices: number;
  totalRevenue: number;
  pendingApplications: number;
  pendingDocuments: number;
  upcomingAppointments: number;
  outstandingPayments: number;
  totalBilled?: number;
}

interface ReportSummaryCardsProps {
  data?: SummaryData;
  loading?: boolean;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ data, loading }) => {
  const cards = [
    {
      id: 'customers',
      title: 'Total Customers',
      value: data?.totalCustomers !== undefined ? data.totalCustomers.toLocaleString('en-IN') : '—',
      icon: Users,
      accent: 'green',
    },
    {
      id: 'applications',
      title: 'Total Applications',
      value: data?.totalApplications !== undefined ? data.totalApplications.toLocaleString('en-IN') : '—',
      icon: FileText,
      accent: 'blue',
    },
    {
      id: 'services',
      title: 'Active Services',
      value: data?.activeServices !== undefined ? data.activeServices.toLocaleString('en-IN') : '—',
      icon: Layers,
      accent: 'purple',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: data?.totalRevenue !== undefined ? `₹${data.totalRevenue.toLocaleString('en-IN')}` : '—',
      icon: IndianRupee,
      accent: 'emerald',
    },
    {
      id: 'pendingApps',
      title: 'Pending Applications',
      value: data?.pendingApplications !== undefined ? data.pendingApplications.toLocaleString('en-IN') : '—',
      icon: Clock,
      accent: 'amber',
    },
    {
      id: 'pendingDocs',
      title: 'Pending Documents',
      value: data?.pendingDocuments !== undefined ? data.pendingDocuments.toLocaleString('en-IN') : '—',
      icon: FileCheck,
      accent: 'indigo',
    },
    {
      id: 'upcomingAppts',
      title: 'Upcoming Appointments',
      value: data?.upcomingAppointments !== undefined ? data.upcomingAppointments.toLocaleString('en-IN') : '—',
      icon: Calendar,
      accent: 'teal',
    },
    {
      id: 'outstanding',
      title: 'Outstanding Payments',
      value: data?.outstandingPayments !== undefined ? `₹${data.outstandingPayments.toLocaleString('en-IN')}` : '—',
      icon: AlertCircle,
      accent: 'rose',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className={`${styles.card} ${styles[`accent_${c.accent}`]}`}>
            <div className={styles.iconWrapper}>
              <Icon size={20} />
            </div>
            <div className={styles.content}>
              <span className={styles.title}>{c.title}</span>
              {loading ? (
                <div className={styles.skeletonValue} />
              ) : (
                <h3 className={styles.value}>{c.value}</h3>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
