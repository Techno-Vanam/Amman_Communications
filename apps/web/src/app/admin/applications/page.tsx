'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { fetchAdminApplications, updateAdminApplicationStatus } from './actions';
import Link from 'next/link';

interface Application {
  id: string;
  applicationNumber: string;
  serviceType: string;
  title: string;
  fullName: string;
  status: string;
  createdAt: string;
  _count?: { documents: number };
  customer?: { name: string; email: string };
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetchAdminApplications(search, selectedStatus, page, limit);

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setApplications(res.data.items);
      setTotalRecords(res.data.total);
      setTotalPages(res.data.totalPages);
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setDropdownOpen(null);
    setIsUpdating(true);
    const res = await updateAdminApplicationStatus(id, newStatus);
    if (res.error) {
      alert(res.error);
    } else {
      await loadData();
    }
    setIsUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'IN_REVIEW':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Search className="w-3.5 h-3.5" /> In Review</span>;
      case 'ACTION_REQUIRED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertCircle className="w-3.5 h-3.5" /> Action Required</span>;
      case 'SUBMITTED':
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5" /> Submitted</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><FileText className="w-3.5 h-3.5" /> Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review all customer applications.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading || isUpdating}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm disabled:opacity-50"
          suppressHydrationWarning
        >
          <RefreshCw className={`w-4 h-4 ${loading || isUpdating ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Status Tabs */}
          <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar gap-2">
            {['ALL', 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? 'bg-emerald-900 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                suppressHydrationWarning
              >
                {status === 'ALL' ? 'All Applications' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              suppressHydrationWarning
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-500">Loading applications...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" />
                      <p>{error}</p>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium text-base">No applications found</p>
                    <p className="text-gray-500 mt-1">Adjust your search or filters to see results.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{app.applicationNumber}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{app._count?.documents || 0} Docs</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.fullName || app.customer?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{app.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700">{app.serviceType?.replace('_', ' ')}</span>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{app.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === app.id ? null : app.id)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        suppressHydrationWarning
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {dropdownOpen === app.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(null)} />
                          <div className="absolute right-6 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 overflow-hidden">
                            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Update Status
                            </div>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'IN_REVIEW')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Search className="w-4 h-4 text-blue-500" />
                              Mark In Review
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'ACTION_REQUIRED')}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              Action Required
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                              className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium text-gray-900">
                {Math.min(page * limit, totalRecords)}
              </span>{' '}
              of <span className="font-medium text-gray-900">{totalRecords}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                suppressHydrationWarning
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-xl bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                suppressHydrationWarning
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
