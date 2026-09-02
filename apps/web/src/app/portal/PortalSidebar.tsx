'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearCustomerToken, clearAdminToken, apiRequest } from '@/lib/api';

export default function PortalSidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest<{ name?: string; email?: string }>('/api/v1/customer/dashboard/profile');
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    }
    loadProfile();
  }, []);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/portal/dashboard',
      icon: '📊',
      badge: null,
    },
    {
      label: 'My Applications',
      href: '/portal/applications',
      icon: '📋',
      badge: null,
    },
    {
      label: 'New Application',
      href: '/portal/new-application',
      icon: '➕',
      badge: 'Apply',
    },
    {
      label: 'My Documents',
      href: '/portal/documents',
      icon: '📁',
      badge: null,
    },
  ];

  const userInitial = profile?.name ? profile.name.trim().charAt(0).toUpperCase() : 'C';

  return (
    <aside
      style={{
        width: '260px',
        minHeight: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Link
          href="/portal/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#0f172a',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #12372A, #2e8a60)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 2px 6px rgba(18, 55, 42, 0.2)',
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, color: '#0f172a' }}>
              AMMAN COMM
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Customer Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '1.25rem 0.875rem', flex: 1, overflowY: 'auto' }}>
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#94a3b8',
            letterSpacing: '0.05em',
            padding: '0 0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Main Navigation
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/portal/applications' && pathname.startsWith('/portal/applications')) ||
              (item.href === '/portal/documents' && pathname.startsWith('/portal/documents')) ||
              (item.href === '/portal/new-application' && pathname.startsWith('/portal/new-application'));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.875rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#12372A' : '#475569',
                  background: isActive ? '#eef7f2' : 'transparent',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid #d8ebdd' : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: '#16a34a',
                      color: '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Workspace info & shortcut */}
        <div style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            Quick Links
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Link
              href="/admin/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <span>🛡️</span>
              <span>Admin Console</span>
            </Link>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: 500,
              }}
            >
              <span>🌐</span>
              <span>Public Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer / User Profile & Security Pill */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            padding: '0.35rem 0.6rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#166534',
            fontWeight: 600,
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
          <span>AES-256 Single Source Sync</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#12372A',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px',
                }}
                title={profile?.name || 'Customer Account'}
              >
                {profile?.name || 'Customer'}
              </div>
              <div
                style={{
                  fontSize: '0.725rem',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px',
                }}
                title={profile?.email || 'Active Session'}
              >
                {profile?.email || 'Active Session'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              clearCustomerToken();
              clearAdminToken();
              window.location.href = '/login';
            }}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#fef2f2',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              flexShrink: 0,
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
