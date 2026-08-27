'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

interface DocumentRecord {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  version: number;
  uploadedAt: string;
  rejectionReason?: string;
  downloadUrl?: string;
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
  documents: DocumentRecord[];
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTION_REQUIRED' | 'VERIFIED'>('ALL');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState<{
    fileName: string;
    url: string;
    docType: string;
    version: number;
  } | null>(null);

  useEffect(() => {
    async function fetchApps() {
      setLoading(true);
      try {
        const res = await apiRequest<ApplicationItem[]>('/api/v1/customer/applications');
        if (res.success && res.data) {
          setApplications(res.data);
          if (res.data.length > 0) {
            setExpandedAppId(res.data[0].id);
          }
        } else {
          setApplications([]);
        }
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const filteredApps = applications.filter((app) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTION_REQUIRED') {
      return (app.documents || []).some((d) => d.status === 'ACTION_REQUIRED');
    }
    if (filter === 'VERIFIED') {
      return app.status === 'VERIFIED';
    }
    if (filter === 'PENDING') {
      return app.status !== 'VERIFIED' && !(app.documents || []).some((d) => d.status === 'ACTION_REQUIRED');
    }
    return true;
  });

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
            <span className="badge badge-info">APPLICATIONS DESK</span>
            <span className="badge badge-success">Single Source of Truth Sync</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', color: '#0f172a', margin: 0 }}>My Applications</h1>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0' }}>
            View application statuses, inspect verified credentials, and respond to administrator remarks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/portal/documents" className="btn btn-secondary">
            📁 Document Center
          </Link>
          <Link href="/portal/new-application" className="btn btn-primary">
            ➕ New Application
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'ALL', label: `All Applications (${applications.length})` },
          {
            key: 'ACTION_REQUIRED',
            label: `⚠️ Action Required (${
              applications.filter((a) => (a.documents || []).some((d) => d.status === 'ACTION_REQUIRED')).length
            })`,
          },
          {
            key: 'PENDING',
            label: `⏱️ In Progress (${
              applications.filter(
                (a) => a.status !== 'VERIFIED' && !(a.documents || []).some((d) => d.status === 'ACTION_REQUIRED'),
              ).length
            })`,
          },
          {
            key: 'VERIFIED',
            label: `✅ Verified (${applications.filter((a) => a.status === 'VERIFIED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: filter === tab.key ? 700 : 500,
              fontSize: '0.875rem',
              background: filter === tab.key ? '#12372A' : '#ffffff',
              color: filter === tab.key ? '#ffffff' : '#64748b',
              boxShadow: filter === tab.key ? '0 2px 6px rgba(18, 55, 42, 0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading your applications and documents...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Applications Found</h3>
          <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {filter === 'ALL'
              ? 'You have not submitted any service applications yet.'
              : 'No applications match the selected filter category.'}
          </p>
          <Link href="/portal/new-application" className="btn btn-primary">
            Start New Application →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredApps.map((app) => {
            const isExpanded = expandedAppId === app.id;
            const appDocs = app.documents || [];
            const verifiedDocs = appDocs.filter((d) => d.status === 'VERIFIED');
            const actionDocs = appDocs.filter((d) => d.status === 'ACTION_REQUIRED');

            return (
              <div
                key={app.id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: actionDocs.length > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0',
                }}
              >
                {/* Application Header Card */}
                <div
                  style={{
                    padding: '1.5rem',
                    background: actionDocs.length > 0 ? '#fffaf0' : '#ffffff',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{app.applicationNumber}</span>
                      {app.status === 'VERIFIED' && <span className="badge badge-success">VERIFIED APPLICATION</span>}
                      {app.status === 'SUBMITTED' && <span className="badge badge-info">SUBMITTED</span>}
                      {app.status === 'PENDING' && <span className="badge badge-warning">IN PROGRESS</span>}
                      {actionDocs.length > 0 && (
                        <span className="badge badge-danger">⚠️ {actionDocs.length} ACTION REQUIRED</span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: '0.5rem 0 0.25rem' }}>
                      {app.title || app.serviceType.replace(/_/g, ' ')}
                    </h2>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Applicant: <strong>{app.fullName || 'Customer'}</strong> • Submitted:{' '}
                      {new Date(app.createdAt).toLocaleDateString()} • {appDocs.length} Documents Attached (
                      {verifiedDocs.length} Verified)
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link
                      href="/portal/documents"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📁 Upload / Replace
                    </Link>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {isExpanded ? '▲ Hide Documents' : '▼ View Documents'}
                    </button>
                  </div>
                </div>

                {/* Expanded Documents Panel */}
                {isExpanded && (
                  <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                        Attached Application Documents ({appDocs.length})
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        🔒 AES-256-GCM Encrypted Cloud Storage
                      </span>
                    </div>

                    {appDocs.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem',
                          background: '#ffffff',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '1px dashed #cbd5e1',
                          color: '#64748b',
                        }}
                      >
                        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
                          No documents have been uploaded for this application yet.
                        </p>
                        <Link href="/portal/documents" className="btn btn-primary btn-sm">
                          Upload Required Documents Now →
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {appDocs.map((doc) => {
                          const docUrl =
                            doc.downloadUrl ||
                            `/api/v1/customer/documents/download-stream?path=${encodeURIComponent(doc.fileName)}`;

                          return (
                            <div
                              key={doc.id}
                              style={{
                                background: '#ffffff',
                                border:
                                  doc.status === 'ACTION_REQUIRED' ? '1px solid #fecaca' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '1rem 1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.75rem',
                              }}
                            >
                              <div style={{ minWidth: '240px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                                    📄 {doc.fileName}
                                  </span>
                                  <span className="badge badge-neutral">v{doc.version}</span>
                                  {doc.status === 'VERIFIED' && (
                                    <span className="badge badge-success">VERIFIED</span>
                                  )}
                                  {doc.status === 'UPLOADED' && (
                                    <span className="badge badge-info">UNDER REVIEW</span>
                                  )}
                                  {doc.status === 'ACTION_REQUIRED' && (
                                    <span className="badge badge-danger">ACTION REQUIRED</span>
                                  )}
                                </div>

                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                  {doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded on{' '}
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </div>

                                {doc.rejectionReason && (
                                  <div
                                    style={{
                                      marginTop: '0.5rem',
                                      padding: '0.5rem 0.75rem',
                                      background: '#fef2f2',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      color: '#991b1b',
                                    }}
                                  >
                                    <strong>Admin Remark:</strong> {doc.rejectionReason}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() =>
                                    setViewingDoc({
                                      fileName: doc.fileName,
                                      url: docUrl,
                                      docType: doc.documentType,
                                      version: doc.version,
                                    })
                                  }
                                >
                                  👁️ View File
                                </button>
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ textDecoration: 'none' }}
                                >
                                  ↗ Open
                                </a>
                                {doc.status === 'ACTION_REQUIRED' && (
                                  <Link href="/portal/documents" className="btn btn-primary btn-sm">
                                    🔄 Replace File
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Document Lightbox / Viewer Modal */}
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
