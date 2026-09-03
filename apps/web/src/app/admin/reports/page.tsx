import React, { Suspense } from 'react';
import { ReportsClient } from '@/components/admin/reports/ReportsClient';

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          Loading Reports...
        </div>
      }
    >
      <ReportsClient />
    </Suspense>
  );
}
