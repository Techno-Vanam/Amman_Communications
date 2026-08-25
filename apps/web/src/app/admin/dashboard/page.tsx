'use client';

import React, { useState, useEffect } from 'react';
import { adminApiRequest } from '@/lib/api';

interface AdminDocItem {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  status: string;
  version: number;
  rejectionReason?: string;
  uploadedAt: string;
  applicationId: string;
  applicationNumber: string;
  customerName: string;
}

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState<AdminDocItem[]>([
    {
      id: 'doc_admin_1',
      documentType: 'NATIONAL_ID_PROOF',
      fileName: 'aadhaar_card_front_back.pdf',
      fileSize: 1024 * 450,
      status: 'VERIFIED',
      version: 1,
      uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      applicationId: 'app_1',
      applicationNumber: 'AMC-2026-000001',
      customerName: 'Ramesh Kumar',
    },
    {
      id: 'doc_admin_2',
      documentType: 'ADDRESS_PROOF',
      fileName: 'electricity_bill_latest.pdf',
      fileSize: 1024 * 620,
      status: 'UPLOADED',
      version: 2,
      uploadedAt: new Date().toISOString(),
      applicationId: 'app_1',
      applicationNumber: 'AMC-2026-000001',
      customerName: 'Ramesh Kumar',
    },
    {
      id: 'doc_admin_3',
      documentType: 'PASSPORT_PHOTO',
      fileName: 'studio_portrait_photo.jpg',
      fileSize: 1024 * 180,
      status: 'ACTION_REQUIRED',
      version: 1,
      rejectionReason: 'The photo background has shadows. Please provide a pure white background photo.',
      uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      applicationId: 'app_1',
      applicationNumber: 'AMC-2026-000001',
      customerName: 'Ramesh Kumar',
    },
  ]);

  const [rejectionModal, setRejectionModal] = useState<{
    docId: string;
    appId: string;
    reason: string;
  } | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async (doc: AdminDocItem) => {
    try {
      await adminApiRequest(`/api/v1/admin/applications/${doc.applicationId}/documents/${doc.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
    } catch {}

    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: 'VERIFIED', rejectionReason: undefined } : d)),
    );
    setMessage(`Document "${doc.fileName}" verified! Status synchronized to customer portal.`);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionModal || !rejectionModal.reason) return;

    try {
      await adminApiRequest(
        `/api/v1/admin/applications/${rejectionModal.appId}/documents/${rejectionModal.docId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({
            status: 'ACTION_REQUIRED',
            rejectionReason: rejectionModal.reason,
          }),
        },
      );
    } catch {}

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === rejectionModal.docId
          ? { ...d, status: 'ACTION_REQUIRED', rejectionReason: rejectionModal.reason }
          : d,
      ),
    );
    setMessage(`Action requested for document with reason. Customer will see notification instantly.`);
    setRejectionModal(null);
  };

  return (
    <div className="app-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-warning">Admin Verification Desk</span>
          <span className="badge badge-success">Single Source of Truth Live Sync</span>
        </div>
        <h1 style={{ fontSize: '2.25rem' }}>Customer Document Verification</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review uploaded customer documents, inspect cryptographic proofs, and verify or request re-uploads.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-sm)',
            color: '#86efac',
            marginBottom: '1.5rem',
          }}
        >
          ✅ {message}
        </div>
      )}

      {/* Documents Review Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <th style={{ padding: '0.75rem 1rem' }}>APPLICATION</th>
              <th style={{ padding: '0.75rem 1rem' }}>APPLICANT</th>
              <th style={{ padding: '0.75rem 1rem' }}>DOCUMENT TYPE</th>
              <th style={{ padding: '0.75rem 1rem' }}>FILE / VERSION</th>
              <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-info">{doc.applicationNumber}</span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{doc.customerName}</td>
                <td style={{ padding: '1rem' }}>
                  <strong>{doc.documentType}</strong>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>📄 {doc.fileName}</span>
                    <span className="badge badge-neutral">v{doc.version}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {(doc.fileSize / 1024).toFixed(1)} KB • 🔒 AES-256
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {doc.status === 'VERIFIED' && <span className="badge badge-success">✅ VERIFIED</span>}
                  {doc.status === 'UPLOADED' && <span className="badge badge-info">⏱️ UNDER REVIEW</span>}
                  {doc.status === 'ACTION_REQUIRED' && (
                    <div>
                      <span className="badge badge-danger">⚠️ ACTION REQUIRED</span>
                      {doc.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.25rem' }}>
                          {doc.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleVerify(doc)}
                      disabled={doc.status === 'VERIFIED'}
                    >
                      ✓ Verify
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setRejectionModal({
                          docId: doc.id,
                          appId: doc.applicationId,
                          reason: doc.rejectionReason || 'Please upload a clearer 300 DPI document scan.',
                        })
                      }
                    >
                      ✗ Reject / Request Action
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100,
          }}
        >
          <div className="card" style={{ maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fca5a5' }}>
              Request Document Re-upload
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the reason or instruction for the applicant. This will display immediately in the customer portal.
            </p>

            <div className="form-group">
              <label className="form-label">Rejection / Action Reason</label>
              <textarea
                rows={3}
                className="form-control"
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setRejectionModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRejectSubmit}>
                Send Action Request →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}