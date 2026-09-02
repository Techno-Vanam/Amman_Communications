'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Receipt,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  TrendingDown,
  Tag,
  Calendar,
  FileText,
  IndianRupee,
  ArrowUpRight,
  ShoppingCart,
  Wrench,
  Wifi,
  Users,
  Building2,
} from 'lucide-react';
import {
  fetchExpensesAction,
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from './actions';

// ── Types ─────────────────────────────────────────────────────
type Category = string;

interface Expense {
  id: string;
  category: string;
  amount: number;
  title: string;
  description: string;
  date: string;
  addedBy: string;
  paymentMethod: string;
  notes: string;
}

// ── Live Dataset ─────────────────────────────────────────────────
const INITIAL_EXPENSES: Expense[] = [];

const CATEGORIES: Category[] = [
  'Infrastructure', 'Operations', 'Salaries', 'Marketing',
  'Utilities', 'Equipment', 'Maintenance', 'Miscellaneous',
];

const CATEGORY_CFG: Record<string, { color: string; icon: React.ReactNode }> = {
  Infrastructure: { color: 'bg-blue-100 text-blue-800 border-blue-200',    icon: <Building2 className="w-3 h-3" /> },
  Operations:     { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Wrench className="w-3 h-3" /> },
  Salaries:       { color: 'bg-green-100 text-green-800 border-green-200',  icon: <Users className="w-3 h-3" /> },
  Marketing:      { color: 'bg-pink-100 text-pink-800 border-pink-200',     icon: <ArrowUpRight className="w-3 h-3" /> },
  Utilities:      { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Wifi className="w-3 h-3" /> },
  Equipment:      { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <ShoppingCart className="w-3 h-3" /> },
  Maintenance:    { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Wrench className="w-3 h-3" /> },
  Miscellaneous:  { color: 'bg-gray-100 text-gray-700 border-gray-200',     icon: <Tag className="w-3 h-3" /> },
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-xs font-bold text-gray-800">
      {category}
    </span>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────
function ExpenseModal({
  mode,
  expense,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  expense?: Expense;
  onClose: () => void;
  onSave: (data: Partial<Expense>) => void;
}) {
  const [form, setForm] = useState({
    title: expense?.title ?? '',
    category: expense?.category ?? 'Operations',
    amount: expense?.amount?.toString() ?? '',
    description: expense?.description ?? '',
    date: expense?.date ?? new Date().toISOString().split('T')[0],
    paymentMethod: expense?.paymentMethod ?? 'CASH',
    notes: expense?.notes ?? '',
  });
  const [categoryInput, setCategoryInput] = useState(expense?.category ?? 'Operations');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('expense_custom_categories') || '[]'); } catch { return []; }
  });
  const allCategories = [...new Set([...CATEGORIES, ...customCategories])];
  const filteredCategories = categoryInput.trim() === '' || categoryInput === form.category
    ? allCategories
    : allCategories.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectCategory(val: string) {
    setForm(p => ({ ...p, category: val }));
    setCategoryInput(val);
    setShowCatDropdown(false);
  }

  function handleCategoryFocus() {
    setCategoryInput('');
    setShowCatDropdown(true);
  }

  function handleCategoryBlur() {
    const trimmed = categoryInput.trim();
    if (!trimmed) {
      setCategoryInput(form.category);
      setShowCatDropdown(false);
      return;
    }
    setForm(p => ({ ...p, category: trimmed }));
    setCategoryInput(trimmed);
    if (!allCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try { localStorage.setItem('expense_custom_categories', JSON.stringify(updated)); } catch {}
    }
    setShowCatDropdown(false);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, amount: Number(form.amount) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              {mode === 'add' ? <Plus className="w-5 h-5 text-[#a8d5b9]" /> : <Edit2 className="w-5 h-5 text-[#a8d5b9]" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{mode === 'add' ? 'Add Expense' : 'Edit Expense'}</h2>
              <p className="text-[11px] text-gray-400">{mode === 'add' ? 'Log a new expense entry' : `Editing ${expense?.id}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. Office Supplies"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
              />
              {errors.title && <p className="text-[10px] text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div ref={catRef} className="relative z-50">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={e => { setCategoryInput(e.target.value); setShowCatDropdown(true); }}
                  onFocus={handleCategoryFocus}
                  onBlur={handleCategoryBlur}
                  placeholder="Select or type..."
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {showCatDropdown && filteredCategories.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onMouseDown={() => selectCategory(cat)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 text-gray-900 ${
                        cat === form.category ? 'bg-gray-100 font-bold' : ''
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {categoryInput.trim() && !allCategories.includes(categoryInput.trim()) && (
                    <button
                      type="button"
                      onMouseDown={() => selectCategory(categoryInput.trim())}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      + Add &ldquo;{categoryInput.trim()}&rdquo;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                />
              </div>
              {errors.amount && <p className="text-[10px] text-rose-600 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                />
              </div>
              {errors.date && <p className="text-[10px] text-rose-600 mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Description & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Method</label>
              <div className="relative">
                <select
                  value={form.paymentMethod}
                  onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-2.5 appearance-none rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Brief description..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes (Optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Additional notes..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors shadow-md">
              {mode === 'add' ? 'Add Expense' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────
function DeleteModal({ expense, onClose, onConfirm }: { expense: Expense; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-rose-600" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-extrabold text-gray-900">Delete Expense?</h2>
          <p className="text-xs text-gray-500 mt-1.5">
            Are you sure you want to delete <span className="font-bold text-gray-700">{expense.id}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
type FilterCat = 'All' | Category;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCat>('All');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadExpenses = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchExpensesAction();
    if (res.error) {
      setErrorMsg(res.error);
      setExpenses([]);
    } else if (res.success && res.data) {
      setExpenses(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const filtered = useMemo(() => expenses.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
    const matchCat = filterCategory === 'All' || e.category === filterCategory;
    const matchMonth = !filterMonth || e.date.startsWith(filterMonth);
    return matchSearch && matchCat && matchMonth;
  }), [expenses, search, filterCategory, filterMonth]);

  // Stats
  const totalFilteredAmt = filtered.reduce((s, e) => s + e.amount, 0);
  const uniqueCats = Array.from(new Set(filtered.map(e => e.category)));
  const highestCat = uniqueCats.reduce((best, cat) => {
    const sum = filtered.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return sum > best.sum ? { cat, sum } : best;
  }, { cat: '', sum: 0 });
  const isFiltered = filterCategory !== 'All' || filterMonth !== '' || search !== '';

  async function handleAdd(data: any) {
    const res = await createExpenseAction({
      title: data.title,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: data.date,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    });
    if (res.success) {
      loadExpenses();
    } else {
      setErrorMsg(res.error || 'Failed to add expense');
    }
  }

  async function handleEdit(data: Partial<Expense>) {
    if (!editExpense) return;
    setErrorMsg(null);
    const res = await updateExpenseAction(editExpense.id, {
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: data.date,
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      loadExpenses();
    }
  }

  async function handleDelete(id: string) {
    setErrorMsg(null);
    const res = await deleteExpenseAction(id);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      loadExpenses();
    }
  }

  const fmtAmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // Month options from data
  const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))].filter(Boolean).sort().reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans" suppressHydrationWarning>



      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {isFiltered ? 'Filtered' : 'All Time'}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-700">{fmtAmt(totalFilteredAmt)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Expenses</p>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Count
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-700">{filtered.length}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Transactions</p>
        </div>

        {/* Highest Category */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
              <Tag className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">Top Category</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-violet-700">{fmtAmt(highestCat.sum)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{highestCat.cat || '—'}</p>
        </div>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm mr-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by description, category, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] shadow-xs transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Month Filter */}
        <div className="relative w-full sm:w-auto">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full sm:w-auto pl-10 pr-8 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 shadow-xs transition-all appearance-none"
          >
            <option value="">All Months</option>
            {months.map(m => {
              const [y, mo] = m.split('-');
              const label = new Date(Number(y), Number(mo) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowCatMenu(s => !s)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-all"
          >
            <Filter className="w-4 h-4 text-gray-500" />
            {filterCategory === 'All' ? 'All Categories' : filterCategory}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showCatMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCatMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5">
              {(['All', ...CATEGORIES] as FilterCat[]).map(c => (
                <button key={c} onClick={() => { setFilterCategory(c); setShowCatMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${filterCategory === c ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          Add Expense
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 320px)', minHeight: '300px' }}>
        <div className="overflow-x-auto w-full flex flex-col flex-1 min-h-0">
          <div className="min-w-[620px] flex flex-col flex-1 min-h-0">
            {/* Header — sticky */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_100px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest shrink-0 sticky top-0 z-10">
              <div className="min-w-0">Title / Desc</div>
              <div className="min-w-0">Category</div>
              <div className="min-w-0">Amount</div>
              <div className="min-w-0 pl-4">Date</div>
              <div className="min-w-0">Payment Method</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Rows — scrollable */}
            <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}>
              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400">No expenses found</p>
                  <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : filtered.map((e, idx) => (
                <div key={e.id} className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr_100px] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  {/* Title + Description */}
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-bold text-gray-900 truncate">{e.title || e.description}</p>
                    {e.description && e.title && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{e.description}</p>
                    )}
                  </div>
                  {/* Category */}
                  <div className="min-w-0">
                    <CategoryBadge category={e.category} />
                  </div>
                  {/* Amount */}
                  <div className="min-w-0">
                    <span className="text-sm font-extrabold text-rose-700">{fmtAmt(e.amount)}</span>
                  </div>
                  {/* Date */}
                  <div className="min-w-0 pl-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">{fmtDate(e.date)}</span>
                    </div>
                  </div>
                  {/* Payment Method */}
                  <div className="min-w-0">
                    {e.paymentMethod && e.paymentMethod !== 'OTHER' ? (
                      <span className="text-[11px] font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        {e.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400">—</span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => setEditExpense(e)}
                      className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleteExpense(e)}
                      className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-all" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* ── Modals ── */}
      {showAddModal && <ExpenseModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editExpense && <ExpenseModal mode="edit" expense={editExpense} onClose={() => setEditExpense(null)} onSave={handleEdit} />}
      {deleteExpense && <DeleteModal expense={deleteExpense} onClose={() => setDeleteExpense(null)} onConfirm={() => handleDelete(deleteExpense.id)} />}
    </div>
  );
}
