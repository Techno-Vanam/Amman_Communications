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
    rejectionReason?: string;
  }>;
}

export default function PortalDashboardPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [summary, setSummary] = useState({
    applications: 0,
    verifiedDocs: 0,
    pendingDocs: 0,
    actionRequiredDocs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [appsRes, profRes, summaryRes] = await Promise.all([
          apiRequest<ApplicationItem[]>('/api/v1/customer/applications'),
          apiRequest<{ name?: string; email?: string }>('/api/v1/customer/dashboard/profile'),
          apiRequest<any>('/api/v1/customer/dashboard/summary'),
        ]);

        if (appsRes.success && appsRes.data) {
          setApplications(appsRes.data);
        } else {
          setApplications([]);
        }

        if (profRes.success && profRes.data) {
          setProfile(profRes.data);
        }

        if (summaryRes.success && summaryRes.data) {
          setSummary({
            applications: summaryRes.data.applications || appsRes.data?.length || 0,
            verifiedDocs: summaryRes.data.verifiedDocs || 0,
            pendingDocs: summaryRes.data.pendingDocs || 0,
            actionRequiredDocs: summaryRes.data.actionRequiredDocs || 0
          });
        }
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const { applications: totalApps, verifiedDocs, pendingDocs, actionRequiredDocs } = summary;

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-info">CUSTOMER DASHBOARD</span>
            <span className="badge badge-success">Live Synchronized</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', color: '#0f172a', margin: 0 }}>
            {profile?.name ? `Welcome back, ${profile.name}` : 'Welcome to Amman Communications'}
          </h1>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0' }}>
            {profile?.email ? `Signed in as ${profile.email} • ` : ''}Track application progress, upload encrypted identity credentials, and inspect verification remarks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/customer/documents" className="btn btn-secondary">
            📁 Document Center
          </Link>
          <Link href="/customer/new-application" className="btn btn-primary">
            ➕ New Application
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TOTAL APPLICATIONS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#0f172a' }}>
            {totalApps}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Active submissions</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>VERIFIED DOCUMENTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#16a34a' }}>
            {verifiedDocs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Approved by admin</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>UNDER REVIEW</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#2563eb' }}>
            {pendingDocs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Pending admin check</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>ACTION REQUIRED</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#dc2626' }}>
            {actionRequiredDocs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Needs re-upload</div>
        </div>
      </div>

      {/* Hero Apply Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #12372A 0%, #1a4d3a 100%)',
          color: '#ffffff',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            FAST TRACK PROCESSING
          </span>
          <h2 style={{ fontSize: '1.75rem', color: '#ffffff', margin: '0.75rem 0 0.5rem' }}>
            Ready to apply for a new citizen service?
          </h2>
          <p style={{ color: '#d8ebdd', margin: 0, maxWidth: '560px', fontSize: '0.95rem' }}>
            Choose from PAN Card, Passport Application, Aadhaar Updates, Driving License, and more. Upload encrypted documents in under 2 minutes.
          </p>
        </div>

        <Link
          href="/customer/new-application"
          className="btn"
          style={{
            background: '#ffffff',
            color: '#12372A',
            fontWeight: 800,
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          🚀 Start New Application →
        </Link>
      </div>

      {/* Applications List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>Recent Applications</h2>
          <Link href="/customer/applications" style={{ color: '#12372A', fontWeight: 600, fontSize: '0.9rem' }}>
            View All Applications →
          </Link>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            ⏳ Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Applications Yet</h3>
            <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              You haven&apos;t created any service applications yet. Start a new application to begin your verification.
            </p>
            <Link href="/customer/new-application" className="btn btn-primary">
              Create First Application
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => {
              const appDocs = app.documents || [];
              const verifiedCount = appDocs.filter((d) => d.status === 'VERIFIED').length;
              const hasActionRequired = appDocs.some((d) => d.status === 'ACTION_REQUIRED');

              return (
                <div
                  key={app.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-info">{app.applicationNumber}</span>
                        {app.status === 'VERIFIED' && <span className="badge badge-success">VERIFIED</span>}
                        {app.status === 'SUBMITTED' && <span className="badge badge-info">SUBMITTED</span>}
                        {app.status === 'PENDING' && <span className="badge badge-warning">PENDING</span>}
                        {hasActionRequired && <span className="badge badge-danger">ACTION REQUIRED</span>}
                      </div>
                      <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.15rem', color: '#0f172a' }}>
                        {app.title || app.serviceType.replace(/_/g, ' ')}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                        Submitted on {new Date(app.createdAt).toLocaleDateString()} • {appDocs.length} Documents Attached ({verifiedCount} Verified)
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href="/customer/documents" className="btn btn-secondary btn-sm">
                        📁 Manage Documents
                      </Link>
                      <Link href="/customer/applications" className="btn btn-primary btn-sm">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}