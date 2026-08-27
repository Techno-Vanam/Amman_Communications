'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  Printer,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { DocumentItem, DocumentVerificationStatus } from '@/lib/api/documents';
import {
  deleteDocumentAction,
  fetchAdminDocumentById,
  verifyDocumentAction,
} from '../actions';

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Review Form state
  const [reviewStatus, setReviewStatus] = useState<DocumentVerificationStatus>('VERIFIED');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminDocumentById(id);
    if (res.document) {
      setDocument(res.document);
      setReviewStatus(res.document.verificationStatus === 'PENDING' ? 'VERIFIED' : res.document.verificationStatus);
      setReviewRemarks(res.document.verificationRemarks || '');
    } else {
      setError(res.error || 'Failed to load document.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  const handleUpdateStatus = async (statusToSet: DocumentVerificationStatus) => {
    if (!document) return;
    setSubmittingReview(true);
    setReviewError(null);
    setSuccessMessage(null);

    const res = await verifyDocumentAction(
      document.id,
      statusToSet,
      reviewRemarks.trim() || undefined
    );

    if (!res.success) {
      setReviewError(res.error || 'Failed to update document status.');
    } else {
      setSuccessMessage(`Document status updated to ${statusToSet}.`);
      loadDocument();
    }
    setSubmittingReview(false);
  };

  const handleDelete = async () => {
    if (!document) return;
    if (!confirm(`Are you sure you want to permanently delete "${document.fileName}"?`)) return;

    const res = await deleteDocumentAction(document.id);
    if (!res.success) {
      alert(res.error || 'Failed to delete document.');
    } else {
      router.push('/admin/documents');
      router.refresh();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderStatusBadge = (status: DocumentVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            Verified & Compliant
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-3 py-1 text-xs font-bold text-rose-900 border border-rose-300">
            <XCircle className="h-4 w-4 text-rose-700" />
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
            <Clock className="h-4 w-4 text-amber-700" />
            Pending Verification
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-800" />
        <p className="mt-3 text-sm font-semibold text-gray-700">Loading document details...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/admin/documents"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Documents
        </Link>
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-3">
          <div className="flex items-center gap-2 text-base font-bold">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <span>Document Not Found</span>
          </div>
          <p className="text-sm">{error || 'The requested document could not be located.'}</p>
        </div>
      </div>
    );
  }

  const isPdf = document.mimeType.toLowerCase().includes('pdf') || document.fileName.toLowerCase().endsWith('.pdf');
  const isImage = document.mimeType.toLowerCase().includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(document.fileName);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/documents"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Documents
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-mono font-semibold text-gray-500 truncate max-w-xs">
            {document.fileName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              alert(`Downloading "${document.fileName}" from secure storage.`);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-100/70 p-3.5 text-emerald-900 flex-shrink-0">
            <FileCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{document.documentType}</h1>
            </div>
            <p className="text-xs font-mono text-gray-500 mt-1 break-all">{document.fileName}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
              <span>Size: <strong>{formatFileSize(document.fileSize)}</strong></span>
              <span>•</span>
              <span>Format: <strong>{document.mimeType}</strong></span>
              <span>•</span>
              <span>
                Uploaded on{' '}
                <strong>
                  {new Date(document.uploadedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="self-start md:self-center">
          {renderStatusBadge(document.verificationStatus)}
        </div>
      </div>

      {/* Main Grid: Document Viewer Preview + Review Decision Box */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Document Viewer / Preview Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Document Preview Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-800" />
                <h2 className="text-sm font-bold text-gray-900">Document Visual Preview</h2>
              </div>
              <span className="text-xs font-mono font-semibold text-gray-500">
                {isPdf ? 'PDF Document' : isImage ? 'Image File' : 'Binary File'}
              </span>
            </div>

            {/* Document Content Simulation */}
            <div className="p-8 bg-slate-900/5 min-h-[420px] flex flex-col items-center justify-center">
              <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                  {isPdf ? <FileText className="h-8 w-8" /> : <FileCheck className="h-8 w-8" />}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">{document.documentType}</h3>
                  <p className="text-xs font-mono text-gray-500 break-all">{document.fileName}</p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/70">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-semibold text-slate-900">{document.customer?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/70">
                    <span className="text-slate-500">Email</span>
                    <span className="font-mono text-slate-900">{document.customer?.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/70">
                    <span className="text-slate-500">Service</span>
                    <span className="font-semibold text-slate-900">
                      {document.application?.service?.name || 'General Application'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Storage URI</span>
                    <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]" title={document.storagePath}>
                      {document.storagePath}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => alert(`Opening preview of "${document.fileName}" in full resolution.`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Full Screen Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading "${document.fileName}"...`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" /> Download File
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client & Service Information Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Customer Details */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <User className="h-4 w-4 text-emerald-800" />
                <span>Client Information</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <p className="text-base font-bold text-gray-900">{document.customer?.name}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {document.customer?.email}
                </p>
                {document.customer?.phone && (
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {document.customer.phone}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href={`/admin/customers`}
                  className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  View Client Profile →
                </Link>
              </div>
            </div>

            {/* Service & Application Details */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <FileSpreadsheet className="h-4 w-4 text-emerald-800" />
                <span>Associated Service</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <p className="text-base font-bold text-gray-900">
                  {document.application?.service?.name || 'General Service'}
                </p>
                <p className="text-xs text-gray-500">
                  Application ID: <span className="font-mono text-gray-700">{document.applicationId}</span>
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/admin/services"
                  className="text-xs font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  Browse Service Catalog →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Admin Review & Verification Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-800" />
              <h2 className="text-base font-bold text-gray-900">Verification Decision</h2>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {/* Current Status Display */}
            <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Current Status:</span>
              <div>{renderStatusBadge(document.verificationStatus)}</div>
            </div>

            {/* Verification Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Reviewer Notes / Feedback
              </label>
              <textarea
                rows={4}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Add notes explaining your verification decision or reasons for rejection..."
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:border-emerald-800 resize-none shadow-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleUpdateStatus('VERIFIED')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve & Mark Verified
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleUpdateStatus('REJECTED')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Reject Document
              </button>

              <button
                type="button"
                disabled={submittingReview}
                onClick={() => handleUpdateStatus('PENDING')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                <Clock className="h-4 w-4" /> Put on Hold (Pending)
              </button>
            </div>
          </div>

          {/* Verification Audit Details */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-gray-500">
              Audit & Compliance
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Document ID</span>
                <span className="font-mono text-gray-900 font-semibold">{document.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span>Storage System</span>
                <span className="font-semibold text-gray-900">Encrypted Local Storage</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Last Updated</span>
                <span className="font-semibold text-gray-900">
                  {new Date(document.uploadedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
