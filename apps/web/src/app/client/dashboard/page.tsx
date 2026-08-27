'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

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
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    status: string;
    version: number;
  }>;
}

export default function CustomerDashboardPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const res = await apiRequest<ApplicationItem[]>('/api/v1/customer/applications');
        if (res.success && res.data && res.data.length > 0) {
          setApplications(res.data);
        } else {
          setApplications([]);
        }
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

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
            <span className="badge badge-info">CUSTOMER PORTAL</span>
            <span className="badge badge-success">Online & Synced</span>
          </div>
          <h1 style={{ fontSize: '2.25rem' }}>Your Applications & Documents</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Select a service, view document requirements, and track verification statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/client/documents" className="btn btn-secondary">
            📁 Document Center
          </Link>
          <Link href="/client/new-application" className="btn btn-primary">
            ➕ New Application
          </Link>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading your applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Active Applications</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Get started by creating your first service application and uploading the required documents.
          </p>
          <Link href="/client/new-application" className="btn btn-primary">
            Start First Application →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <span className="badge badge-info">{app.applicationNumber}</span>
                <span className="badge badge-success">{app.status}</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {app.title || app.serviceType}
              </h3>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <div>Applicant: <strong>{app.fullName || 'Customer'}</strong></div>
                {app.phone && <div>Phone: {app.phone}</div>}
                <div>Date: {new Date(app.createdAt).toLocaleDateString()}</div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  📄 {app.documents?.length || 0} Documents Uploaded
                </span>

                <Link href="/client/documents" className="btn btn-secondary btn-sm">
                  View Documents →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}