'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  DollarSign,
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
type Category =
  | 'Infrastructure'
  | 'Operations'
  | 'Salaries'
  | 'Marketing'
  | 'Utilities'
  | 'Equipment'
  | 'Maintenance'
  | 'Miscellaneous';

interface Expense {
  id: string;
  category: Category;
  amount: number;
  description: string;
  date: string;
  addedBy: string;
}

// ── Live Dataset ─────────────────────────────────────────────────
const INITIAL_EXPENSES: Expense[] = [];

const CATEGORIES: Category[] = [
  'Infrastructure', 'Operations', 'Salaries', 'Marketing',
  'Utilities', 'Equipment', 'Maintenance', 'Miscellaneous',
];

const CATEGORY_CFG: Record<Category, { color: string; icon: React.ReactNode }> = {
  Infrastructure: { color: 'bg-blue-100 text-blue-800 border-blue-200',    icon: <Building2 className="w-3 h-3" /> },
  Operations:     { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Wrench className="w-3 h-3" /> },
  Salaries:       { color: 'bg-green-100 text-green-800 border-green-200',  icon: <Users className="w-3 h-3" /> },
  Marketing:      { color: 'bg-pink-100 text-pink-800 border-pink-200',     icon: <ArrowUpRight className="w-3 h-3" /> },
  Utilities:      { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Wifi className="w-3 h-3" /> },
  Equipment:      { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <ShoppingCart className="w-3 h-3" /> },
  Maintenance:    { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Wrench className="w-3 h-3" /> },
  Miscellaneous:  { color: 'bg-gray-100 text-gray-700 border-gray-200',     icon: <Tag className="w-3 h-3" /> },
};

function CategoryBadge({ category }: { category: Category }) {
  const { color, icon } = CATEGORY_CFG[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>
      {icon}{category}
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
    category: expense?.category ?? 'Operations' as Category,
    amount: expense?.amount?.toString() ?? '',
    description: expense?.description ?? '',
    date: expense?.date ?? new Date().toISOString().split('T')[0],
  });
<<<<<<< HEAD
  const [errors, setErrors] = useState<Record<string, string>>({});
=======
  
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; action: () => void } | null>(null);
  
  const router = useRouter();
>>>>>>> origin/backend-merge

  function validate() {
    const e: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Valid amount required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

<<<<<<< HEAD
  function handleSubmit(e: React.FormEvent) {
=======
      const res = await fetch(`/api/admin/expenses?${params.toString()}`);
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`Unable to load expenses.`);
      const data = await res.json();
      setExpenses(data.data || []);
      setError('');
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
    }
  }, [searchTerm, filterCategory, router]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      const res = await fetch(`/api/admin/expenses/stats?${params.toString()}`);
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e: unknown) {
      if (e instanceof Error) console.error(e.message);
    }
  }, [filterCategory, router]);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await Promise.all([fetchExpenses(), fetchStats()]);
    if (showLoader) setLoading(false);
  }, [fetchExpenses, fetchStats]);

  useEffect(() => { loadData(); }, [loadData]);

  const openConfirmation = (title: string, message: string, action: () => void) => {
    setConfirmModal({ isOpen: true, title, message, action });
  };



  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: 'DELETE',
      });
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await loadData(false);
      setConfirmModal(null);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      setConfirmModal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
>>>>>>> origin/backend-merge
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
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Amount (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe the expense..."
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all resize-none"
              />
            </div>
            {errors.description && <p className="text-[10px] text-rose-600 mt-1">{errors.description}</p>}
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
  const totalAll    = expenses.reduce((s, e) => s + e.amount, 0);
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const thisMonth   = expenses.filter(e => e.date.startsWith('2026-08')).reduce((s, e) => s + e.amount, 0);
  const highestCat  = CATEGORIES.reduce((best, cat) => {
    const sum = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return sum > best.sum ? { cat, sum } : best;
  }, { cat: '' as Category, sum: 0 });

  async function handleAdd(data: Partial<Expense>) {
    setErrorMsg(null);
    const res = await createExpenseAction({
      category: data.category ?? 'Miscellaneous',
      amount: data.amount ?? 0,
      description: data.description ?? '',
      date: data.date ?? new Date().toISOString().split('T')[0],
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      loadExpenses();
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>



      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">All Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-rose-700">{fmtAmt(totalAll)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Expenses</p>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Aug 2026</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-700">{fmtAmt(thisMonth)}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">This Month&apos;s Expenses</p>
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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[620px]">
            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2 text-right pr-6">Amount</div>
              <div className="col-span-3 pl-4">Date</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No expenses found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : filtered.map((e, idx) => (
              <div key={e.id} className={`grid grid-cols-12 px-5 py-3.5 items-center hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                {/* Description */}
                <div className="col-span-3 min-w-0 pr-3">
                  <p className="text-xs font-bold text-gray-900 truncate">{e.description}</p>
                </div>
                {/* Category */}
                <div className="col-span-2">
                  <CategoryBadge category={e.category} />
                </div>
                {/* Amount */}
                <div className="col-span-2 text-right pr-6">
                  <span className="text-sm font-extrabold text-rose-700">{fmtAmt(e.amount)}</span>
                </div>
                {/* Date */}
                <div className="col-span-3 pl-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-[11px] text-gray-600 font-medium whitespace-nowrap">{fmtDate(e.date)}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-1.5">
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

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {expenses.length} expenses</p>
          <p className="text-xs font-extrabold text-rose-700">
            Filtered Total: {fmtAmt(totalFiltered)}
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && <ExpenseModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
      {editExpense && <ExpenseModal mode="edit" expense={editExpense} onClose={() => setEditExpense(null)} onSave={handleEdit} />}
      {deleteExpense && <DeleteModal expense={deleteExpense} onClose={() => setDeleteExpense(null)} onConfirm={() => handleDelete(deleteExpense.id)} />}
    </div>
  );
}
