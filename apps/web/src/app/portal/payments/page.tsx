'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Calendar,
  SlidersHorizontal,
  Download,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Building,
  RotateCcw,
  FileText
} from 'lucide-react';

interface TransactionItem {
  id: string;
  appId: string;
  service: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMode: 'Credit Card' | 'Bank Transfer' | 'Wire Transfer' | 'Pending' | 'UPI / NetBanking';
  status: 'Paid' | 'Partial' | 'Pending';
  date: string; // YYYY-MM-DD
  isPartialPaymentAllowed?: boolean;
  minimumPartialFee?: number | null;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'AMC-2026-768324',
    appId: 'AMC-2026-768324',
    service: 'Commercial High-Speed Fiber Broadband',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-15',
  },
  {
    id: 'AMC-2026-642879',
    appId: 'AMC-2026-642879',
    service: 'Residential FTTH Broadband Setup',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-16',
  },
  {
    id: 'AMC-2026-345706',
    appId: 'AMC-2026-345706',
    service: 'Document Clearance & Legal Verification',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-18',
  },
  {
    id: 'AMC-2026-703488',
    appId: 'AMC-2026-703488',
    service: 'Document Clearance & Legal Verification',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-20',
  },
  {
    id: 'AMC-2026-358677',
    appId: 'AMC-2026-358677',
    service: 'Document Clearance & Legal Verification',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-22',
  },
];

import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomSelect from '@/components/ui/CustomSelect';
import StatCard from '@/components/ui/StatCard';

import { fetchCustomerPaymentsAction } from '@/app/portal/actions';

export default function PaymentsPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Services/Applications');
  
  // Date Filtering State
  const [datePreset, setDatePreset] = useState('All Time');
  const [singleSelectedDate, setSingleSelectedDate] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  React.useEffect(() => {
    async function loadPayments() {
      try {
        // Try loading from DB first
        const dbPayments = await fetchCustomerPaymentsAction();
        if (dbPayments && dbPayments.length > 0) {
          setTransactions(dbPayments.map((p: any) => ({
            id: p.id || p.invoiceNumber || '',
            appId: p.appId || '',
            service: p.service || '',
            totalAmount: p.totalAmount || 0,
            paidAmount: p.paidAmount || 0,
            pendingAmount: p.pendingAmount || 0,
            paymentMode: p.paymentMode || 'Pending',
            status: p.status || 'Pending',
            date: p.date || new Date().toISOString().split('T')[0],
            isPartialPaymentAllowed: p.isPartialPaymentAllowed,
            minimumPartialFee: p.minimumPartialFee,
          })));
          return;
        }

        // Fallback: load from localStorage
        const storageKey = getUserStorageKey(user.email, 'amman_user_payments');
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setTransactions(parsed);
            return;
          }
        }
        setTransactions(INITIAL_TRANSACTIONS);
      } catch (e) {
        console.error('Error loading payments:', e);
        // Final fallback: INITIAL_TRANSACTIONS
        setTransactions(INITIAL_TRANSACTIONS);
      }
    }
    loadPayments();
  }, [user.email]);

  // More Filters State
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [selectedTxnForPayNow, setSelectedTxnForPayNow] = useState<TransactionItem | null>(null);
  const [paymentType, setPaymentType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleExportPDF = async () => {
    if (filteredTransactions.length === 0) {
      showToast('No Transactions', 'There are no transactions to export for the selected filter timeline.', 'warning');
      return;
    }

    const targetWrapper = document.getElementById('payments-statement-pdf-wrapper');
    const targetElement = document.getElementById('payments-statement-pdf-target');
    if (!targetWrapper || !targetElement) return;

    try {
      setIsExportingPDF(true);
      showToast('Generating PDF Statement', 'Preparing official transactions document...', 'info');

      // Temporarily reveal targetWrapper offscreen for html2canvas capture
      targetWrapper.style.position = 'fixed';
      targetWrapper.style.top = '-9999px';
      targetWrapper.style.left = '-9999px';
      targetWrapper.style.display = 'block';

      // Dynamically load html2canvas and jsPDF from CDN if needed
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          if ((window as any).html2canvas) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.body.appendChild(script);
        }),
        new Promise<void>((resolve, reject) => {
          if ((window as any).jspdf) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.body.appendChild(script);
        }),
      ]);

      const html2canvas = (window as any).html2canvas;
      const { jsPDF } = (window as any).jspdf;

      const canvas = await html2canvas(targetElement, {
        scale: 2, // High resolution rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      targetWrapper.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210 mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

      const marginX = 8;
      const marginY = 10;
      const availableWidth = pdfWidth - marginX * 2;   // 194 mm
      const availableHeight = pdfHeight - marginY * 2; // 277 mm

      let imgWidth = availableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = marginY;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      const safeTimeline = getDateTimelineLabel().replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Transactions_Statement_${safeTimeline}.pdf`);

      showToast('PDF Exported Successfully!', `Transactions_Statement_${safeTimeline}.pdf generated.`, 'success');
    } catch (err) {
      console.error('Error generating PDF statement:', err);
      showToast('PDF Generation Failed', 'Failed to generate PDF document.', 'warning');
    } finally {
      setIsExportingPDF(false);
      if (targetWrapper) targetWrapper.style.display = 'none';
    }
  };

  const handlePayNowSubmit = (txn: TransactionItem & { amountToPay?: number }) => {
    const amountPaid = txn.amountToPay || txn.pendingAmount || txn.totalAmount;
    
    setTransactions(
      transactions.map((t) => {
        if (t.id === txn.id) {
          const newPaidAmount = t.paidAmount + amountPaid;
          const newPendingAmount = Math.max(0, t.totalAmount - newPaidAmount);
          const newStatus = newPendingAmount === 0 ? 'Paid' : newPendingAmount < t.totalAmount ? 'Partial' : 'Pending';
          
          return {
            ...t,
            paidAmount: newPaidAmount,
            pendingAmount: newPendingAmount,
            status: newStatus,
            paymentMode: t.paymentMode === 'Pending' ? 'Credit Card' : t.paymentMode
          };
        }
        return t;
      })
    );
    setSelectedTxnForPayNow(null);
    showToast('Payment Completed Successfully!', `Payment for ${txn.service} received.`, 'success', 'View Details', '/portal/payments', true);
  };



  const resetAllFilters = () => {
    setSelectedCategoryFilter('All Services/Applications');
    setFilterStatus('All');
    setFilterMode('All');
    setMinAmount('');
    setMaxAmount('');
    setDatePreset('All Time');
    setSingleSelectedDate('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Filtered transactions logic
  const filteredTransactions = transactions.filter((t) => {
    // Service Filter
    if (
      selectedCategoryFilter !== 'All Services/Applications' &&
      !t.service.toLowerCase().includes(selectedCategoryFilter.toLowerCase())
    ) {
      return false;
    }

    // Status Filter
    if (filterStatus !== 'All' && t.status !== filterStatus) {
      return false;
    }

    // Payment Mode Filter
    if (filterMode !== 'All' && t.paymentMode !== filterMode) {
      return false;
    }

    // Min Amount Filter
    if (minAmount && t.totalAmount < parseFloat(minAmount)) {
      return false;
    }

    // Max Amount Filter
    if (maxAmount && t.totalAmount > parseFloat(maxAmount)) {
      return false;
    }

    // Date Filter
    if (datePreset === 'Select Date') {
      if (singleSelectedDate && t.date !== singleSelectedDate) return false;
    } else if (datePreset === 'Last 30 Days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      if (t.date < thirtyDaysAgoStr) return false;
    } else if (datePreset === 'Custom Date Range') {
      if (customStartDate && t.date < customStartDate) return false;
      if (customEndDate && t.date > customEndDate) return false;
    }

    return true;
  });

  // Calculate dynamic metric card values strictly based on transactions present
  const totalPaidSum = filteredTransactions.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const pendingPaymentsSum = filteredTransactions.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const overdueInvoicesCount = filteredTransactions.filter((t) => t.pendingAmount > 0).length;
  const totalTransactionsCount = filteredTransactions.length;

  // Pagination Math
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDateTimelineLabel = () => {
    if (datePreset === 'Select Date') {
      return singleSelectedDate || 'Selected Date';
    }
    if (datePreset === 'Custom Date Range') {
      if (customStartDate && customEndDate) return `${customStartDate} - ${customEndDate}`;
      if (customStartDate) return `From ${customStartDate}`;
      return 'Custom Range';
    }
    return datePreset;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans pb-1">

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Paid"
          value={formatCurrency(totalPaidSum)}
          sub="Revenue cleared"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(pendingPaymentsSum)}
          sub={overdueInvoicesCount > 0 ? `${overdueInvoicesCount} invoices pending` : 'All caught up'}
          icon={Clock}
          variant="rose"
        />
        <StatCard
          label="Total Invoiced"
          value={formatCurrency(totalPaidSum + pendingPaymentsSum)}
          sub="Cumulative billed"
          icon={CreditCard}
          variant="blue"
        />
        <StatCard
          label="Total Transactions"
          value={totalTransactionsCount}
          sub="Logged receipts"
          icon={Receipt}
          variant="indigo"
        />
      </div>

      {/* Main Transactions Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden space-y-3">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 pb-2 flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Left Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Dropdown */}
            <div className="w-full sm:w-56">
              <CustomSelect
                value={selectedCategoryFilter}
                onChange={setSelectedCategoryFilter}
                options={[
                  'All Services/Applications',
                  'Passport Services & Renewal',
                  'Patta Transfer & Revenue Services',
                  'Encumbrance Certificate (EC)',
                  'Property Registration & Sales Deed',
                  'Legal & Civil Services',
                  'Visa Processing',
                  'Work Permit Renewal'
                ]}
              />
            </div>

            {/* Changeable Date Range Selector Button */}
            <button
              onClick={() => setShowDatePickerModal(true)}
              className="flex items-center gap-2 bg-gray-50/80 border border-gray-200 hover:bg-gray-100 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {datePreset === 'Select Date' && singleSelectedDate
                  ? singleSelectedDate
                  : datePreset === 'Custom Date Range' && customStartDate && customEndDate
                  ? `${customStartDate} - ${customEndDate}`
                  : datePreset}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end sm:justify-start">
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                showMoreFilters
                  ? 'bg-[#0e2a47] text-white border-[#0e2a47]'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-50"
              title="Export Transactions Statement as PDF"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>{isExportingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible "More Filters" Options Panel */}
        {showMoreFilters && (
          <div className="mx-6 p-4 bg-[#f8fafc] border border-gray-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Filter Options</h3>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-gray-500 hover:text-[#0e2a47] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 text-[11px]">Payment Status</label>
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={['All', 'Paid', 'Partial', 'Pending']}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 text-[11px]">Payment Mode</label>
                <CustomSelect
                  value={filterMode}
                  onChange={setFilterMode}
                  options={['All', 'Credit Card', 'Bank Transfer', 'Wire Transfer', 'UPI / NetBanking']}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 text-[11px]">Min Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 text-[11px]">Max Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Data Table Container (Shows 4 entries at a time, entries scrollable) */}
        <div className="overflow-x-auto max-h-[295px] overflow-y-auto admin-scrollbar relative">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[850px]">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="sticky top-0 z-20 py-3.5 px-6 bg-[#f8fafc] border-y border-gray-200/80">SERVICE/APPLICATION</th>
                <th className="sticky top-0 z-20 py-3.5 px-4 bg-[#f8fafc] border-y border-gray-200/80">TOTAL AMOUNT</th>
                <th className="sticky top-0 z-20 py-3.5 px-4 bg-[#f8fafc] border-y border-gray-200/80">PAID AMOUNT</th>
                <th className="sticky top-0 z-20 py-3.5 px-4 bg-[#f8fafc] border-y border-gray-200/80">PENDING AMOUNT</th>
                <th className="sticky top-0 z-20 py-3.5 px-4 bg-[#f8fafc] border-y border-gray-200/80">PAYMENT MODE</th>
                <th className="sticky top-0 z-20 py-3.5 px-4 bg-[#f8fafc] border-y border-gray-200/80">STATUS</th>
                <th className="sticky top-0 z-20 py-3.5 px-6 text-center bg-[#f8fafc] border-y border-gray-200/80">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-800 bg-white">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-medium border-b border-gray-100">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn, index) => {
                  return (
                    <tr key={`${txn.id}-${txn.appId}-${index}`} className="hover:bg-gray-50/70 transition-colors">
                      {/* Service & Application ID */}
                      <td className="py-4 px-6 border-b border-gray-100">
                        <p className="font-bold text-gray-900 leading-tight">{txn.service}</p>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{txn.appId}</p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-bold text-gray-900 border-b border-gray-100">
                        {formatCurrency(txn.totalAmount)}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-4 px-4 font-bold text-gray-900 border-b border-gray-100">
                        {formatCurrency(txn.paidAmount)}
                      </td>

                      {/* Pending Amount */}
                      <td className="py-4 px-4 font-bold border-b border-gray-100">
                        {txn.pendingAmount > 0 ? (
                          <span className="text-rose-600">{formatCurrency(txn.pendingAmount)}</span>
                        ) : (
                          <span className="text-gray-500">{formatCurrency(0)}</span>
                        )}
                      </td>

                      {/* Payment Mode Badge */}
                      <td className="py-4 px-4 border-b border-gray-100">
                        {txn.paymentMode === 'Credit Card' && (
                          <span className="inline-block text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">
                            Credit Card
                          </span>
                        )}
                        {txn.paymentMode === 'Bank Transfer' && (
                          <span className="inline-block text-[11px] font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                            Bank Transfer
                          </span>
                        )}
                        {txn.paymentMode === 'Wire Transfer' && (
                          <span className="inline-block text-[11px] font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-100">
                            Wire Transfer
                          </span>
                        )}
                        {txn.paymentMode === 'Pending' && (
                          <span className="inline-block text-[11px] font-medium text-gray-400 italic bg-gray-50 px-3 py-1 rounded-lg">
                            Pending
                          </span>
                        )}
                        {txn.paymentMode === 'UPI / NetBanking' && (
                          <span className="inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">
                            UPI / NetBanking
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 border-b border-gray-100">
                        {txn.status === 'Paid' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        )}
                        {txn.status === 'Partial' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Partial
                          </span>
                        )}
                        {txn.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-6 text-center border-b border-gray-100">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/portal/payments/${txn.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
                            title="View Official Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-white" />
                            <span>Invoice</span>
                          </Link>

                          {txn.status !== 'Paid' && (
                            <button
                              onClick={() => setSelectedTxnForPayNow(txn)}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
                            >
                              <span>Pay Now</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Total entries counter */}
        <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium bg-gray-50/50">
          <div>
            Showing <span className="font-bold text-gray-900">{filteredTransactions.length}</span> {filteredTransactions.length === 1 ? 'entry' : 'entries'}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#0e2a47] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DATE RANGE SELECTOR MODAL */}
      {mounted && showDatePickerModal && createPortal(
        <div
          onClick={() => setShowDatePickerModal(false)}
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0e2a47]" />
                <h3 className="text-base font-bold text-gray-900">Select Date Timeline</h3>
              </div>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-gray-700">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Select Date',
                  'Last 30 Days',
                  'All Time',
                  'Custom Date Range'
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDatePreset(preset)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      datePreset === preset
                        ? 'border-[#0e2a47] bg-[#f0f7ff] text-[#0e2a47] font-bold ring-1 ring-[#0e2a47]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {datePreset === 'Select Date' && (
                <div className="space-y-1 pt-2">
                  <label className="block font-bold text-gray-600 text-[11px]">Choose Single Date</label>
                  <CustomDatePicker
                    value={singleSelectedDate}
                    onChange={setSingleSelectedDate}
                    disableFuture={true}
                    placeholder="Select specific date"
                  />
                </div>
              )}

              {datePreset === 'Custom Date Range' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 text-[11px]">Start Date</label>
                    <CustomDatePicker
                      value={customStartDate}
                      onChange={(newStart) => {
                        setCustomStartDate(newStart);
                        if (customEndDate && newStart && customEndDate < newStart) {
                          setCustomEndDate(newStart);
                        }
                      }}
                      disableFuture={true}
                      maxDate={customEndDate || undefined}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 text-[11px]">End Date</label>
                    <CustomDatePicker
                      value={customEndDate}
                      onChange={setCustomEndDate}
                      disableFuture={true}
                      minDate={customStartDate || undefined}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Apply Timeline
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Pay Now Confirmation */}
      {mounted && selectedTxnForPayNow && createPortal(
        <div
          onClick={() => setSelectedTxnForPayNow(null)}
          className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-gray-200/90 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Pay Outstanding Balance</h3>
              <button
                onClick={() => setSelectedTxnForPayNow(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2 text-xs text-blue-950">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Service:</span>
                <span className="font-bold text-gray-900">{selectedTxnForPayNow.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Application Ref:</span>
                <span className="font-mono text-gray-800">{selectedTxnForPayNow.appId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200/80">
                <span className="text-gray-700 font-bold">Amount Due:</span>
                <span className="font-extrabold text-rose-600 text-sm">
                  {formatCurrency(selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount)}
                </span>
              </div>
            </div>

            {selectedTxnForPayNow.isPartialPaymentAllowed && selectedTxnForPayNow.minimumPartialFee && selectedTxnForPayNow.pendingAmount > 0 && (
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setPaymentType('FULL')}
                    className={`p-3 border-2 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors ${paymentType === 'FULL' ? 'border-[#0e2a47] bg-[#f0f7ff]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <span className={`font-bold ${paymentType === 'FULL' ? 'text-[#0e2a47]' : 'text-gray-700'}`}>Pay Full Amount</span>
                    <span className="text-[11px] text-gray-500 font-medium">{formatCurrency(selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount)}</span>
                  </div>
                  <div 
                    onClick={() => setPaymentType('PARTIAL')}
                    className={`p-3 border-2 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors ${paymentType === 'PARTIAL' ? 'border-[#0e2a47] bg-[#f0f7ff]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <span className={`font-bold ${paymentType === 'PARTIAL' ? 'text-[#0e2a47]' : 'text-gray-700'}`}>Pay Advance Only</span>
                    <span className="text-[11px] text-gray-500 font-medium">{formatCurrency(selectedTxnForPayNow.minimumPartialFee)} min.</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                Choose Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-2 border-[#0e2a47] bg-[#f0f7ff] rounded-xl flex items-center gap-2 cursor-pointer font-bold text-[#0e2a47]">
                  <CreditCard className="w-4 h-4 text-[#0e2a47]" />
                  <span>UPI / QR Code</span>
                </div>
                <div className="p-3 border border-gray-200 bg-white rounded-xl flex items-center gap-2 cursor-pointer font-semibold text-gray-700 hover:border-gray-300">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>Bank Wire</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTxnForPayNow(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amt = paymentType === 'PARTIAL' && selectedTxnForPayNow.minimumPartialFee ? selectedTxnForPayNow.minimumPartialFee : selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount;
                  if (confirm(`Proceed to pay ${formatCurrency(amt)} via secure gateway?`)) {
                    // Update paid amount in the mock handlePayNowSubmit or we pass it
                    const txnToSubmit = {
                      ...selectedTxnForPayNow,
                      amountToPay: amt,
                    };
                    handlePayNowSubmit(txnToSubmit);
                  }
                }}
                className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Pay {paymentType === 'PARTIAL' && selectedTxnForPayNow.minimumPartialFee ? formatCurrency(selectedTxnForPayNow.minimumPartialFee) : formatCurrency(selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount)} Now
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* HIDDEN RENDER TARGET FOR PDF EXPORT */}
      <div
        id="payments-statement-pdf-wrapper"
        style={{ display: 'none', position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1 }}
      >
        <div
          id="payments-statement-pdf-target"
          style={{ width: '800px', backgroundColor: '#ffffff', color: '#111827', padding: '32px', fontFamily: 'sans-serif' }}
        >
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #12372A', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#12372A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Amman Communications
              </h2>
              <p style={{ fontSize: '11px', color: '#4b5563', margin: '3px 0 0 0', fontWeight: '600' }}>
                Services & Financial Transactions Management Portal
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#12372A', backgroundColor: '#f0f7f2', padding: '4px 12px', borderRadius: '12px', border: '1px solid #a8d5b9', display: 'inline-block' }}>
                OFFICIAL STATEMENT
              </span>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Statement Metadata & Summary Grid */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Account Holder</p>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#111827', fontSize: '13px' }}>{user.name || 'Account User'}</p>
              <p style={{ margin: '2px 0 0 0', color: '#4b5563' }}>{user.email}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Filter Timeline / Category</p>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#12372A' }}>Timeline: {getDateTimelineLabel()}</p>
              <p style={{ margin: '2px 0 0 0', color: '#4b5563' }}>Category: {selectedCategoryFilter}</p>
            </div>
          </div>

          {/* Financial Totals Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', backgroundColor: '#ffffff' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Transactions</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{filteredTransactions.length}</p>
            </div>
            <div style={{ border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', backgroundColor: '#eff6ff' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#1d4ed8', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Amount Paid</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>{formatCurrency(totalPaidSum)}</p>
            </div>
            <div style={{ border: '1px solid #fecdd3', borderRadius: '10px', padding: '12px', backgroundColor: '#fff1f2' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#be123c', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Outstanding</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#9f1239' }}>{formatCurrency(pendingPaymentsSum)}</p>
            </div>
          </div>

          {/* Transactions Data Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#12372A', color: '#ffffff', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                <th style={{ padding: '8px 10px', border: '1px solid #12372A' }}>Date</th>
                <th style={{ padding: '8px 10px', border: '1px solid #12372A' }}>Ref / App ID</th>
                <th style={{ padding: '8px 10px', border: '1px solid #12372A' }}>Service Description</th>
                <th style={{ padding: '8px 10px', border: '1px solid #12372A' }}>Mode</th>
                <th style={{ padding: '8px 10px', border: '1px solid #12372A' }}>Status</th>
                <th style={{ padding: '8px 10px', border: '1px solid #12372A', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, idx) => (
                <tr key={t.id + idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 10px', fontWeight: '600' }}>{t.date}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#4b5563' }}>{t.appId || t.id}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#111827' }}>{t.service}</td>
                  <td style={{ padding: '8px 10px', color: '#4b5563' }}>{t.paymentMode}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: t.status === 'Paid' ? '#dcfce7' : t.status === 'Partial' ? '#fef3c7' : '#ffe4e6',
                      color: t.status === 'Paid' ? '#15803d' : t.status === 'Partial' ? '#b45309' : '#be123c',
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                    {formatCurrency(t.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Statement Disclaimer */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#6b7280' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>Amman Communications Portal Digital Verification Seal</p>
              <p style={{ margin: '2px 0 0 0' }}>This is an official computer-generated transaction statement valid without physical signature.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#12372A' }}>Page 1 of 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
