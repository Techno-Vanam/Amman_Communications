'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="portal-nav" style={{ borderBottomColor: '#e2e8f0' }}>
        <div className="nav-inner">
          <Link href="/admin/dashboard" className="nav-brand">
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>AMMAN ADMIN CONSOLE</span>
          </Link>

          <nav className="nav-links">
            <Link href="/admin/dashboard" className="nav-link active">
              📑 Verification Desk
            </Link>
            <Link href="/admin/services" className="nav-link">
              📦 Services
            </Link>
            <Link href="/admin/customers" className="nav-link">
              👥 Customers
            </Link>
            <Link href="/portal/dashboard" className="nav-link" style={{ color: '#12372A', fontWeight: 600 }}>
              👤 Customer Portal
            </Link>
          </nav>

          <div className="nav-user">
            <span className="badge badge-warning">Admin Authorized</span>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}