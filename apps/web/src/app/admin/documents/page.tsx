'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import {
  DocumentItem,
  DocumentStats,
  DocumentVerificationStatus,
} from '@/lib/api/documents';
import {
  deleteDocumentAction,
  fetchAdminDocuments,
  fetchAdminDocumentStats,
  verifyDocumentAction,
} from './actions';

export default function AdminDocumentsPage() {
  // State: Data
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State: Loading & Errors
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State: Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // State: Modals
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // State: Review Form
  const [reviewStatus, setReviewStatus] = useState<DocumentVerificationStatus>('VERIFIED');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // State: Delete Action
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Load Stats
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await fetchAdminDocumentStats();
    if (res.stats) setStats(res.stats);
    setStatsLoading(false);
  }, []);

  // 2. Load Documents
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminDocuments(
      search || undefined,
      statusFilter !== 'ALL' ? statusFilter : undefined,
      currentPage,
      10
    );

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setDocuments(res.data.items);
      setTotalDocuments(res.data.total);
      setTotalPages(res.data.totalPages);
    }
    setLoading(false);
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle Search Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Open Review Modal
  const handleOpenReviewModal = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setReviewStatus(doc.verificationStatus === 'PENDING' ? 'VERIFIED' : doc.verificationStatus);
    setReviewRemarks(doc.verificationRemarks || '');
    setReviewError(null);
    setIsReviewModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsDetailModalOpen(true);
  };

  // Submit Review Form
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    setSubmittingReview(true);
    setReviewError(null);

    const res = await verifyDocumentAction(
      selectedDoc.id,
      reviewStatus,
      reviewRemarks.trim() || undefined
    );

    if (!res.success) {
      setReviewError(res.error || 'Failed to update document status');
      setSubmittingReview(false);
      return;
    }

    setSubmittingReview(false);
    setIsReviewModalOpen(false);
    loadDocuments();
    loadStats();
  };

  // Delete Document
  const handleDeleteDocument = async (doc: DocumentItem) => {
    if (!confirm(`Are you sure you want to delete "${doc.fileName}"?`)) return;

    setDeletingId(doc.id);
    const res = await deleteDocumentAction(doc.id);
    if (!res.success) {
      alert(res.error || 'Failed to delete document');
    } else {
      loadDocuments();
      loadStats();
    }
    setDeletingId(null);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Status Badge Helper
  const renderStatusBadge = (status: DocumentVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Document Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review customer uploaded documents, licenses, IDs, and compliance verifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadStats();
            loadDocuments();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Documents */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Documents
            </p>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 font-mono">
            {statsLoading ? '...' : stats?.total || 0}
          </p>
          <p className="mt-1 text-xs text-gray-500">Uploaded across all clients</p>
        </div>

        {/* Pending Verification */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Pending Review
            </p>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-900 font-mono">
            {statsLoading ? '...' : stats?.pending || 0}
          </p>
          <p className="mt-1 text-xs text-amber-700 font-medium">Requires admin action</p>
        </div>

        {/* Verified Documents */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Verified
            </p>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-900 font-mono">
            {statsLoading ? '...' : stats?.verified || 0}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Compliance verified</p>
        </div>

        {/* Rejected Documents */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Rejected
            </p>
            <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-900 font-mono">
            {statsLoading ? '...' : stats?.rejected || 0}
          </p>
          <p className="mt-1 text-xs text-rose-700 font-medium">Correction requested</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        {/* Table Controls (Search & Filter) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gray-50/50 border-b border-gray-200">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search file, document type, client..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 shadow-sm"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending Review' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  setStatusFilter(pill.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  statusFilter === pill.id
                    ? 'bg-emerald-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Content */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-800" />
              <p className="mt-3 text-sm font-semibold text-gray-700">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">No documents found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {search || statusFilter !== 'ALL'
                  ? 'No documents match your current filter criteria.'
                  : 'Uploaded customer documents will appear here for verification.'}
              </p>
              {(search || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                  }}
                  className="mt-4 text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[200px]">Document & File</th>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[180px]">Customer</th>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[160px]">Service</th>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[100px]">Size</th>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[140px]">Status</th>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap min-w-[120px]">Uploaded At</th>
                    <th scope="col" className="px-6 py-3.5 whitespace-nowrap text-right min-w-[160px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition group">
                      {/* Document Type & File Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/documents/${doc.id}`} className="block">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-800 text-sm flex items-center gap-2 transition">
                            <FileCheck className="h-4 w-4 text-emerald-800 flex-shrink-0" />
                            {doc.documentType}
                          </p>
                          <p className="text-xs font-mono text-gray-500 group-hover:text-emerald-700 mt-0.5 max-w-xs truncate transition" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/admin/documents/${doc.id}`} className="block">
                          <p className="font-semibold text-gray-900">{doc.customer?.name || 'Customer'}</p>
                          <p className="text-xs text-gray-400">{doc.customer?.email}</p>
                        </Link>
                      </td>

                      {/* Service */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                        {doc.application?.service?.name ? (
                          <span className="font-medium">{doc.application.service.name}</span>
                        ) : (
                          <span className="text-gray-400 italic">General Submission</span>
                        )}
                      </td>

                      {/* File Size & Format */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                        {formatFileSize(doc.fileSize)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {renderStatusBadge(doc.verificationStatus)}
                          {doc.verificationRemarks && (
                            <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] truncate" title={doc.verificationRemarks}>
                              {doc.verificationRemarks}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                        {/* Review / Verify Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(doc)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Review
                        </button>

                        {/* View Details Link */}
                        <Link
                          href={`/admin/documents/${doc.id}`}
                          className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition inline-flex items-center align-middle"
                          title="View Document Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={deletingId === doc.id}
                          onClick={() => handleDeleteDocument(doc)}
                          className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition inline-flex items-center align-middle disabled:opacity-50"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {documents.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span> ({totalDocuments} documents)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================================
          MODAL 1: REVIEW & VERIFY DOCUMENT MODAL
          ========================================================== */}
      {isReviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Review & Verify Document</h3>
                  <p className="text-xs text-gray-500">Client: {selectedDoc.customer?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {reviewError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Doc Preview Banner */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {selectedDoc.documentType}
                </p>
                <p className="text-xs font-mono text-slate-600 break-all">{selectedDoc.fileName}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>Size: {formatFileSize(selectedDoc.fileSize)}</span>
                  <span>•</span>
                  <span>Type: {selectedDoc.mimeType}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Verification Decision <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'VERIFIED' as const, label: 'Approve', icon: CheckCircle2, color: 'text-emerald-700', activeBg: 'bg-emerald-900 text-white' },
                    { id: 'REJECTED' as const, label: 'Reject', icon: XCircle, color: 'text-rose-700', activeBg: 'bg-rose-700 text-white' },
                    { id: 'PENDING' as const, label: 'Hold', icon: Clock, color: 'text-amber-700', activeBg: 'bg-amber-700 text-white' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setReviewStatus(option.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition gap-1 ${
                        reviewStatus === option.id
                          ? option.activeBg
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks / Feedback */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Verification Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder={
                    reviewStatus === 'REJECTED'
                      ? 'Specify why this document is rejected (e.g. Blurry photo, expired license, invalid format)...'
                      : 'Optional verification notes or reference number...'
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-800 resize-none shadow-sm"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 disabled:opacity-50 transition shadow-sm"
                >
                  {submittingReview ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL 2: DOCUMENT DETAILS MODAL
          ========================================================== */}
      {isDetailModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Document Overview</h3>
                  <p className="text-xs text-gray-500">ID: {selectedDoc.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Document Banner */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200 p-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">{selectedDoc.documentType}</h4>
                  <p className="text-xs font-mono text-emerald-800 break-all">{selectedDoc.fileName}</p>
                </div>
                <div>{renderStatusBadge(selectedDoc.verificationStatus)}</div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-200">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider">Client Details</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{selectedDoc.customer?.name}</p>
                  <p className="text-gray-500 mt-0.5">{selectedDoc.customer?.email}</p>
                  {selectedDoc.customer?.phone && (
                    <p className="text-gray-500 mt-0.5">{selectedDoc.customer.phone}</p>
                  )}
                </div>

                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-200">
                  <p className="font-semibold text-gray-400 uppercase tracking-wider">File Specifications</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatFileSize(selectedDoc.fileSize)}</p>
                  <p className="text-gray-500 mt-0.5 font-mono">{selectedDoc.mimeType}</p>
                  <p className="text-gray-500 mt-0.5">
                    Uploaded:{' '}
                    {new Date(selectedDoc.uploadedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Service association */}
              {selectedDoc.application?.service && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Associated Service:</span>
                  <span className="font-bold text-slate-900">{selectedDoc.application.service.name}</span>
                </div>
              )}

              {/* Verification remarks */}
              {selectedDoc.verificationRemarks && (
                <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3.5 text-xs space-y-1">
                  <p className="font-bold text-amber-900 uppercase tracking-wide">Verification Remarks</p>
                  <p className="text-amber-800">{selectedDoc.verificationRemarks}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Downloading "${selectedDoc.fileName}" from secure storage.`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                >
                  <Download className="h-4 w-4" /> Download File
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleOpenReviewModal(selectedDoc);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 transition"
                  >
                    Change Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
