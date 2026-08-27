import React from 'react';
import PortalSidebar from './PortalSidebar';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <PortalSidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}