'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  FileUp,
  Info,
  Plus,
  RefreshCw,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { DocumentItem, DocumentVerificationStatus } from '@/lib/api/documents';
import { fetchCustomerDocuments, uploadCustomerDocumentAction } from './actions';
import CustomSelect from '@/components/CustomSelect';

const DOCUMENT_TYPES = [
  'National Identification / Passport',
  'Commercial Registration Certificate',
  'Authorized Signatory National ID',
  'Lease Agreement / Proof of Address',
  'Utility Bill (Electricity/Water)',
  'Company Trade License',
  'Tax Identification Document',
  'Network Topology Diagram',
  'Subscriber ID Copy',
  'Other Supporting Document',
];

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Upload Form State
  const [selectedType, setSelectedType] = useState<string>(DOCUMENT_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchCustomerDocuments();
    if (res.error) {
      setError(res.error);
    } else if (res.documents) {
      setDocuments(res.documents);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit.');
        return;
      }
      setFile(selected);
      setUploadError(null);
    }
  };

  // Handle Document Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const res = await uploadCustomerDocumentAction({
      documentType: selectedType,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      fileSize: file.size,
    });

    if (!res.success) {
      setUploadError(res.error || 'Failed to upload document.');
      setUploading(false);
      return;
    }

    setUploadSuccess(`"${file.name}" uploaded successfully! It is now pending admin verification.`);
    setFile(null);
    setUploading(false);
    loadDocuments();
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
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Document Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload required KYC proofs, identity documents, and business certificates for your services.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDocuments}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Banner Guidelines */}
      <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 flex items-start gap-4">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800 mt-0.5 flex-shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-xs text-emerald-950 space-y-1">
          <p className="font-bold text-sm text-emerald-900">Secure Document Submission</p>
          <p className="text-emerald-800">
            Accepted formats: <strong>PDF, PNG, JPEG, WEBP</strong> (Max 10MB per file). Your documents are encrypted
            and verified by Amman Communications compliance officers for service activation.
          </p>
        </div>
      </div>

      {/* Grid: Upload Box + Status Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Form Box */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
            <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-800">
              <FileUp className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Upload New File</h2>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Document Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Document Category <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={DOCUMENT_TYPES.map((t) => ({ value: t, label: t }))}
              />
            </div>

            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Choose Document File <span className="text-red-500">*</span>
              </label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-emerald-800 transition bg-gray-50/50">
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <Upload className="h-5 w-5" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Click or drag file here</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PDF, PNG, or JPG (up to 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition shadow-sm"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload for Review
                </>
              )}
            </button>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-800" />
              <h2 className="text-base font-bold text-gray-900">Your Uploaded Documents</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {documents.length} files
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-800" />
              <p className="mt-3 text-sm font-semibold text-gray-700">Loading your documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">No documents uploaded yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Use the upload box on the left to submit your identification or business certificates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div key={doc.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-800 flex-shrink-0" />
                        <span className="text-sm font-bold text-gray-900">{doc.documentType}</span>
                      </div>
                      <p className="text-xs font-mono text-gray-500 ml-6 break-all">{doc.fileName}</p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto ml-6 sm:ml-0">
                      {renderStatusBadge(doc.verificationStatus)}
                      <button
                        type="button"
                        onClick={() => alert(`Downloading "${doc.fileName}"`)}
                        className="p-1.5 text-gray-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rejection / verification notes */}
                  {doc.verificationRemarks && (
                    <div className={`ml-6 p-3 rounded-xl text-xs flex items-start gap-2 ${
                      doc.verificationStatus === 'REJECTED'
                        ? 'bg-rose-50 border border-rose-200 text-rose-900'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}>
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Reviewer Notes:</p>
                        <p className="mt-0.5">{doc.verificationRemarks}</p>
                      </div>
                    </div>
                  )}

                  <div className="ml-6 flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>
                      Uploaded{' '}
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}