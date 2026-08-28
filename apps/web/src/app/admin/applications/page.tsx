'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { fetchAdminApplications, updateAdminApplicationStatus } from './actions';

interface ApplicationDoc {
  id: string;
  documentType: string;
  fileName: string;
  status: string;
  version: number;
  uploadedAt: string;
  fileSize?: number;
}

interface ApplicationItem {
  id: string;
  applicationNumber: string;
  serviceType: string;
  title?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    totalFee: number;
  };
  documents: ApplicationDoc[];
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminApplications(search, selectedStatus);
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setApplications(res.data);
      if (selectedApp) {
        const updated = res.data.find((a: ApplicationItem) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    }
    setLoading(false);
  }, [search, selectedStatus, selectedApp]);

  useEffect(() => {
    loadData();
  }, [search, selectedStatus]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setLoading(true);
    const res = await updateAdminApplicationStatus(appId, newStatus);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(`Application status updated to ${newStatus}`);
      await loadData();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">UNDER REVIEW</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">SUBMITTED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">DRAFT</span>;
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Applications' },
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'UNDER_REVIEW', label: 'Under Review' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'DRAFT', label: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer applications, verify submitted documents, and update processing statuses.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by app #, customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-emerald-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">App Number</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Service</th>
                <th className="px-6 py-3.5">Documents</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading && applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900">No applications found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {app.applicationNumber || `AMC-${app.id.slice(0, 8)}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.fullName || app.customer?.name || 'Applicant'}</div>
                      <div className="text-xs text-gray-500">{app.email || app.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.service?.name || app.serviceType || 'General Service'}</div>
                      {app.service?.totalFee ? (
                        <div className="text-xs text-emerald-600 font-semibold">JD {app.service.totalFee}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {app.documents.length} attached
                        </span>
                        {app.documents.some((d) => d.status === 'VERIFIED') && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {app.documents.filter((d) => d.status === 'VERIFIED').length} verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Application Details — {selectedApp.applicationNumber || `AMC-${selectedApp.id.slice(0, 8)}`}
                </h3>
                <p className="text-xs text-gray-500">Created on {new Date(selectedApp.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-medium text-gray-500">Applicant Name</span>
                <p className="font-semibold text-gray-900">{selectedApp.fullName || selectedApp.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Applicant Email</span>
                <p className="font-semibold text-gray-900">{selectedApp.email || selectedApp.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Applicant Phone</span>
                <p className="font-semibold text-gray-900">{selectedApp.phone || selectedApp.customer?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Current Status</span>
                <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Attached Documents ({selectedApp.documents.length})</h4>
              {selectedApp.documents.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No documents uploaded yet for this application.</p>
              ) : (
                <div className="space-y-2">
                  {selectedApp.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-700" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{doc.documentType}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.status}
                        </span>
                        <a
                          href={`/api/v1/admin/applications/${selectedApp.id}/documents/${doc.id}/stream`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-xs text-emerald-800 hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
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
