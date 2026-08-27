'use client';

import React from 'react';
import Link from 'next/link';
import { SERVICES_CATALOG } from '@repo/shared-types';

export default function PlatformLandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header className="portal-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span>AMMAN COMMUNICATIONS</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/client/dashboard" className="btn btn-secondary btn-sm">
              Customer Portal
            </Link>
            <Link href="/client/new-application" className="btn btn-primary btn-sm">
              ➕ Start Application
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-info">AMMAN PLATFORM 2026</span>
          <span className="badge badge-success">🔒 AES-256 Client Encryption</span>
          <span className="badge badge-warning">⚡ Real-time Single Source of Truth</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Unified Application & Document <br />
          <span style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Synchronization Center
          </span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          Select your required government, travel, corporate, or verification service. Submit basic applicant details and upload tailored documents with instant bi-directional synchronization.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/client/new-application" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1.1rem' }}>
            ➕ Start New Service Application
          </Link>
          <Link href="/client/documents" className="btn btn-secondary" style={{ padding: '0.875rem 1.75rem', fontSize: '1.1rem' }}>
            📁 Open Document Upload Center
          </Link>
          <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.875rem 1.75rem', fontSize: '1.1rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            🛡️ Admin Verification Desk
          </Link>
        </div>
      </section>

      {/* Available Services Section */}
      <section className="app-container" style={{ paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>DYNAMIC REQUIREMENTS</span>
          <h2 style={{ fontSize: '2rem' }}>Services & Required Document Checklist</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Each service dynamically configures the exact documents needed, accepted file types, and size boundaries.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {SERVICES_CATALOG.map((svc) => (
            <div key={svc.id} className="card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{svc.icon}</div>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                {svc.category}
              </span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{svc.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {svc.tagline}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  REQUIRED DOCUMENTS:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {svc.requiredDocuments.map((doc) => (
                    <li key={doc.type} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: doc.required ? 'var(--primary)' : 'var(--text-dim)' }}>
                        {doc.required ? '•' : '○'}
                      </span>
                      <span>{doc.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <Link href="/client/new-application" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  Apply for this Service →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
