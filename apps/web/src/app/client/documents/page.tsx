'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { SERVICES_CATALOG, type RequiredDocumentSpec } from '@repo/shared-types';

interface DocumentRecord {
  documentId: string;
  id: string;
  documentType: string;
  fileName: string;
  originalFileName?: string;
  mimeType: string;
  fileSize: number;
  isEncrypted?: boolean;
  status: string;
  version: number;
  uploadedAt: string;
  rejectionReason?: string;
  downloadUrl?: string;
}

interface ApplicationGroup {
  applicationId: string;
  applicationNumber: string;
  title?: string;
  serviceType: string;
  status: string;
  documents: DocumentRecord[];
}

export default function DocumentCenterPage() {
  const [groups, setGroups] = useState<ApplicationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<ApplicationGroup[]>('/api/v1/customer/documents');
      if (res.success && res.data && res.data.length > 0) {
        setGroups(res.data);
      } else {
        setGroups([]);
      }
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Get the required documents spec for a service type
  const getServiceSpec = (serviceType: string) => {
    return SERVICES_CATALOG.find((s) => s.code === serviceType);
  };

  // Handle uploading a missing document or replacing an existing one
  const handleUploadDocument = async (
    appId: string,
    docType: string,
    file: File,
  ) => {
    setMessage(null);

    // 10MB check
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File exceeds the 10MB limit. Please compress or choose a smaller file.' });
      return;
    }

    const slotKey = `${appId}_${docType}`;
    setUploadingSlot(slotKey);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const res = await apiRequest(`/api/v1/customer/applications/${appId}/documents/upload`, {
          method: 'POST',
          body: JSON.stringify({
            documentType: docType,
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
            text: `Document "${file.name}" uploaded successfully for ${docType}. Synced across Application & Document Center.`,
          });
          fetchDocuments();
        } else {
          setMessage({
            type: 'error',
            text: res.message || 'Upload failed. Please try again.',
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingSlot(null);
      setMessage({ type: 'error', text: err?.message || 'Upload failed' });
    }
  };

  const totalDocuments = groups.reduce((sum, g) => sum + g.documents.length, 0);
  const totalRequired = groups.reduce((sum, g) => {
    const spec = getServiceSpec(g.serviceType);
    return sum + (spec?.requiredDocuments.filter((d) => d.required).length || 0);
  }, 0);

  return (
    <div className="app-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-info">Document Upload Center</span>
            <span className="badge badge-success">Single Source of Truth</span>
          </div>
          <h1 style={{ fontSize: '2.25rem' }}>Your Secure Document Repository</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Upload and manage documents for each service application. Only service-specific documents are shown.
          </p>
        </div>

        <Link href="/client/new-application" className="btn btn-primary">
          ➕ Start New Application
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: message.type === 'success' ? '#86efac' : '#fca5a5',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>
            TOTAL APPLICATIONS
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {groups.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>
            DOCUMENTS UPLOADED
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>
            {totalDocuments} / {totalRequired}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700 }}>
            SECURITY ENCRYPTION
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
            AES-256 GCM
          </div>
        </div>
      </div>

      {/* Application Document Groups */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading encrypted document repository...
        </div>
      ) : groups.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>
            No Documents Uploaded Yet
          </h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Create a service application first. Your required documents will appear here for upload and management.
          </p>
          <Link href="/client/new-application" className="btn btn-primary">
            Create Application & Upload Documents
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groups.map((group) => {
            const serviceSpec = getServiceSpec(group.serviceType);
            const requiredDocs = serviceSpec?.requiredDocuments || [];
            const uploadedMap = new Map(
              group.documents.map((doc) => [doc.documentType, doc]),
            );

            const uploadedCount = group.documents.length;
            const requiredCount = requiredDocs.filter((d) => d.required).length;
            const allRequiredUploaded = requiredDocs
              .filter((d) => d.required)
              .every((d) => uploadedMap.has(d.type));

            return (
              <div key={group.applicationId} className="card">
                {/* Group Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-info">{group.applicationNumber}</span>
                      <span className="badge badge-neutral">{serviceSpec?.title || group.serviceType}</span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem' }}>{serviceSpec?.icon} {serviceSpec?.title || group.serviceType}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {allRequiredUploaded ? (
                      <span className="badge badge-success">
                        ✅ All Required Documents Uploaded ({uploadedCount}/{requiredCount})
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        ⚠️ {uploadedCount}/{requiredCount} Documents Uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Document Checklist — one row per required document */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requiredDocs.map((spec: RequiredDocumentSpec) => {
                    const uploaded = uploadedMap.get(spec.type);
                    const slotKey = `${group.applicationId}_${spec.type}`;
                    const isUploading = uploadingSlot === slotKey;

                    return (
                      <div
                        key={spec.type}
                        style={{
                          background: uploaded ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${uploaded ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        {/* Left — Document info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: 'var(--radius-sm)',
                              background: uploaded
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(255, 255, 255, 0.06)',
                              color: uploaded ? 'var(--success)' : 'var(--text-dim)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.25rem',
                              flexShrink: 0,
                            }}
                          >
                            {uploaded ? '✅' : '📄'}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                {spec.name}
                              </span>
                              {spec.required && (
                                <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                                  REQUIRED
                                </span>
                              )}
                              {!spec.required && (
                                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                                  OPTIONAL
                                </span>
                              )}
                            </div>

                            {uploaded ? (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                <strong>{uploaded.fileName}</strong> • v{uploaded.version} •{' '}
                                {(uploaded.fileSize / 1024).toFixed(1)} KB •{' '}
                                {new Date(uploaded.uploadedAt).toLocaleDateString()} • 🔒 Encrypted
                                {uploaded.status === 'VERIFIED' && (
                                  <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                                    ✅ Verified
                                  </span>
                                )}
                                {uploaded.status === 'UPLOADED' && (
                                  <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                                    ⏱️ Under Review
                                  </span>
                                )}
                                {uploaded.status === 'ACTION_REQUIRED' && (
                                  <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                                    ⚠️ Action Required
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                {spec.description}
                                <br />
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                  Formats: {spec.acceptedFormats.join(', ')} • Max: {spec.maxSizeMb}MB
                                </span>
                              </div>
                            )}

                            {/* Rejection reason */}
                            {uploaded?.rejectionReason && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  padding: '0.5rem 0.75rem',
                                  background: 'var(--danger-bg)',
                                  border: '1px solid var(--danger-border)',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  color: '#fca5a5',
                                }}
                              >
                                <strong>Remarks:</strong> {uploaded.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right — Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                          {/* View button — only if uploaded & has a download URL */}
                          {uploaded?.downloadUrl && (
                            <a
                              href={uploaded.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-primary btn-sm"
                              style={{ textDecoration: 'none' }}
                            >
                              👁️ View
                            </a>
                          )}

                          {/* Upload / Replace button */}
                          <label
                            className={`btn ${uploaded ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            style={{ cursor: 'pointer' }}
                          >
                            <span>
                              {isUploading
                                ? '⏳ Uploading...'
                                : uploaded
                                  ? '🔄 Replace'
                                  : '📤 Upload'}
                            </span>
                            <input
                              type="file"
                              accept={spec.acceptedFormats
                                .map((f) => {
                                  const map: Record<string, string> = {
                                    PDF: '.pdf',
                                    JPG: '.jpg,.jpeg',
                                    PNG: '.png',
                                    WEBP: '.webp',
                                  };
                                  return map[f] || '';
                                })
                                .join(',')}
                              style={{ display: 'none' }}
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadDocument(
                                    group.applicationId,
                                    spec.type,
                                    file,
                                  );
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}