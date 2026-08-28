'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';
import { type ServiceDefinition, type RequiredDocumentSpec } from '@repo/shared-types';

const DEFAULT_SERVICES: ServiceDefinition[] = [
  {
    id: 'svc_commercial_fiber',
    code: 'svc_commercial_fiber',
    title: 'Commercial Fiber Broadband',
    category: 'Corporate Broadband',
    tagline: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
    description: 'High-speed dedicated fiber optic connectivity for corporate & business premises.',
    estimatedProcessingDays: '3-5 Business Days',
    governmentFee: 250,
    serviceFee: 750,
    totalFee: 1000,
    icon: '🏢',
    requiredDocuments: [
      {
        type: 'COMMERCIAL_REGISTRATION_CERTIFICATE',
        name: 'Commercial Registration Certificate',
        description: 'Commercial Registration Certificate scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'AUTHORIZED_SIGNATORY_NATIONAL_ID',
        name: 'Authorized Signatory National ID',
        description: 'Authorized Signatory National ID scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'LEASE_AGREEMENT_PROOF_OF_ADDRESS',
        name: 'Lease Agreement / Proof of Address',
        description: 'Lease Agreement or Proof of Address scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
    ],
  },
  {
    id: 'svc_residential_broadband',
    code: 'svc_residential_broadband',
    title: 'Residential Broadband Setup',
    category: 'Home Internet',
    tagline: 'High-speed home internet connection with included Wi-Fi router setup.',
    description: 'High-speed home internet connection with included Wi-Fi router setup.',
    estimatedProcessingDays: '1-2 Business Days',
    governmentFee: 100,
    serviceFee: 300,
    totalFee: 400,
    icon: '📡',
    requiredDocuments: [
      {
        type: 'NATIONAL_IDENTIFICATION_PASSPORT',
        name: 'National Identification / Passport',
        description: 'National Identification / Passport scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'UTILITY_BILL_ELECTRICITY_WATER',
        name: 'Utility Bill (Electricity/Water)',
        description: 'Utility Bill (Electricity/Water) scan (PDF/Image max 10MB)',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
    ],
  },
];

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

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState<{
    fileName: string;
    url: string;
    docType: string;
    version: number;
  } | null>(null);

  const [catalog, setCatalog] = useState<ServiceDefinition[]>(DEFAULT_SERVICES);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const [res, catRes] = await Promise.all([
        apiRequest<ApplicationGroup[]>('/api/v1/customer/documents'),
        apiRequest<ServiceDefinition[]>('/api/v1/customer/services-catalog'),
      ]);

      if (catRes.success && catRes.data && catRes.data.length > 0) {
        setCatalog(catRes.data);
      }

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
      return;
    }

    const slotKey = `${applicationId}:${documentType}`;
    setUploadingSlot(slotKey);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

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
    }
  };

  const totalDocuments = groups.reduce((acc, g) => acc + (g.documents?.length || 0), 0);
  const totalRequired = groups.reduce((acc, g) => {
    const spec = getServiceSpec(g.serviceType);
    return acc + (spec?.requiredDocuments?.filter((d: RequiredDocumentSpec) => d.required).length || 0);
  }, 0);

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
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
            <span className="badge badge-info">DOCUMENT VAULT</span>
            <span className="badge badge-success">AES-256 Cloud Encrypted</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', color: '#0f172a', margin: 0 }}>Document Upload & Management Center</h1>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0' }}>
            Single source of truth repository. Upload, replace, view, and manage documents across all your service applications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/portal/applications" className="btn btn-secondary">
            📋 My Applications
          </Link>
          <Link href="/portal/new-application" className="btn btn-primary">
            ➕ New Application
          </Link>
        </div>
      </div>

      {/* Alert banner */}
      {message && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '8px',
            color: message.type === 'success' ? '#15803d' : '#b91c1c',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 500,
          }}
        >
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TOTAL APPLICATIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#0f172a' }}>
            {groups.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>DOCUMENTS UPLOADED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#12372A' }}>
            {totalDocuments} / {totalRequired}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>ENCRYPTION STANDARD</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#16a34a' }}>
            AES-256 GCM
          </div>
        </div>
      </div>

      {/* Application Document Groups */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading encrypted document repository...
        </div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>
            No Documents Uploaded Yet
          </h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', color: '#64748b' }}>
            Create a service application first. Your required documents will appear here for upload and management.
          </p>
          <Link href="/portal/new-application" className="btn btn-primary">
            Create Application & Upload Documents
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groups.map((group) => {
            const serviceSpec = getServiceSpec(group.serviceType);
            const requiredDocs: RequiredDocumentSpec[] = serviceSpec?.requiredDocuments || [];
            const uploadedMap = new Map(
              (group.documents || []).map((doc) => [doc.documentType, doc]),
            );

            const uploadedCount = (group.documents || []).length;
            const requiredCount = requiredDocs.filter((d: RequiredDocumentSpec) => d.required).length;
            const allRequiredUploaded = requiredDocs
              .filter((d: RequiredDocumentSpec) => d.required)
              .every((d: RequiredDocumentSpec) => uploadedMap.has(d.type));

            return (
              <div
                key={group.applicationId}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: allRequiredUploaded ? '1px solid #d8ebdd' : '1px solid #e2e8f0',
                }}
              >
                {/* Group Header */}
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{group.applicationNumber}</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        {serviceSpec?.category || 'Service'}
                      </span>
                      {allRequiredUploaded ? (
                        <span className="badge badge-success">All Required Uploaded</span>
                      ) : (
                        <span className="badge badge-warning">
                          {requiredCount - uploadedCount} Missing Required
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.2rem', color: '#0f172a' }}>
                      {serviceSpec?.title || group.title || group.serviceType}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link
                      href="/portal/applications"
                      className="btn btn-secondary btn-sm"
                    >
                      View Application Details →
                    </Link>
                  </div>
                </div>

                {/* Documents Slot List */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requiredDocs.map((spec: RequiredDocumentSpec) => {
                    const uploaded = uploadedMap.get(spec.type);
                    const slotKey = `${group.applicationId}:${spec.type}`;
                    const isUploading = uploadingSlot === slotKey;
                    const docUrl =
                      uploaded?.downloadUrl ||
                      `/api/v1/customer/documents/download-stream?path=${encodeURIComponent(uploaded?.fileName || '')}`;

                    return (
                      <div
                        key={spec.type}
                        style={{
                          border: uploaded
                            ? uploaded.status === 'ACTION_REQUIRED'
                              ? '1px solid #fecaca'
                              : '1px solid #d8ebdd'
                            : '1px dashed #cbd5e1',
                          borderRadius: '8px',
                          padding: '1.25rem',
                          background: uploaded
                            ? uploaded.status === 'ACTION_REQUIRED'
                              ? '#fef2f2'
                              : '#ffffff'
                            : '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        {/* Left Info */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: '1 1 300px' }}>
                          <span style={{ fontSize: '1.5rem', marginTop: '0.1rem' }}>
                            {uploaded ? (uploaded.status === 'ACTION_REQUIRED' ? '⚠️' : '📄') : '📥'}
                          </span>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                                {spec.name}
                              </span>
                              {spec.required ? (
                                <span className="badge badge-danger">REQUIRED</span>
                              ) : (
                                <span className="badge badge-neutral">OPTIONAL</span>
                              )}
                            </div>

                            {uploaded ? (
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                <strong style={{ color: '#0f172a' }}>{uploaded.fileName}</strong> • v{uploaded.version} •{' '}
                                {(uploaded.fileSize / 1024).toFixed(1)} KB •{' '}
                                {new Date(uploaded.uploadedAt).toLocaleDateString()} • 🔒 Encrypted
                                {uploaded.status === 'VERIFIED' && (
                                  <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>
                                    ✅ Verified
                                  </span>
                                )}
                                {uploaded.status === 'UPLOADED' && (
                                  <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>
                                    ⏱️ Under Review
                                  </span>
                                )}
                                {uploaded.status === 'ACTION_REQUIRED' && (
                                  <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>
                                    ⚠️ Action Required
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                {spec.description}
                                <br />
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                  Formats: {spec.acceptedFormats.join(', ')} • Max: {spec.maxSizeMb}MB
                                </span>
                              </div>
                            )}

                            {/* Rejection Remark */}
                            {uploaded?.rejectionReason && (
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  padding: '0.5rem 0.75rem',
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  color: '#991b1b',
                                }}
                              >
                                <strong>Remarks:</strong> {uploaded.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {uploaded && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                setViewingDoc({
                                  fileName: uploaded.fileName,
                                  url: docUrl,
                                  docType: uploaded.documentType,
                                  version: uploaded.version,
                                })
                              }
                            >
                              👁️ View
                            </button>
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
                              style={{ display: 'none' }}
                              disabled={isUploading}
                              accept={spec.acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',')}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadOrReplace(group.applicationId, spec.type, file);
                                }
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

      {/* Interactive Document Viewer Modal */}
      {viewingDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 150,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                  📄 {viewingDoc.fileName}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {viewingDoc.docType} • Version {viewingDoc.version}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={viewingDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  ↗ Open in New Tab
                </a>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setViewingDoc(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '1.5rem',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
              }}
            >
              {viewingDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewingDoc.url}
                  title={viewingDoc.fileName}
                  style={{ width: '100%', height: '500px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.fileName}
                  style={{
                    maxHeight: '480px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                  }}
                />
              )}
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button className="btn btn-secondary" onClick={() => setViewingDoc(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
