'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="portal-nav">
        <div className="nav-inner">
          <Link href="/client/dashboard" className="nav-brand">
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span>AMMAN COMMUNICATIONS</span>
          </Link>

          <nav className="nav-links">
            <Link
              href="/client/new-application"
              className={`nav-link ${pathname === '/client/new-application' ? 'active' : ''}`}
            >
              ➕ New Application
            </Link>
            <Link
              href="/client/dashboard"
              className={`nav-link ${pathname === '/client/dashboard' ? 'active' : ''}`}
            >
              📋 My Applications
            </Link>
            <Link
              href="/client/documents"
              className={`nav-link ${pathname === '/client/documents' ? 'active' : ''}`}
            >
              📁 Document Center
            </Link>
            <Link
              href="/docs"
              className={`nav-link ${pathname === '/docs' ? 'active' : ''}`}
              style={{ color: '#10b981' }}
            >
              📜 API Docs (Swagger)
            </Link>
          </nav>

          <div className="nav-user">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>Customer Active</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.85rem',
          background: 'rgba(11, 15, 25, 0.95)',
        }}
      >
        <p>
          © 2026 Amman Communications & TechnoVanam Platform. Single Source of Truth Document Sync Architecture.
        </p>
        <p style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>
          All customer documents are client-encrypted (AES-256-GCM) with instant bi-directional synchronization.
        </p>
      </footer>
    </div>
  );
}