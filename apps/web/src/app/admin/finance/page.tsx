import React from 'react';
import FinanceClient, { FinanceRecord } from './FinanceClient';
import { fetchInvoicesAction } from './actions';
import { Wallet } from 'lucide-react';

export default async function FinancePage() {
  const res = await fetchInvoicesAction();

  let initialRecords: FinanceRecord[] = [];
  let errorMsg: string | null = null;

  if (res.error) {
    errorMsg = res.error;
  } else if (res.success && res.data) {
    initialRecords = res.data as FinanceRecord[];
  }

  if (errorMsg) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-3 rounded-2xl">
          ⚠ {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <FinanceClient initialRecords={initialRecords} />
  );
}
