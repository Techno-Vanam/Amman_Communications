'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import styles from '@/app/admin/reports/page.module.css';
import { ExportButtons } from './ExportButtons';
import { ReportFilters } from './ReportFilters';
import { ReportSummaryCards, SummaryData } from './ReportSummaryCards';
import { ApplicationReport, ApplicationReportData } from './ApplicationReport';
import { ServiceReport, ServiceReportData } from './ServiceReport';
import { CustomerReport, CustomerReportData } from './CustomerReport';
import { DocumentReport, DocumentReportData } from './DocumentReport';
import { AppointmentReport, AppointmentReportData } from './AppointmentReport';
import { FinanceReport, FinanceReportData } from './FinanceReport';
import {
  ReportFilters as ReportFiltersType,
  getReportSummaryAction,
  getApplicationReportAction,
  getServiceReportAction,
  getCustomerReportAction,
  getDocumentReportAction,
  getAppointmentReportAction,
  getFinanceReportAction,
} from '@/app/admin/reports/actions';
import {
  RotateCcw,
  LayoutDashboard,
  FileText,
  Layers,
  Users,
  FileCheck,
  Calendar,
  IndianRupee,
} from 'lucide-react';

interface ServiceOption {
  id: string;
  name: string;
}

type ReportSectionTab =
  | 'overview'
  | 'applications'
  | 'services'
  | 'customers'
  | 'documents'
  | 'appointments'
  | 'finance';

export const ReportsClient: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active section tab
  const [activeTab, setActiveTab] = useState<ReportSectionTab>(() => {
    const tabParam = searchParams.get('tab') as ReportSectionTab;
    const validTabs: ReportSectionTab[] = [
      'overview',
      'applications',
      'services',
      'customers',
      'documents',
      'appointments',
      'finance',
    ];
    return validTabs.includes(tabParam) ? tabParam : 'overview';
  });

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<ReportFiltersType>(() => ({
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
    serviceId: searchParams.get('serviceId') || undefined,
    applicationStatus: searchParams.get('applicationStatus') || undefined,
    paymentStatus: searchParams.get('paymentStatus') || undefined,
    search: searchParams.get('search') || undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
  }));

  const [servicesList, setServicesList] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Domain states
  const [summaryData, setSummaryData] = useState<SummaryData | undefined>(undefined);
  const [applicationsData, setApplicationsData] = useState<ApplicationReportData | undefined>(undefined);
  const [servicesData, setServicesData] = useState<ServiceReportData | undefined>(undefined);
  const [customersData, setCustomersData] = useState<CustomerReportData | undefined>(undefined);
  const [documentsData, setDocumentsData] = useState<DocumentReportData | undefined>(undefined);
  const [appointmentsData, setAppointmentsData] = useState<AppointmentReportData | undefined>(undefined);
  const [financeData, setFinanceData] = useState<FinanceReportData | undefined>(undefined);

  // Sync state to URL search params
  const updateUrlParams = useCallback(
    (newFilters: ReportFiltersType, tab: ReportSectionTab) => {
      const params = new URLSearchParams();
      if (tab !== 'overview') params.set('tab', tab);
      if (newFilters.from) params.set('from', newFilters.from);
      if (newFilters.to) params.set('to', newFilters.to);
      if (newFilters.serviceId && newFilters.serviceId !== 'ALL') params.set('serviceId', newFilters.serviceId);
      if (newFilters.applicationStatus && newFilters.applicationStatus !== 'ALL') params.set('applicationStatus', newFilters.applicationStatus);
      if (newFilters.paymentStatus && newFilters.paymentStatus !== 'ALL') params.set('paymentStatus', newFilters.paymentStatus);
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [pathname, router]
  );

  const fetchAllReports = useCallback(async (currentFilters: ReportFiltersType) => {
    setLoading(true);
    setError(null);

    try {
      const [
        sumRes,
        appRes,
        svcRes,
        custRes,
        docRes,
        aptRes,
        finRes,
      ] = await Promise.all([
        getReportSummaryAction(currentFilters),
        getApplicationReportAction(currentFilters),
        getServiceReportAction(currentFilters),
        getCustomerReportAction(currentFilters),
        getDocumentReportAction(currentFilters),
        getAppointmentReportAction(currentFilters),
        getFinanceReportAction(currentFilters),
      ]);

      if (sumRes.success) setSummaryData(sumRes.data);
      if (appRes.success) setApplicationsData(appRes.data);
      if (svcRes.success) {
        setServicesData(svcRes.data);
        if (svcRes.data?.items) {
          setServicesList(svcRes.data.items.map((s: any) => ({ id: s.id, name: s.name })));
        }
      }
      if (custRes.success) setCustomersData(custRes.data);
      if (docRes.success) setDocumentsData(docRes.data);
      if (aptRes.success) setAppointmentsData(aptRes.data);
      if (finRes.success) setFinanceData(finRes.data);

      if (
        !sumRes.success &&
        !appRes.success &&
        !svcRes.success &&
        !custRes.success &&
        !docRes.success &&
        !aptRes.success &&
        !finRes.success
      ) {
        setError('Unable to load report data from the server.');
      }
    } catch (err: any) {
      console.error('Report fetch error:', err);
      setError('Unable to load report. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReports(filters);
  }, [fetchAllReports, filters]);

  const handleFilterChange = (newFilters: ReportFiltersType) => {
    setFilters(newFilters);
    updateUrlParams(newFilters, activeTab);
  };

  const handleTabChange = (tab: ReportSectionTab) => {
    setActiveTab(tab);
    updateUrlParams(filters, tab);
  };

  const handleAppPageChange = (newPage: number) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    updateUrlParams(updated, activeTab);
  };

  const tabsConfig = [
    {
      id: 'overview' as const,
      label: 'All Overview',
      icon: LayoutDashboard,
      count: summaryData?.totalApplications,
    },
    {
      id: 'applications' as const,
      label: 'Applications',
      icon: FileText,
      count: applicationsData?.total ?? summaryData?.totalApplications,
    },
    {
      id: 'services' as const,
      label: 'Services',
      icon: Layers,
      count: servicesData?.total ?? summaryData?.activeServices,
    },
    {
      id: 'customers' as const,
      label: 'Customers',
      icon: Users,
      count: customersData?.total ?? summaryData?.totalCustomers,
    },
    {
      id: 'documents' as const,
      label: 'Documents',
      icon: FileCheck,
      count: documentsData?.total ?? summaryData?.pendingDocuments,
    },
    {
      id: 'appointments' as const,
      label: 'Appointments',
      icon: Calendar,
      count: appointmentsData?.total ?? summaryData?.upcomingAppointments,
    },
    {
      id: 'finance' as const,
      label: 'Finance',
      icon: IndianRupee,
      count: financeData?.invoices?.length,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Reports</h1>
          <p className={styles.pageSubtitle}>
            Monitor applications, services, customers, documents, appointments and financial performance.
          </p>
        </div>

        {/* Export Buttons */}
        <ExportButtons filters={filters} activeTab={activeTab} />
      </div>

      {/* Filter Controls Bar */}
      <ReportFilters
        filters={filters}
        onChange={handleFilterChange}
        services={servicesList}
      />

      {/* Section Tabs Navigation */}
      <div className={styles.tabNavWrapper}>
        <div className={styles.tabNav}>
          {tabsConfig.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.tabBtn} ${isActive ? styles.tabActive : ''}`}
                onClick={() => handleTabChange(t.id)}
              >
                <Icon size={16} />
                <span>{t.label}</span>
                {t.count !== undefined && t.count !== null && (
                  <span className={styles.tabBadge}>
                    {typeof t.count === 'number' ? t.count.toLocaleString('en-IN') : t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error / Retry Banner */}
      {error && (
        <div className={styles.errorCard}>
          <h3>Unable to load report</h3>
          <p>{error}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => fetchAllReports(filters)}
          >
            <RotateCcw size={15} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Content Sections based on Active Tab */}
      <div className={styles.reportsContent}>
        {/* Overview Tab: Displays 8 summary cards + all report sections */}
        {activeTab === 'overview' && (
          <>
            <ReportSummaryCards data={summaryData} loading={loading} />
            <ApplicationReport
              data={applicationsData}
              loading={loading}
              onPageChange={handleAppPageChange}
            />
            <ServiceReport data={servicesData} loading={loading} />
            <CustomerReport
              data={customersData}
              loading={loading}
              onPageChange={handleAppPageChange}
            />
            <DocumentReport
              data={documentsData}
              loading={loading}
              onPageChange={handleAppPageChange}
            />
            <AppointmentReport
              data={appointmentsData}
              loading={loading}
              onPageChange={handleAppPageChange}
            />
            <FinanceReport data={financeData} loading={loading} />
          </>
        )}

        {/* Individual Section Tabs */}
        {activeTab === 'applications' && (
          <ApplicationReport
            data={applicationsData}
            loading={loading}
            onPageChange={handleAppPageChange}
          />
        )}

        {activeTab === 'services' && (
          <ServiceReport data={servicesData} loading={loading} />
        )}

        {activeTab === 'customers' && (
          <CustomerReport
            data={customersData}
            loading={loading}
            onPageChange={handleAppPageChange}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentReport
            data={documentsData}
            loading={loading}
            onPageChange={handleAppPageChange}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentReport
            data={appointmentsData}
            loading={loading}
            onPageChange={handleAppPageChange}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceReport data={financeData} loading={loading} />
        )}
      </div>
    </div>
  );
};
