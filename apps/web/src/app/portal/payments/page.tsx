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
import { useNotifications } from '@/context/NotificationContext';
import { useUser, getUserStorageKey } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import CustomSelect from '@/components/ui/CustomSelect';

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

const DEFAULT_SAMPLE_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'TXN-2026-8801',
    appId: 'AMC-2026-402616',
    service: 'Passport Services & Renewal',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-28'
  },
  {
    id: 'TXN-2026-8802',
    appId: 'AMC-2026-509611',
    service: 'Biometric & Identity Verification',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-27'
  },
  {
    id: 'TXN-2026-8803',
    appId: 'AMC-2026-546936',
    service: 'Patta Transfer & Revenue Services',
    totalAmount: 2000,
    paidAmount: 2000,
    pendingAmount: 0,
    paymentMode: 'UPI / NetBanking',
    status: 'Paid',
    date: '2026-08-26'
  },
  {
    id: 'TXN-2026-8804',
    appId: 'AMC-2026-612490',
    service: 'Encumbrance Certificate (EC)',
    totalAmount: 1500,
    paidAmount: 1500,
    pendingAmount: 0,
    paymentMode: 'Credit Card',
    status: 'Paid',
    date: '2026-08-25'
  },
  {
    id: 'TXN-2026-8805',
    appId: 'AMC-2026-781204',
    service: 'Property Registration & Sales Deed',
    totalAmount: 3500,
    paidAmount: 3500,
    pendingAmount: 0,
    paymentMode: 'Bank Transfer',
    status: 'Paid',
    date: '2026-08-24'
  }
];

export default function PaymentsPage() {
  const { showToast } = useNotifications();
  const { user } = useUser();
  const [transactions, setTransactions] = useState<TransactionItem[]>(DEFAULT_SAMPLE_TRANSACTIONS);
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
      if (saved) {
        const parsed = JSON.parse(saved);
        setTransactions(parsed.length > 0 ? parsed : DEFAULT_SAMPLE_TRANSACTIONS);
      } else {
        setTransactions(DEFAULT_SAMPLE_TRANSACTIONS);
      }
    } catch (e) {
      console.error('Error loading payments:', e);
      setTransactions(DEFAULT_SAMPLE_TRANSACTIONS);
    }
  }, [user.email]);

  // More Filters State
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const [selectedTxnForPayNow, setSelectedTxnForPayNow] = useState<TransactionItem | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
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
    setDatePreset('All Time');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Filtered transactions logic
  const filteredTransactions = transactions.filter((t) => {
    if (
      selectedCategoryFilter !== 'All Services/Applications' &&
      !t.service.toLowerCase().includes(selectedCategoryFilter.toLowerCase())
    ) {
      return false;
    }

    if (filterStatus !== 'All' && t.status !== filterStatus) {
      return false;
    }

    if (filterMode !== 'All' && t.paymentMode !== filterMode) {
      return false;
    }

    if (minAmount && t.totalAmount < parseFloat(minAmount)) {
      return false;
    }

    if (maxAmount && t.totalAmount > parseFloat(maxAmount)) {
      return false;
    }

    if (datePreset === 'Oct 1, 2023 - Oct 31, 2023') {
      if (t.date < '2023-10-01' || t.date > '2023-10-31') return false;
    } else if (datePreset === 'Custom Date Range') {
      if (customStartDate && t.date < customStartDate) return false;
      if (customEndDate && t.date > customEndDate) return false;
    }

    return true;
  });

  const totalPaidSum = filteredTransactions.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const pendingPaymentsSum = filteredTransactions.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const overdueInvoicesCount = filteredTransactions.filter((t) => t.pendingAmount > 0).length;
  const totalTransactionsCount = filteredTransactions.length;

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans">
      {/* 3 Metric Cards - Compact sizing for non-scrollable page fit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Total Paid */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between h-28 sm:h-32">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-600 truncate">Total Paid</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#0e2a47] tracking-tight mt-1">
            {formatCurrency(totalPaidSum)}
          </p>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
              Last 30 days
            </span>
          </div>
        </div>

        {/* Card 2: Pending Payments */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between h-28 sm:h-32">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-600 truncate">Pending Payments</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#0e2a47] tracking-tight mt-1">
            {formatCurrency(pendingPaymentsSum)}
          </p>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200/60">
              {overdueInvoicesCount} Invoices Overdue
            </span>
          </div>
        </div>

        {/* Card 3: Total Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between h-28 sm:h-32">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-600 truncate">Total Transactions</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#0e2a47] tracking-tight mt-1">
            {totalTransactionsCount}
          </p>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200/60">
              All time
            </span>
          </div>
        </div>
      </div>

      {/* Main Transactions Container Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden space-y-3">
        {/* Filter Toolbar */}
        <div className="p-4 pb-1 flex flex-col lg:flex-row items-center justify-between gap-3">
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
                  'Biometric & Identity Verification',
                  'Patta Transfer & Revenue Services',
                  'Encumbrance Certificate (EC)',
                  'Property Registration & Sales Deed',
                  'Legal & Civil Services'
                ]}
              />
            </div>

            {/* Date Range Button */}
            <button
              onClick={() => setShowDatePickerModal(true)}
              className="flex items-center gap-2 bg-gray-50/80 border border-gray-200 hover:bg-gray-100 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors w-full sm:w-auto justify-center"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{datePreset}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end sm:justify-start">
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Collapsible "More Filters" Options Panel */}
        {showMoreFilters && (
          <div className="mx-4 p-3 bg-[#f8fafc] border border-gray-200 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Filter Options</h3>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-gray-500 hover:text-[#0e2a47] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-600 text-[11px]">Max Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-gray-800 font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Data Table Container - Strictly configured so EXACTLY 4 complete rows are visible at once */}
        <div className="overflow-x-auto h-[275px] max-h-[275px] overflow-y-auto border-t border-b border-gray-100 relative">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="sticky top-0 z-10 bg-[#f8fafc] shadow-xs">
              <tr className="border-b border-gray-200/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="py-2.5 px-6">SERVICE/APPLICATION</th>
                <th className="py-2.5 px-4">TOTAL AMOUNT</th>
                <th className="py-2.5 px-4">PAID AMOUNT</th>
                <th className="py-2.5 px-4">PENDING AMOUNT</th>
                <th className="py-2.5 px-4">PAYMENT MODE</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-medium">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn, index) => {
                  return (
                    <tr key={`${txn.id}-${txn.appId}-${index}`} className="hover:bg-gray-50/70 transition-colors">
                      {/* Service & Application ID */}
                      <td className="py-3 sm:py-3.5 px-6">
                        <p className="font-bold text-gray-900 leading-tight">{txn.service}</p>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">{txn.appId}</p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 sm:py-3.5 px-4 font-bold text-gray-900">
                        {formatCurrency(txn.totalAmount)}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3 sm:py-3.5 px-4 font-bold text-gray-900">
                        {formatCurrency(txn.paidAmount)}
                      </td>

                      {/* Pending Amount */}
                      <td className="py-3 sm:py-3.5 px-4 font-bold">
                        {txn.pendingAmount > 0 ? (
                          <span className="text-rose-600">{formatCurrency(txn.pendingAmount)}</span>
                        ) : (
                          <span className="text-gray-500">{formatCurrency(0)}</span>
                        )}
                      </td>

                      {/* Payment Mode Badge */}
                      <td className="py-3 sm:py-3.5 px-4">
                        {txn.paymentMode === 'Credit Card' && (
                          <span className="inline-block text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                            Credit Card
                          </span>
                        )}
                        {txn.paymentMode === 'Bank Transfer' && (
                          <span className="inline-block text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-100">
                            Bank Transfer
                          </span>
                        )}
                        {txn.paymentMode === 'Wire Transfer' && (
                          <span className="inline-block text-[11px] font-semibold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-lg border border-purple-100">
                            Wire Transfer
                          </span>
                        )}
                        {txn.paymentMode === 'Pending' && (
                          <span className="inline-block text-[11px] font-medium text-gray-400 italic bg-gray-50 px-2.5 py-0.5 rounded-lg">
                            Pending
                          </span>
                        )}
                        {txn.paymentMode === 'UPI / NetBanking' && (
                          <span className="inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                            UPI / NetBanking
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 sm:py-3.5 px-4">
                        {txn.status === 'Paid' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        )}
                        {txn.status === 'Partial' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Partial
                          </span>
                        )}
                        {txn.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3 sm:py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/portal/payments/${txn.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
                            title="View Official Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-white" />
                            <span>Invoice</span>
                          </Link>

                          {txn.status !== 'Paid' && (
                            <button
                              onClick={() => setSelectedTxnForPayNow(txn)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-2xs"
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

        {/* Table Footer - Anchored to bottom of card */}
        <div className="mt-auto shrink-0 p-3.5 px-6 flex items-center justify-between text-xs text-gray-500 font-medium bg-gray-50/50 border-t border-gray-100">
          <div>
            Showing 1 to {Math.min(4, filteredTransactions.length)} of {filteredTransactions.length} entries (Scroll table to view all)
          </div>
        </div>
      </div>

      {/* Pay Now Modal */}
      {selectedTxnForPayNow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Complete Payment</h3>
                  <p className="text-[11px] text-gray-400">Ref: {selectedTxnForPayNow.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxnForPayNow(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span className="font-bold text-gray-900">{selectedTxnForPayNow.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Application Ref:</span>
                <span className="font-mono text-gray-800">{selectedTxnForPayNow.appId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-700 font-bold">Amount Due:</span>
                <span className="font-extrabold text-rose-600 text-sm">
                  {formatCurrency(selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handlePayNowSubmit(selectedTxnForPayNow)}
                className="w-full py-2.5 bg-[#12372A] hover:bg-[#1a4a38] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-[#a8d5b9]" />
                <span>Confirm &amp; Pay {formatCurrency(selectedTxnForPayNow.pendingAmount || selectedTxnForPayNow.totalAmount)}</span>
              </button>
              <button
                onClick={() => setSelectedTxnForPayNow(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Select Date Range</h3>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div
                onClick={() => {
                  setDatePreset('All Time');
                  setShowDatePickerModal(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer font-bold ${
                  datePreset === 'All Time' ? 'border-[#12372A] bg-[#f0f7f2] text-[#12372A]' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                All Time
              </div>
              <div
                onClick={() => {
                  setDatePreset('Oct 1, 2023 - Oct 31, 2023');
                  setShowDatePickerModal(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer font-bold ${
                  datePreset === 'Oct 1, 2023 - Oct 31, 2023' ? 'border-[#12372A] bg-[#f0f7f2] text-[#12372A]' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                October 2023
              </div>
            </div>

            <button
              onClick={() => setShowDatePickerModal(false)}
              className="w-full py-2 bg-[#12372A] text-white text-xs font-bold rounded-xl hover:bg-[#1a4a38] transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
