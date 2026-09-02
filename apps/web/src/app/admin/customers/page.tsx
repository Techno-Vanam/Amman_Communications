'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  Mail,
  Phone,
  FileText,
  Wallet,
  CheckCircle,
  Clock,
  UserCircle2,
} from 'lucide-react';
import {
  fetchCustomersAction,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from './actions';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  applications: number;
  pending: number;
  balance: string;
  status: string;
  joinedDate: string;
}

// ── Live Dataset ────────────────────────────────────────────────
const INITIAL_CUSTOMERS: Customer[] = [];
type FilterStatus = 'All' | 'Active' | 'Inactive' | 'Pending';

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  const icons: Record<string, React.ReactNode> = {
    Active: <CheckCircle className="w-3 h-3" />,
    Inactive: <X className="w-3 h-3" />,
    Pending: <Clock className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

// ── Add / Edit Customer Modal ─────────────────────────────────
function CustomerModal({
  mode,
  customer,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  customer?: Customer;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
}) {
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    password: '',
    status: customer?.status ?? 'Active',
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (mode === 'add' && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#12372A] flex items-center justify-center">
              <UserCircle2 className="w-5 h-5 text-[#a8d5b9]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                {mode === 'add' ? 'Add New Customer' : 'Edit Customer'}
              </h2>
              <p className="text-[11px] text-gray-400">Fill in all fields below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ahmad Hassan"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
            />
            {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
              />
            </div>
            {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
              />
            </div>
            {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Password (only on add) */}
          {mode === 'add' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
            <div className="relative">
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] transition-all appearance-none"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-colors shadow-md"
            >
              {mode === 'add' ? 'Add Customer' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteConfirmModal({ customer, onClose, onConfirm }: { customer: Customer; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6 text-rose-600" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-extrabold text-gray-900">Delete Customer?</h2>
          <p className="text-xs text-gray-500 mt-1.5">
            Are you sure you want to delete <span className="font-bold text-gray-700">{customer.name}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCustomers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchCustomersAction(search, filterStatus);
    if (res.error) {
      setErrorMsg(res.error);
      setCustomers([]);
    } else if (res.success && res.data) {
      // Map backend schema to UI format
      const mapped = res.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '—',
        applications: c._count?.applications ?? 0,
        pending: c._count?.documents ?? 0,
        balance: '₹0',
        status: c.status === 'ACTIVE' ? 'Active' : c.status === 'INACTIVE' ? 'Inactive' : 'Pending',
        joinedDate: new Date(c.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }));
      setCustomers(mapped);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, [search, filterStatus]);

  async function handleAdd(data: Partial<Customer>) {
    setErrorMsg(null);
    const res = await createCustomerAction({
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      status: data.status ?? 'Active',
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      loadCustomers();
    }
  }

  async function handleEdit(data: Partial<Customer>) {
    if (!editCustomer) return;
    setErrorMsg(null);
    const res = await updateCustomerAction(editCustomer.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      loadCustomers();
    }
  }

  async function handleDelete(id: string) {
    setErrorMsg(null);
    const res = await deleteCustomerAction(id);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      loadCustomers();
    }
  }

  const statusCounts = {
    All: customers.length,
    Active: customers.filter(c => c.status === 'Active').length,
    Inactive: customers.filter(c => c.status === 'Inactive').length,
    Pending: customers.filter(c => c.status === 'Pending').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>



      {/* ── Stats Summary Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['All', 'Active', 'Inactive', 'Pending'] as FilterStatus[]).map(s => (
          <div
            key={s}
            className="rounded-2xl border px-4 py-3 text-left bg-white border-gray-200"
          >
            <p className="text-2xl font-extrabold text-[#0e2a47]">
              {statusCounts[s]}
            </p>
            <p className="text-[11px] font-semibold mt-0.5 text-gray-500">
              {s === 'All' ? 'Total Customers' : `${s} Customers`}
            </p>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm mr-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            suppressHydrationWarning
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] shadow-xs transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} suppressHydrationWarning className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowFilterMenu(s => !s)}
            suppressHydrationWarning
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
          >
            <Filter className="w-4 h-4 text-gray-500" />
            Filter: {filterStatus}
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 py-1.5 overflow-hidden">
              {(['All', 'Active', 'Inactive', 'Pending'] as FilterStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setShowFilterMenu(false); }}
                  suppressHydrationWarning
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {s} ({statusCounts[s]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Customer Button */}
        <button
          onClick={() => setShowAddModal(true)}
          suppressHydrationWarning
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#12372A] hover:bg-[#1a4a38] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          New Customer
        </button>
      </div>

      {/* ── Customers Table ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[680px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2 text-center">Applications</div>
              <div className="col-span-2 text-center">Pending Bal.</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Rows */}
            {customers.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">No customers found</p>
                <p className="text-xs text-gray-300 mt-1">Try changing your search or filter</p>
              </div>
            ) : (
              customers.map((c, idx) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-12 px-5 py-3.5 items-center transition-colors hover:bg-gray-50/80 ${idx !== customers.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Name + Email */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12372A] to-[#2e8a60] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 font-medium truncate">{c.phone}</p>
                  </div>

                  {/* Applications */}
                  <div className="col-span-2 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#12372A]" />
                      <span className="text-xs font-bold text-gray-800">{c.applications}</span>
                    </div>
                  </div>

                  {/* Pending Balance */}
                  <div className="col-span-2 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-amber-600" />
                      <span className={`text-xs font-bold ${c.balance === '₹0' ? 'text-gray-400' : 'text-amber-700'}`}>{c.balance}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setEditCustomer(c)}
                      suppressHydrationWarning
                      className="w-7 h-7 rounded-full bg-[#f0f7f2] hover:bg-[#12372A] text-[#12372A] hover:text-white flex items-center justify-center transition-all group"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCustomer(c)}
                      suppressHydrationWarning
                      className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400 font-medium">
            Showing {customers.length} of {customers.length} customers
          </p>
          <p className="text-[11px] text-gray-400">Last updated · Just now</p>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <CustomerModal mode="add" onClose={() => setShowAddModal(false)} onSave={handleAdd} />
      )}
      {editCustomer && (
        <CustomerModal mode="edit" customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleEdit} />
      )}
      {deleteCustomer && (
        <DeleteConfirmModal customer={deleteCustomer} onClose={() => setDeleteCustomer(null)} onConfirm={() => handleDelete(deleteCustomer.id)} />
      )}
    </div>
  );
}
