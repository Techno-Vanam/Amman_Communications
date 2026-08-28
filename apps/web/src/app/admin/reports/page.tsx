'use client';

import { BarChart3, Clock } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and view system reports and analytics.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center justify-center p-16 min-h-[400px]">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Reports Module</h2>
        <p className="text-gray-500 text-center max-w-md">
          The comprehensive reporting module is currently under development. Stay tuned for advanced analytics and data exports!
        </p>
      </div>
    </div>
  );
}
