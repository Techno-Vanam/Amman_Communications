'use client';

import React, { useState } from 'react';
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
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [];

import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomSelect from '@/components/ui/CustomSelect';

export default function PaymentsPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Services/Applications');
  
  // Date Filtering State
  const [datePreset, setDatePreset] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  React.useEffect(() => {
    try {
      const storageKey = getUserStorageKey(user.email, 'amman_user_payments');
      const saved = localStorage.getItem(storageKey);
      setTransactions(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error('Error loading payments:', e);
      setTransactions([]);
    }
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
  const [selectedTxnForReceipt, setSelectedTxnForReceipt] = useState<TransactionItem | null>(null);
  const [selectedTxnForPayNow, setSelectedTxnForPayNow] = useState<TransactionItem | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Receipt Download Function
  const handleDownloadReceipt = (txn: TransactionItem) => {
    const receiptContent = `=====================================================
AMMAN COMMUNICATIONS HQ - OFFICIAL PAYMENT RECEIPT
=====================================================
Receipt Number : ${txn.id}
Application Ref: ${txn.appId}
Date           : ${txn.date}
Service        : ${txn.service}
Payment Mode   : ${txn.paymentMode}
Status         : ${txn.status}
-----------------------------------------------------
Total Amount   : ₹${txn.totalAmount.toFixed(2)}
Paid Amount    : ₹${txn.paidAmount.toFixed(2)}
Pending Amount : ₹${txn.pendingAmount.toFixed(2)}
-----------------------------------------------------
Thank you for using Amman Communications Portal!
Digital Tax Reference: TAX-INV-${txn.id}
=====================================================`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${txn.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Receipt Downloaded Successfully!', `Receipt-${txn.id}.txt saved.`);
  };

  const handlePayNowSubmit = (txn: TransactionItem) => {
    setTransactions(
      transactions.map((t) =>
        t.id === txn.id
          ? {
              ...t,
              paidAmount: t.totalAmount,
              pendingAmount: 0,
              status: 'Paid',
              paymentMode: t.paymentMode === 'Pending' ? 'Credit Card' : t.paymentMode
            }
          : t
      )
    );
    setSelectedTxnForPayNow(null);
    showToast('Payment Completed Successfully!', `Payment for ${txn.service} received.`);
  };



  const resetAllFilters = () => {
    setSelectedCategoryFilter('All Services/Applications');
    setFilterStatus('All');
    setFilterMode('All');
    setMinAmount('');
    setMaxAmount('');
    setDatePreset('Oct 1, 2023 - Oct 31, 2023');
    setCustomStartDate('2023-10-01');
    setCustomEndDate('2023-10-31');
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

    // Date Range Filter
    if (datePreset === 'Oct 1, 2023 - Oct 31, 2023') {
      if (t.date < '2023-10-01' || t.date > '2023-10-31') return false;
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-12">

      {/* 3 Metric Cards - Dynamically reflect transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Paid */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs relative flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide">Total Paid</span>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-4">
              {formatCurrency(totalPaidSum)}
            </p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
              Last 30 days
            </span>
          </div>
        </div>

        {/* Card 2: Pending Payments */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs relative flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide">Pending Payments</span>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-4">
              {formatCurrency(pendingPaymentsSum)}
            </p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/60">
              {overdueInvoicesCount} Invoices Overdue
            </span>
          </div>
        </div>

        {/* Card 3: Total Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs relative flex flex-col justify-between h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide">Total Transactions</span>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-4">
              {totalTransactionsCount}
            </p>
          </div>
          <div>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200/60">
              All time
            </span>
          </div>
        </div>
      </div>

      {/* Main Transactions Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden space-y-4">
        {/* Filter Toolbar */}
        <div className="p-6 pb-2 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Dropdown */}
            <div className="w-56">
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
              className="flex items-center gap-2 bg-gray-50/80 border border-gray-200 hover:bg-gray-100 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{datePreset}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 self-end md:self-auto">
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
              onClick={() => {
                const csvData = filteredTransactions
                  .map((t) => `${t.id},${t.service},${t.totalAmount},${t.paymentMode},${t.status}`)
                  .join('\n');
                const blob = new Blob([`ID,Service,Amount,Mode,Status\n${csvData}`], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Transactions_Export.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export</span>
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-y border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-[#f8fafc]">
                <th className="py-3.5 px-6">SERVICE/APPLICATION</th>
                <th className="py-3.5 px-4">TOTAL AMOUNT</th>
                <th className="py-3.5 px-4">PAID AMOUNT</th>
                <th className="py-3.5 px-4">PENDING AMOUNT</th>
                <th className="py-3.5 px-4">PAYMENT MODE</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => {
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Service & Application ID */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 leading-tight">{txn.service}</p>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{txn.appId}</p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {formatCurrency(txn.totalAmount)}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {formatCurrency(txn.paidAmount)}
                      </td>

                      {/* Pending Amount */}
                      <td className="py-4 px-4 font-bold">
                        {txn.pendingAmount > 0 ? (
                          <span className="text-rose-600">{formatCurrency(txn.pendingAmount)}</span>
                        ) : (
                          <span className="text-gray-500">{formatCurrency(0)}</span>
                        )}
                      </td>

                      {/* Payment Mode Badge */}
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-6 text-center">
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

        {/* Table Pagination Footer - Render page numbers ONLY if totalPages > 1 */}
        <div className="p-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <div>
            Showing {filteredTransactions.length === 0 ? 0 : 1} to {filteredTransactions.length} of {filteredTransactions.length} entries
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
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0e2a47]" />
                <h3 className="text-base font-bold text-gray-900">Select Date Timeline</h3>
              </div>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-gray-700">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Oct 1, 2023 - Oct 31, 2023',
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

              {datePreset === 'Custom Date Range' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 text-[11px]">Start Date</label>
                    <CustomDatePicker
                      value={customStartDate}
                      onChange={setCustomStartDate}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 text-[11px]">End Date</label>
                    <CustomDatePicker
                      value={customEndDate}
                      onChange={setCustomEndDate}
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
        </div>
      )}

      {/* MODAL 2: Pay Now Confirmation */}
      {selectedTxnForPayNow && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Pay Outstanding Balance</h3>
              <button
                onClick={() => setSelectedTxnForPayNow(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
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

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                Choose Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-2 border-[#0e2a47] bg-[#f0f7ff] rounded-xl flex items-center gap-2 cursor-pointer font-bold text-[#0e2a47]">
                  <CreditCard className="w-4 h-4 text-[#0e2a47]" />
                  <span>Card / UPI</span>
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
                onClick={() => handlePayNowSubmit(selectedTxnForPayNow)}
                className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Pay {formatCurrency(selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount)} Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
