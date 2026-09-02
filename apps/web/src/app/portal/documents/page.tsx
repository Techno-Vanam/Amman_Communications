'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  FileText,
  Download,
  FileCheck,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import {
  fetchDocumentsGroupedAction,
  uploadDocumentAction,
  deleteDocumentAction,
  getDecryptedDocumentAction,
} from '@/app/portal/actions';

interface DocRecord {
  documentId: string;
  id: string;
  documentType: string;
  fileName: string;
  originalFileName?: string;
  storagePath?: string;
  mimeType: string;
  fileSize: number;
  status: string;
  version: number;
  uploadedAt: string;
  updatedAt: string;
  rejectionReason?: string;
  downloadUrl?: string;
}

interface ApplicationGroup {
  applicationId: string;
  applicationNumber?: string;
  title?: string;
  serviceType: string;
  status: string;
  documents: DocRecord[];
}

const STATUS_STYLES: Record<string, string> = {
  UPLOADED: 'bg-blue-50 text-blue-800 border border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 border border-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
  UPLOADED: 'Uploaded',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export default function PortalDocumentsPage() {
  const { showToast } = useNotifications();
  const [groups, setGroups] = useState<ApplicationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null); // applicationId being uploaded to
  const [dragging, setDragging] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Selected application for quick upload
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('IDENTITY_PROOF');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const data = await fetchDocumentsGroupedAction();
      setGroups(data);
      if (data.length > 0) {
        setSelectedAppId(data[0].applicationId);
        setExpandedGroups(new Set(data.map((g: ApplicationGroup) => g.applicationId)));
=======
      const [res, catRes] = await Promise.all([
        apiRequest<ApplicationGroup[]>('/api/v1/customer/documents'),
        apiRequest<ServiceDefinition[]>('/api/v1/customer/services-catalog'),
      ]);

      if (catRes.success && catRes.data && catRes.data.length > 0) {
        setCatalog(catRes.data);
>>>>>>> origin/backend-merge
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

<<<<<<< HEAD
  const handleUpload = async (file: File, appId: string, docTypeOverride?: string) => {
    if (!appId) {
      showToast('No Application Selected', 'Please select an application to upload a document for.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum allowed file size is 10 MB.');
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Unsupported Format', 'Only PDF, JPG, PNG and WEBP files are allowed.');
=======
  // Get the required documents spec for a service type
  const getServiceSpec = (serviceType: string) => {
    return (
      catalog.find(
        (s) =>
          s.code === serviceType ||
          s.id === serviceType ||
          s.title?.toLowerCase() === serviceType?.toLowerCase() ||
          (s as ServiceDefinition & { name?: string }).name?.toLowerCase() === serviceType?.toLowerCase(),
      ) ||
      DEFAULT_SERVICES.find(
        (s) =>
          s.code === serviceType ||
          s.id === serviceType ||
          s.title?.toLowerCase() === serviceType?.toLowerCase(),
      )
    );
  };

  // Upload or replace a document for a specific application
  const handleUploadOrReplace = async (
    applicationId: string,
    documentType: string,
    file: File,
  ) => {
    setMessage(null);

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage({ type: 'error', text: `File "${file.name}" exceeds maximum 10MB limit.` });
>>>>>>> origin/backend-merge
      return;
    }

    const targetDocType = docTypeOverride || selectedDocType;

    setUploading(appId);
    try {
      const base64Data = await fileToBase64(file);
      const result = await uploadDocumentAction(appId, {
        documentType: targetDocType,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        base64Data,
      });

<<<<<<< HEAD
      if (result.error) {
        showToast('Upload Failed', result.error);
      } else {
        showToast('Document Uploaded!', `${file.name} saved and encrypted in your vault.`);
        await loadDocuments();
      }
    } finally {
      setUploading(null);
=======
        const res = await apiRequest(`/api/v1/customer/applications/${applicationId}/documents/upload`, {
          method: 'POST',
          body: JSON.stringify({
            documentType,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            fileSize: file.size,
            base64Data,
          }),
        });

        setUploadingSlot(null);

        if (res.success) {
          setMessage({
            type: 'success',
            text: `Document "${file.name}" uploaded successfully! Single source of truth synchronized.`,
          });
          await fetchDocuments();
        } else {
          setMessage({
            type: 'error',
            text: res.message || 'Failed to upload document. Please try again.',
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      setUploadingSlot(null);
      const text = err instanceof Error ? err.message : 'Upload failed';
      setMessage({ type: 'error', text });
>>>>>>> origin/backend-merge
    }
  };

  const handleDelete = async (applicationId: string, documentId: string, fileName: string) => {
    const result = await deleteDocumentAction(applicationId, documentId);
    if (result.error) {
      showToast('Delete Failed', result.error);
    } else {
      showToast('Document Deleted', `${fileName} removed from your vault.`);
      await loadDocuments();
    }
  };

  const handleDownload = async (doc: DocRecord) => {
    if (doc.storagePath) {
      showToast('Downloading Document', 'Decrypting and preparing your file...');
      const res = await getDecryptedDocumentAction(doc.storagePath);
      if (res.success && res.base64) {
        const rawBase64 = res.base64.includes(',') ? res.base64.split(',')[1] : res.base64;
        const cleanBase64 = rawBase64.replace(/\s/g, '');
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const fileName = res.fileName || doc.originalFileName || doc.fileName || 'document';
        const ext = fileName.split('.').pop()?.toLowerCase();
        let mime = res.mimeType || doc.mimeType;
        if (!mime || mime === 'application/octet-stream') {
          if (ext === 'jpeg' || ext === 'jpg') mime = 'image/jpeg';
          else if (ext === 'png') mime = 'image/png';
          else if (ext === 'webp') mime = 'image/webp';
          else if (ext === 'pdf') mime = 'application/pdf';
          else mime = 'application/octet-stream';
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Download Complete', `${link.download} saved to your device.`);
        return;
      }
    }

    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    } else {
      showToast('Download Unavailable', 'Download link is not available for this document.');
    }
  };

  const toggleGroup = (appId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const DOC_TYPE_OPTIONS = [
    { value: 'IDENTITY_PROOF', label: 'Identity Proof (Aadhaar / PAN / Passport)' },
    { value: 'ADDRESS_PROOF', label: 'Address Proof' },
    { value: 'PROPERTY_DEED', label: 'Property Sale Deed' },
    { value: 'EC_CERTIFICATE', label: 'EC Certificate' },
    { value: 'REVENUE_EXTRACT', label: 'Revenue Extract / Patta' },
    { value: 'VEHICLE_RC', label: 'Vehicle RC' },
    { value: 'INSURANCE', label: 'Insurance Document' },
    { value: 'OTHER', label: 'Other Supporting Document' },
  ];

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 font-sans">

      {/* Upload Panel */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file, selectedAppId);
        }}
        className={`bg-white border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragging ? 'border-[#12372A] bg-[#f0f7f2]' : 'border-gray-300 hover:border-[#12372A]'
        }`}
      >
        <div className="max-w-lg mx-auto space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#12372A] flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Upload Official Documents</h3>
            <p className="text-xs text-gray-500 mt-1">
              Files are AES-256-GCM encrypted and stored securely. Supported: PDF, PNG, JPG, WEBP (max 10 MB).
            </p>
          </div>

          {/* Application & Doc-Type selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Application</label>
              {groups.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No applications found — create one first.</p>
              ) : (
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12372A]/20 focus:border-[#12372A]"
                >
                  {groups.map((g) => (
                    <option key={g.applicationId} value={g.applicationId}>
                      {g.applicationNumber || g.applicationId.slice(0, 8)} — {g.serviceType}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Document Type</label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#12372A]/20 focus:border-[#12372A]"
              >
                {DOC_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label
            className={`inline-flex items-center gap-2 px-6 py-2.5 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm ${
              groups.length === 0 || uploading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#12372A] hover:bg-[#1a4a38]'
            }`}
          >
            {uploading === selectedAppId ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading…</span></>
            ) : (
              <><Plus className="w-4 h-4 text-[#a8d5b9]" /><span>Browse &amp; Upload</span></>
            )}
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload(e.target.files[0], selectedAppId);
                e.target.value = '';
              }}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              disabled={groups.length === 0 || !!uploading}
            />
          </label>
        </div>
      </div>

      {/* Documents grouped by Application */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#12372A]" />
            Your Documents
          </h2>
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-[#12372A] hover:bg-emerald-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#12372A] animate-spin mx-auto" />
            <p className="text-xs text-gray-500 mt-3">Loading your documents…</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-700 text-sm">No Documents Yet</p>
            <p className="text-[11px] text-gray-500">
              Create an application first, then upload your supporting documents above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {groups.map((group) => {
              const isOpen = expandedGroups.has(group.applicationId);
              return (
                <div key={group.applicationId}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.applicationId)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-5 h-5 text-[#12372A] shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {group.applicationNumber || group.applicationId.slice(0, 12)}
                          {group.serviceType && (
                            <span className="ml-2 text-xs font-semibold text-gray-500">— {group.serviceType}</span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>

                  {/* Documents inside group */}
                  {isOpen && (
                    <div className="divide-y divide-gray-50 bg-gray-50/40">
                      {group.documents.length === 0 ? (
                        <div className="px-8 py-6 text-center">
                          <AlertCircle className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">No documents uploaded for this application yet.</p>
                        </div>
                      ) : (
                        group.documents.map((doc) => (
                          <div
                            key={doc.documentId}
                            className="px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#12372A] flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-bold text-gray-900">{doc.originalFileName || doc.fileName}</p>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[doc.status] || STATUS_STYLES.UPLOADED}`}>
                                    {STATUS_LABELS[doc.status] || doc.status}
                                  </span>
                                  {doc.version > 1 && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">v{doc.version}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                  <span>Type: <strong className="text-gray-700">{doc.documentType.replace(/_/g, ' ')}</strong></span>
                                  <span>•</span>
                                  <span>{formatSize(doc.fileSize)}</span>
                                  <span>•</span>
                                  <span>{formatDate(doc.uploadedAt)}</span>
                                </div>
                                {doc.rejectionReason && (
                                  <p className="text-xs text-rose-600 mt-1">❌ Rejection: {doc.rejectionReason}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {/* Download */}
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-2 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border border-blue-200"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>

                              {/* Re-upload (replace) */}
                              <label
                                className={`p-2 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold border border-emerald-200 ${uploading === group.applicationId ? 'opacity-50 pointer-events-none' : ''}`}
                                title="Re-upload / Replace"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Replace</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      // Re-upload uses exact target doc type directly to avoid async state race condition
                                      handleUpload(e.target.files[0], group.applicationId, doc.documentType);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(group.applicationId, doc.documentId, doc.originalFileName || doc.fileName)}
                                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}