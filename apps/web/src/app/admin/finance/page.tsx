'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldAlert,
  Wallet,
  X,
} from 'lucide-react';
import {
  FinanceSummary,
  InvoiceItem,
  InvoiceStatus,
  PaymentItem,
  PaymentMethod,
} from '@/lib/api/finance';
import {
  createInvoiceAction,
  fetchFinanceSummary,
  fetchInvoiceById,
  fetchInvoices,
  fetchPayments,
  recordPaymentAction,
  updateInvoiceStatusAction,
} from './actions';
import { fetchAdminCustomers } from '../customers/actions';
import { fetchAdminServices } from '../services/actions';
import { Customer } from '@/lib/api/customers';
import { Service } from '@/lib/api/services';
import CustomSelect from '@/components/CustomSelect';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

  // Summary state
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState<number>(0);
  const [invoicePage, setInvoicePage] = useState<number>(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState<number>(1);
  const [invoicesLoading, setInvoicesLoading] = useState<boolean>(true);

  // Payments state
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentTotal, setPaymentTotal] = useState<number>(0);
  const [paymentPage, setPaymentPage] = useState<number>(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState<number>(1);
  const [paymentsLoading, setPaymentsLoading] = useState<boolean>(true);

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [invoiceStatus, setInvoiceStatus] = useState<string>('ALL');
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL');
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Dropdown reference lists
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [serviceList, setServiceList] = useState<Service[]>([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  // Form states - Create Invoice
  const [createCustomerId, setCreateCustomerId] = useState<string>('');
  const [createServiceId, setCreateServiceId] = useState<string>('');
  const [createGovtFee, setCreateGovtFee] = useState<string>('0');
  const [createServiceFee, setCreateServiceFee] = useState<string>('0');
  const [createDueDate, setCreateDueDate] = useState<string>('');
  const [createNotes, setCreateNotes] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states - Record Payment
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payReference, setPayReference] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Date Preset Handler
  const handleDatePreset = (preset: string) => {
    setDateFilterPreset(preset);
    const now = new Date();

    if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === '7DAYS') {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setFromDate(d.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    } else if (preset === '30DAYS') {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setFromDate(d.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    } else if (preset === 'LAST_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'THIS_YEAR') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    }
  };

  // Load summary
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    const res = await fetchFinanceSummary(fromDate || undefined, toDate || undefined);
    if (res.summary) {
      setSummary(res.summary);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setSummaryLoading(false);
  }, [fromDate, toDate]);

  // Load invoices
  const loadInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    const res = await fetchInvoices({
      page: invoicePage,
      limit: 10,
      search: search.trim() || undefined,
      status: invoiceStatus !== 'ALL' ? invoiceStatus : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    });
    if (res.data) {
      setInvoices(res.data.items);
      setInvoiceTotal(res.data.total);
      setInvoiceTotalPages(res.data.totalPages);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setInvoicesLoading(false);
  }, [invoicePage, search, invoiceStatus, fromDate, toDate]);

  // Load payments
  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    const res = await fetchPayments({
      page: paymentPage,
      limit: 10,
      search: search.trim() || undefined,
      paymentMethod: paymentMethod !== 'ALL' ? paymentMethod : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    });
    if (res.data) {
      setPayments(res.data.items);
      setPaymentTotal(res.data.total);
      setPaymentTotalPages(res.data.totalPages);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setPaymentsLoading(false);
  }, [paymentPage, search, paymentMethod, fromDate, toDate]);

  // Load reference dropdowns
  const loadDropdowns = useCallback(async () => {
    const [custRes, srvRes] = await Promise.all([
      fetchAdminCustomers('', 'ALL', 1, 100),
      fetchAdminServices(),
    ]);
    if (custRes.data) setCustomerList(custRes.data.items);
    if (srvRes.services) setServiceList(srvRes.services);
  }, []);

  // Initial load
  useEffect(() => {
    loadSummary();
    loadDropdowns();
  }, [loadSummary, loadDropdowns]);

  // Tab and filter triggers
  useEffect(() => {
    if (activeTab === 'invoices') {
      loadInvoices();
    } else {
      loadPayments();
    }
  }, [activeTab, loadInvoices, loadPayments]);

  // When Service changes in Create Modal, auto-populate default Govt & Service Fees
  const handleSelectService = (srvId: string) => {
    setCreateServiceId(srvId);
    if (!srvId) return;
    const found = serviceList.find((s) => s.id === srvId);
    if (found) {
      setCreateGovtFee(String(found.governmentFee || 0));
      setCreateServiceFee(String(found.serviceFee || 0));
    }
  };

  // Live total calculation in Create Modal
  const calculatedCreateTotal = useMemo(() => {
    const gov = parseFloat(createGovtFee) || 0;
    const svc = parseFloat(createServiceFee) || 0;
    return (gov + svc).toFixed(2);
  }, [createGovtFee, createServiceFee]);

  // Handle Open Create Invoice Modal
  const handleOpenCreateModal = () => {
    setCreateCustomerId(customerList[0]?.id || '');
    setCreateServiceId('');
    setCreateGovtFee('0');
    setCreateServiceFee('0');
    const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setCreateDueDate(defaultDue);
    setCreateNotes('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Submit Create Invoice
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createCustomerId) {
      setFormError('Please select a customer.');
      return;
    }

    const govFeeNum = parseFloat(createGovtFee);
    const svcFeeNum = parseFloat(createServiceFee);

    if (isNaN(govFeeNum) || govFeeNum < 0 || isNaN(svcFeeNum) || svcFeeNum < 0) {
      setFormError('Fees must be non-negative numbers.');
      return;
    }

    setFormSubmitting(true);
    const res = await createInvoiceAction({
      customerId: createCustomerId,
      serviceId: createServiceId || undefined,
      governmentFee: govFeeNum,
      serviceFee: svcFeeNum,
      dueDate: createDueDate || undefined,
      notes: createNotes || undefined,
    });

    if (res.error) {
      setFormError(res.error);
    } else {
      setIsCreateModalOpen(false);
      setSuccessMessage(`Invoice "${res.invoice?.invoiceNumber}" created successfully!`);
      loadSummary();
      loadInvoices();
    }
    setFormSubmitting(false);
  };

  // Handle Open Record Payment Modal
  const handleOpenPaymentModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setPayAmount(String(inv.outstandingAmount > 0 ? inv.outstandingAmount : inv.totalAmount));
    setPayMethod('BANK_TRANSFER');
    setPayReference('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayNotes('');
    setFormError(null);
    setIsPaymentModalOpen(true);
  };

  // Submit Record Payment
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setFormError(null);

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    setFormSubmitting(true);
    const res = await recordPaymentAction(selectedInvoice.id, {
      amount: amountNum,
      paymentMethod: payMethod,
      reference: payReference || undefined,
      notes: payNotes || undefined,
      paidAt: payDate ? new Date(payDate).toISOString() : undefined,
    });

    if (res.error) {
      setFormError(res.error);
    } else {
      setIsPaymentModalOpen(false);
      setSuccessMessage(`Payment "${res.payment?.paymentNumber}" recorded successfully!`);
      loadSummary();
      if (activeTab === 'invoices') loadInvoices();
      else loadPayments();
    }
    setFormSubmitting(false);
  };

  // View Invoice Detail Drawer/Modal
  const handleViewInvoiceDetails = async (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
    // Fetch fresh complete invoice with payments
    const res = await fetchInvoiceById(inv.id);
    if (res.invoice) {
      setSelectedInvoice(res.invoice);
    }
  };

  // Toggle Cancel Invoice
  const handleCancelInvoice = async (inv: InvoiceItem) => {
    if (!confirm(`Are you sure you want to cancel Invoice "${inv.invoiceNumber}"?`)) return;
    const res = await updateInvoiceStatusAction(inv.id, 'CANCELLED');
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSuccessMessage(`Invoice "${inv.invoiceNumber}" has been cancelled.`);
      loadSummary();
      loadInvoices();
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            PARTIAL
          </span>
        );
      case 'UNPAID':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            UNPAID
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            OVERDUE
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            CANCELLED
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  // Payment Method Badge
  const renderPaymentMethodBadge = (method: PaymentMethod) => {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
        <CreditCard className="h-3 w-3 text-gray-500" />
        {method.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-8 pb-12">
      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm font-medium shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 p-1 rounded-md hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Admin Portal
            </p>
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500">Finance & Billing</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Financial Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor revenue, track invoice collections, manage fee breakdowns, and record customer payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              loadSummary();
              if (activeTab === 'invoices') loadInvoices();
              else loadPayments();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invoiced */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Invoiced
            </p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 font-mono">
            {summaryLoading ? '...' : `₹${(summary?.totalInvoiced || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{summary?.invoiceCount || 0} total invoices</span>
            <span className="text-emerald-700 font-medium">Billed</span>
          </div>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Collected
            </p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700 font-mono">
            {summaryLoading ? '...' : `₹${(summary?.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{summary?.paymentCount || 0} payment transactions</span>
            <span className="text-emerald-700 font-semibold">
              {summary && summary.totalInvoiced > 0
                ? `${Math.round((summary.totalPaid / summary.totalInvoiced) * 100)}% Collected`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Outstanding Balance
            </p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-800">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-800 font-mono">
            {summaryLoading ? '...' : `₹${(summary?.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Pending collection</span>
            <span className="text-amber-700 font-medium">Receivable</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Overdue Amount
            </p>
            <div className="rounded-lg bg-red-50 p-2 text-red-800">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-red-700 font-mono">
            {summaryLoading ? '...' : `₹${(summary?.totalOverdue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Past due date</span>
            <span className="text-red-600 font-medium">Requires Action</span>
          </div>
        </div>
      </div>

      {/* Secondary Fee Breakdown Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200/70 px-5 py-3">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-emerald-800" />
            <div>
              <p className="text-xs font-semibold text-emerald-950 uppercase tracking-wide">Government Fees</p>
              <p className="text-xs text-emerald-800">Regulatory and telecom licensing levies</p>
            </div>
          </div>
          <p className="text-lg font-bold text-emerald-950 font-mono">
            ₹{(summary?.governmentFeesTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-slate-700" />
            <div>
              <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Service Revenue Fees</p>
              <p className="text-xs text-slate-600">Amman Communications setup & management charges</p>
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            ₹{(summary?.serviceFeesTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Main Content Area: Tabs + Tables */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        {/* Invoices Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
            <FileText className="h-5 w-5 text-emerald-800" />
            <span>Invoices</span>
            <span className="ml-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {invoiceTotal}
            </span>
          </div>
        </div>

        {/* Controls (Search & Status Filter) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gray-50/50 border-b border-gray-200">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, customer..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 shadow-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNPAID', label: 'Unpaid' },
              { id: 'PARTIALLY_PAID', label: 'Partial' },
              { id: 'PAID', label: 'Paid' },
              { id: 'OVERDUE', label: 'Overdue' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setInvoiceStatus(pill.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  invoiceStatus === pill.id
                    ? 'bg-emerald-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div>
            {invoicesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-800" />
                <p className="mt-3 text-sm font-semibold text-gray-700">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">No invoices found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  {search || invoiceStatus !== 'ALL' || fromDate
                    ? 'No invoices match your current search or date filters.'
                    : 'Get started by creating your first invoice for a customer.'}
                </p>
                {search || invoiceStatus !== 'ALL' || fromDate ? (
                  <button
                    onClick={() => {
                      setSearch('');
                      setInvoiceStatus('ALL');
                      handleDatePreset('ALL');
                    }}
                    className="mt-4 text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    Clear all filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-semibold tracking-wider text-gray-500 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[150px]">Invoice #</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[180px]">Customer</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[180px]">Service</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[110px]">Govt Fee</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[110px]">Service Fee</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[110px]">Total Amount</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[110px]">Paid Amount</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[110px]">Outstanding</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[120px]">Status</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[120px]">Due Date</th>
                      <th scope="col" className="px-6 py-3.5 whitespace-nowrap text-right min-w-[150px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/80 transition">
                        {/* Invoice Number */}
                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900">
                          <button
                            type="button"
                            onClick={() => handleViewInvoiceDetails(inv)}
                            className="hover:text-emerald-800 hover:underline inline-flex items-center gap-1.5"
                          >
                            {inv.invoiceNumber}
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">{inv.customer.name}</p>
                          <p className="text-xs text-gray-400">{inv.customer.email}</p>
                        </td>

                        {/* Service */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 font-medium">
                          {inv.service?.name || <span className="text-gray-400 italic">Custom Service</span>}
                        </td>

                        {/* Govt Fee */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-700">
                          ₹{inv.governmentFee.toFixed(2)}
                        </td>

                        {/* Service Fee */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-700">
                          ₹{inv.serviceFee.toFixed(2)}
                        </td>

                        {/* Total Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-gray-900">
                          ₹{inv.totalAmount.toFixed(2)}
                        </td>

                        {/* Paid Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-semibold text-emerald-700">
                          ₹{inv.paidAmount.toFixed(2)}
                        </td>

                        {/* Outstanding Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-amber-800">
                          {inv.outstandingAmount > 0 ? (
                            `₹${inv.outstandingAmount.toFixed(2)}`
                          ) : (
                            <span className="text-gray-400 font-normal">₹0.00</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatusBadge(inv.status)}
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {inv.dueDate ? (
                            new Date(inv.dueDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition inline-flex items-center gap-1"
                            >
                              <Banknote className="h-3 w-3" /> Pay
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleViewInvoiceDetails(inv)}
                            className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition inline-flex items-center align-middle"
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {inv.status !== 'CANCELLED' && inv.paidAmount === 0 && (
                            <button
                              type="button"
                              onClick={() => handleCancelInvoice(inv)}
                              className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition inline-flex items-center align-middle"
                              title="Cancel Invoice"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {invoices.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Showing page <span className="font-semibold text-gray-900">{invoicePage}</span> of{' '}
                  <span className="font-semibold text-gray-900">{invoiceTotalPages}</span> ({invoiceTotal} invoices)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={invoicePage <= 1}
                    onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={invoicePage >= invoiceTotalPages}
                    onClick={() => setInvoicePage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>

      {/* ==========================================================
          MODAL: RECORD PAYMENT MODAL
          ========================================================== */}

      {/* ==========================================================
          MODAL 2: RECORD PAYMENT MODAL
          ========================================================== */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Record Payment</h3>
                  <p className="text-xs text-gray-500">Invoice: {selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Invoice Summary Banner */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-semibold text-gray-900">{selectedInvoice.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Billed:</span>
                  <span className="font-mono font-bold text-gray-900">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Already Paid:</span>
                  <span className="font-mono font-semibold text-emerald-700">₹{selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 text-sm font-bold">
                  <span className="text-amber-900">Remaining Balance:</span>
                  <span className="font-mono text-amber-900">₹{selectedInvoice.outstandingAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base font-mono font-bold border border-gray-200 rounded-xl bg-white text-emerald-800 focus:outline-none focus:border-emerald-800"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={payMethod}
                  onChange={(val) => setPayMethod(val as PaymentMethod)}
                  options={[
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer / Wire' },
                    { value: 'UPI', label: 'UPI / Instant Payment' },
                    { value: 'CASH', label: 'Cash' },
                    { value: 'CREDIT_CARD', label: 'Credit Card' },
                    { value: 'DEBIT_CARD', label: 'Debit Card' },
                    { value: 'CHEQUE', label: 'Cheque / Demand Draft' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Transaction Reference / Cheque #
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. TXN-HDFC-998811 or Cheque #102938"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-800"
                />
              </div>

              {/* Paid Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-800"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 disabled:opacity-50 transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {formSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 3: INVOICE DETAIL MODAL
          ========================================================== */}
      {isDetailModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50 sticky top-0 bg-gray-50 z-10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Invoice {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Created on {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Status Banner */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Customer Details</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedInvoice.customer.name}</p>
                  <p className="text-xs text-gray-600">{selectedInvoice.customer.email}</p>
                  {selectedInvoice.customer.phone && (
                    <p className="text-xs text-gray-600 font-mono">{selectedInvoice.customer.phone}</p>
                  )}
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Invoice Status</p>
                  <div className="mt-1">{renderStatusBadge(selectedInvoice.status)}</div>
                  {selectedInvoice.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Financial Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Charge Breakdown
                </h4>
                <div className="rounded-xl border border-gray-200 overflow-hidden text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5">Component</th>
                        <th className="px-4 py-2.5">Description</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-xs">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-gray-900">Government Fee</td>
                        <td className="px-4 py-3 text-gray-500 font-sans">Regulatory / Official fees</td>
                        <td className="px-4 py-3 text-right text-gray-900">₹{selectedInvoice.governmentFee.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-gray-900">Service Fee</td>
                        <td className="px-4 py-3 text-gray-500 font-sans">
                          {selectedInvoice.service?.name || 'Processing & Management Fee'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900">₹{selectedInvoice.serviceFee.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-50/80 font-bold text-sm">
                        <td className="px-4 py-3 text-gray-900 font-sans" colSpan={2}>
                          Total Billed
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-950">
                          ₹{selectedInvoice.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">Total Paid</p>
                  <p className="text-xl font-bold font-mono text-emerald-900 mt-1">
                    ₹{selectedInvoice.paidAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Outstanding</p>
                  <p className="text-xl font-bold font-mono text-amber-900 mt-1">
                    ₹{selectedInvoice.outstandingAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment History Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Payment History ({selectedInvoice.payments?.length || 0})
                  </h4>
                  {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleOpenPaymentModal(selectedInvoice);
                      }}
                      className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" /> Record Payment
                    </button>
                  )}
                </div>

                {selectedInvoice.payments && selectedInvoice.payments.length > 0 ? (
                  <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 font-semibold text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-3.5 py-2">Payment #</th>
                          <th className="px-3.5 py-2">Amount</th>
                          <th className="px-3.5 py-2">Method</th>
                          <th className="px-3.5 py-2">Reference</th>
                          <th className="px-3.5 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.payments.map((p) => (
                          <tr key={p.id} className="font-mono">
                            <td className="px-3.5 py-2.5 font-bold text-gray-900">{p.paymentNumber}</td>
                            <td className="px-3.5 py-2.5 font-bold text-emerald-700">₹{p.amount.toFixed(2)}</td>
                            <td className="px-3.5 py-2.5 font-sans">{renderPaymentMethodBadge(p.paymentMethod)}</td>
                            <td className="px-3.5 py-2.5 text-gray-600">{p.reference || '—'}</td>
                            <td className="px-3.5 py-2.5 text-gray-500 font-sans">
                              {new Date(p.paidAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    No payments recorded yet for this invoice.
                  </p>
                )}
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-gray-700">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
              <Link
                href={`/admin/finance/invoices/${selectedInvoice.id}`}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Full Invoice Page
              </Link>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
