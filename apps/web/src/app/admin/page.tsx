'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminDashboardSummary, fetchAdminVerificationQueue, verifyDocumentStatus } from './actions';
import { AlertCircle, CheckCircle2, Clock, FileText, RefreshCw, X, XCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardSummary {
  customers: number;
  applications: number;
  documents: number;
}

interface QueuedDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  version: number;
  rejectionReason?: string;
  uploadedAt: string;
  applicationId: string;
  applicationNumber: string;
  customerName: string;
  downloadUrl: string;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [queue, setQueue] = useState<QueuedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [summaryRes, queueRes] = await Promise.all([
      fetchAdminDashboardSummary(),
      fetchAdminVerificationQueue(),
    ]);

    if (summaryRes.error) {
      setError(summaryRes.error);
    } else if (summaryRes.data) {
      setSummary(summaryRes.data);
    }

    if (queueRes.error) {
      // Don't overwrite summary error if there is one
      if (!summaryRes.error) setError(queueRes.error);
    } else if (queueRes.data) {
      setQueue(queueRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (applicationId: string, documentId: string, status: string) => {
    let reason;
    if (status === 'REJECTED' || status === 'ACTION_REQUIRED') {
      reason = prompt('Please enter a reason for rejecting this document:');
      if (reason === null) return; // User cancelled
    }

    setLoading(true);
    const res = await verifyDocumentStatus(applicationId, documentId, status, reason);
    if (res.error) {
      alert(res.error);
      setLoading(false);
    } else {
      await loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of platform activity and document verification queue.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium">Error</h3>
            <p className="text-sm mt-1 opacity-90">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
              <h3 className="text-3xl font-bold text-gray-900">{summary.customers}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Applications</p>
              <h3 className="text-3xl font-bold text-gray-900">{summary.applications}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Documents Uploaded</p>
              <h3 className="text-3xl font-bold text-gray-900">{summary.documents}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Verification Queue */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Document Verification Queue</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            {queue.filter(q => q.status === 'UPLOADED' || q.status === 'PENDING').length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Application</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-3" />
                    <p>Loading queue...</p>
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900">Queue is empty</p>
                    <p className="text-sm mt-1">No documents pending verification right now.</p>
                  </td>
                </tr>
              ) : (
                queue.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{doc.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">{doc.applicationNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.documentType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span className="truncate max-w-[150px] inline-block" title={doc.fileName}>{doc.fileName}</span>
                        <span className="text-gray-300">•</span>
                        <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                        {doc.version > 1 && (
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            v{doc.version}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 ml-5">
                        {new Date(doc.uploadedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          doc.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.status === 'REJECTED' || doc.status === 'ACTION_REQUIRED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {doc.status}
                      </span>
                      {doc.rejectionReason && (
                        <div className="text-[10px] text-red-600 mt-1 max-w-[150px] mx-auto truncate" title={doc.rejectionReason}>
                          {doc.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        View
                      </a>
                      
                      {doc.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerify(doc.applicationId, doc.id, 'VERIFIED')}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      
                      {(doc.status === 'UPLOADED' || doc.status === 'PENDING') && (
                        <button
                          onClick={() => handleVerify(doc.applicationId, doc.id, 'ACTION_REQUIRED')}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
