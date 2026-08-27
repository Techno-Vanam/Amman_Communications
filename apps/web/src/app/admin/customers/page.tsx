'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  FolderArchive,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { Customer, CustomerStats, CustomerStatus } from '@/lib/api/customers';
import {
  createAdminCustomer,
  deleteAdminCustomer,
  fetchAdminCustomers,
  fetchAdminCustomerStats,
  updateAdminCustomer,
  updateAdminCustomerStatus,
} from './actions';

export default function AdminCustomersPage() {
  // State
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Checkbox Selection
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formStatus, setFormStatus] = useState<CustomerStatus>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirm Modal
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [statsRes, listRes] = await Promise.all([
      fetchAdminCustomerStats(),
      fetchAdminCustomers(search, selectedStatus, page, limit),
    ]);

    if (statsRes.error) {
      setError(statsRes.error);
    } else if (statsRes.stats) {
      setStats(statsRes.stats);
    }

    if (listRes.error) {
      setError(listRes.error);
    } else if (listRes.data) {
      setCustomers(listRes.data.items);
      setTotalRecords(listRes.data.total);
      setTotalPages(listRes.data.totalPages);
    }

    setLoading(false);
  }, [search, selectedStatus, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when search or status tab changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedStatus]);

  // Handle Form Open (Create)
  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormStatus('ACTIVE');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Handle Form Open (Edit)
  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPassword('');
    setFormStatus(cust.status);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Handle Create / Edit Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!formEmail.trim()) {
      setFormError('Customer email is required.');
      return;
    }

    setIsSubmitting(true);

    if (editingCustomer) {
      // Edit
      const res = await updateAdminCustomer(editingCustomer.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        status: formStatus,
      });

      if (res.error) {
        setFormError(res.error);
      } else {
        setIsFormModalOpen(false);
        loadData();
      }
    } else {
      // Create
      if (!formPassword || formPassword.length < 6) {
        setFormError('Password must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }

      const res = await createAdminCustomer({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        status: formStatus,
      });

      if (res.error) {
        setFormError(res.error);
      } else {
        setIsFormModalOpen(false);
        loadData();
      }
    }

    setIsSubmitting(false);
  };

  // Handle Status Toggle (Activate/Deactivate) with Optimistic UI
  const handleToggleStatus = async (e: React.MouseEvent, cust: Customer) => {
    e.stopPropagation();
    const nextStatus: CustomerStatus = cust.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Optimistic Update
    setCustomers((prev) =>
      prev.map((c) => (c.id === cust.id ? { ...c, status: nextStatus } : c))
    );

    const res = await updateAdminCustomerStatus(cust.id, nextStatus);
    if (res.error) {
      setError(res.error);
      // Revert on failure
      setCustomers((prev) =>
        prev.map((c) => (c.id === cust.id ? { ...c, status: cust.status } : c))
      );
    } else {
      // Refresh stats
      const statsRes = await fetchAdminCustomerStats();
      if (statsRes.stats) setStats(statsRes.stats);
    }
  };

  // Single or Bulk Delete
  const handleDeleteCustomers = async () => {
    const idsToDelete = deletingCustomer ? [deletingCustomer.id] : selectedCustomerIds;
    if (idsToDelete.length === 0) return;

    setIsDeleting(true);
    setDeleteError(null);

    let hasError = false;
    for (const id of idsToDelete) {
      const res = await deleteAdminCustomer(id);
      if (res.error) {
        setDeleteError(res.error);
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setDeletingCustomer(null);
      setIsBulkDeleteModalOpen(false);
      setSelectedCustomerIds([]);
      loadData();
    }
    setIsDeleting(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Admin Portal
            </p>
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500">Customer Management</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            View registered customer profiles, manage account statuses, and review activity records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedCustomerIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <FolderArchive className="h-4 w-4" />
              <span>Delete Selected ({selectedCustomerIds.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>



      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Ensure backend API is active on port 3003 and you are logged in as Admin.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadData()}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
            <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'TOTAL CUSTOMERS',
            value: stats ? stats.total : '--',
            sub: 'Registered user accounts',
            statusKey: 'ALL',
            icon: Users,
            badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          },
          {
            label: 'ACTIVE ACCOUNTS',
            value: stats ? stats.active : '--',
            sub: 'Authorized to apply & log in',
            statusKey: 'ACTIVE',
            icon: UserCheck,
            badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          },
          {
            label: 'INACTIVE ACCOUNTS',
            value: stats ? stats.inactive : '--',
            sub: 'Deactivated / Suspended',
            statusKey: 'INACTIVE',
            icon: UserX,
            badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          },
          {
            label: 'WITH APPLICATIONS',
            value: stats ? stats.withApplications : '--',
            sub: 'Active service applicants',
            statusKey: 'ALL',
            icon: FileText,
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          },
        ].map((card) => {
          const isSelected = selectedStatus === card.statusKey && card.statusKey !== 'ALL';
          const IconComp = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => setSelectedStatus(card.statusKey)}
              className={`flex flex-col text-left rounded-xl border p-5 transition shadow-sm ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-700/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  {card.label}
                </span>
                <span className={`p-1.5 rounded-lg border ${card.badgeBg}`}>
                  <IconComp className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 pb-2 md:border-none md:pb-0">
          {[
            { id: 'ALL', label: 'All Customers' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'INACTIVE', label: 'Inactive' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                selectedStatus === tab.id
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-700" />
            <p className="mt-3 text-sm font-medium">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 text-gray-400">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              {search || selectedStatus !== 'ALL'
                ? 'No customer accounts match your active search filter criteria.'
                : 'No customer accounts have registered yet.'}
            </p>
            {search || selectedStatus !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('ALL');
                }}
                className="mt-4 text-sm font-semibold text-emerald-800 hover:text-emerald-900 underline"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <UserPlus className="h-4 w-4" /> New Customer
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={customers.length > 0 && selectedCustomerIds.length === customers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomerIds(customers.map((c) => c.id));
                          } else {
                            setSelectedCustomerIds([]);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3.5">Customer</th>
                    <th scope="col" className="px-6 py-3.5">Email Address</th>
                    <th scope="col" className="px-6 py-3.5">Account Status</th>
                    <th scope="col" className="px-6 py-3.5">Applications</th>
                    <th scope="col" className="px-6 py-3.5">Documents</th>
                    <th scope="col" className="px-6 py-3.5">Registered Date</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/80 transition">
                      {/* Checkbox */}
                      <td className="px-4 py-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomerIds.includes(cust.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomerIds((prev) => [...prev, cust.id]);
                            } else {
                              setSelectedCustomerIds((prev) => prev.filter((id) => id !== cust.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                        />
                      </td>

                      {/* Name (Clickable) */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setViewingCustomer(cust)}
                          className="text-left font-semibold text-gray-900 hover:text-emerald-800 hover:underline cursor-pointer"
                        >
                          {cust.name}
                        </button>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ID: {cust.id.slice(0, 10)}...
                        </p>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 font-medium text-gray-700">{cust.email}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {cust.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                            INACTIVE
                          </span>
                        )}
                      </td>

                      {/* Applications Count */}
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {cust._count?.applications || 0}
                      </td>

                      {/* Documents Count */}
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {cust._count?.documents || 0}
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(cust.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(e, cust)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                            cust.status === 'ACTIVE'
                              ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {cust.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition inline-flex items-center align-middle"
                          title="Edit Customer Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 px-6 py-3 text-xs text-gray-600">
              <p>
                Showing <strong className="text-gray-900">{customers.length}</strong> of{' '}
                <strong className="text-gray-900">{totalRecords}</strong> customer accounts
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <span className="font-semibold text-gray-900 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingCustomer ? 'Edit Customer Profile' : 'Create New Customer'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingCustomer
                    ? 'Update customer information and account status.'
                    : 'Register a new customer account directly from the admin portal.'}
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Smith"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.smith@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              {/* Password (Create Only) */}
              {!editingCustomer && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              )}

              {/* Account Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Account Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as CustomerStatus)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                >
                  <option value="ACTIVE">ACTIVE (Can log in & apply for services)</option>
                  <option value="INACTIVE">INACTIVE (Deactivated / Access blocked)</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : editingCustomer ? (
                    'Save Changes'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER DETAILS MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 bg-emerald-900 px-6 py-4 text-white">
              <div>
                <h3 className="text-lg font-bold">{viewingCustomer.name}</h3>
                <p className="text-xs text-emerald-200 font-mono">ID: {viewingCustomer.id}</p>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-500">Email Address</p>
                  <p className="mt-0.5 font-medium text-gray-900">{viewingCustomer.email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-500">Account Status</p>
                  <p className="mt-0.5 font-semibold text-emerald-900">{viewingCustomer.status}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-500">Registration Date</p>
                  <p className="mt-0.5 text-xs text-gray-800">
                    {new Date(viewingCustomer.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-500">Submitted Data</p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-900">
                    {viewingCustomer._count?.applications || 0} Apps / {viewingCustomer._count?.documents || 0} Docs
                  </p>
                </div>
              </div>

              {/* Note on Security */}
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                <p className="font-semibold">Security Isolation Active</p>
                <p className="mt-0.5 text-[11px]">
                  Customer password hash and authentication credentials are strictly isolated and not exposed to Admin view.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {(deletingCustomer || isBulkDeleteModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">
                {deletingCustomer ? 'Delete Customer Account' : `Delete ${selectedCustomerIds.length} Selected Accounts`}
              </h3>
            </div>

            <p className="text-sm text-gray-600">
              {deletingCustomer ? (
                <>
                  Are you sure you want to delete <strong className="text-gray-900">{deletingCustomer.name}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to delete <strong className="text-gray-900">{selectedCustomerIds.length}</strong> selected customer account(s)?
                </>
              )}
            </p>

            {deleteError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeletingCustomer(null);
                  setIsBulkDeleteModalOpen(false);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomers}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FolderArchive className="h-4 w-4" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
