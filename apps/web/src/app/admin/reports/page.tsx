'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BarChart2,
  DollarSign,
  Download,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { fetchReportsDataAction } from './actions';

// ── Custom Tooltips ───────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3 text-xs">
      <p className="font-extrabold text-gray-900 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} className={`font-bold ${p.name === 'revenue' ? 'text-[#12372A]' : 'text-rose-600'}`}>
          {p.name === 'revenue' ? 'Revenue' : 'Expenses'}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#12372A] text-white text-xs px-3 py-2 rounded-xl shadow-lg font-semibold">
      <p>{payload[0].name}</p>
      <p className="text-[#a8d5b9] mt-0.5">{payload[0].value}%</p>
    </div>
  );
}

// ── KPI Card Component ────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${accent}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs font-bold text-gray-600 mt-0.5">{label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

type Period = 'monthly' | 'quarterly' | 'yearly';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');

  const [revenueMonthly, setRevenueMonthly] = useState<{ month: string; revenue: number; expenses: number }[]>([
    { month: 'Jan', revenue: 0, expenses: 0 },
    { month: 'Feb', revenue: 0, expenses: 0 },
    { month: 'Mar', revenue: 0, expenses: 0 },
    { month: 'Apr', revenue: 0, expenses: 0 },
    { month: 'May', revenue: 0, expenses: 0 },
    { month: 'Jun', revenue: 0, expenses: 0 },
    { month: 'Jul', revenue: 0, expenses: 0 },
    { month: 'Aug', revenue: 0, expenses: 0 },
  ]);

  const [applicationStatus, setApplicationStatus] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topServices, setTopServices] = useState<{ name: string; applications: number; revenue: number }[]>([]);
  const [appointmentsTrend, setAppointmentsTrend] = useState<{ week: string; confirmed: number; pending: number; cancelled: number }[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadReportsData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await fetchReportsDataAction();
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.success && res.data) {
      if (res.data.revenueMonthly?.length) setRevenueMonthly(res.data.revenueMonthly);
      if (res.data.applicationStatus) setApplicationStatus(res.data.applicationStatus);
      if (res.data.topServices) setTopServices(res.data.topServices);
      if (res.data.appointmentsTrend) setAppointmentsTrend(res.data.appointmentsTrend);
      if (res.data.expenseBreakdown) setExpenseBreakdown(res.data.expenseBreakdown);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const totalRevenue = revenueMonthly.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = revenueMonthly.reduce((s, r) => s + r.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const fmtAmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  function exportReport(p: string) {
    const csv = [
      ['Period', 'Revenue', 'Expenses', 'Net Profit'],
      ...revenueMonthly.map(r => [r.month, r.revenue, r.expenses, r.revenue - r.expenses]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `report_${p}_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" suppressHydrationWarning>

      {/* ── Page Header ── */}
      <div className="flex justify-end gap-3">
        {/* Period toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          {(['monthly', 'quarterly', 'yearly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all capitalize ${period === p ? 'bg-[#12372A] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => exportReport(period)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition-all"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Export
        </button>
      </div>

      {/* ── KPI Summary Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmtAmt(totalRevenue)} sub="Current Period"
          icon={<TrendingUp className="w-5 h-5 text-[#12372A]" />} accent="bg-[#f0f7f2] border-[#a8d5b9]/50" />
        <KpiCard label="Total Expenses" value={fmtAmt(totalExpenses)} sub="Current Period"
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />} accent="bg-rose-50 border-rose-200" />
        <KpiCard label="Net Profit" value={fmtAmt(netProfit)} sub={`${profitMargin}% margin`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50 border-emerald-200" />
        <KpiCard label="Active Customers" value="0" sub="Registered accounts"
          icon={<Users className="w-5 h-5 text-blue-600" />} accent="bg-blue-50 border-blue-200" />
      </div>

      {/* ── Revenue vs Expenses Chart ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#12372A]" />
              Revenue vs Expenses
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Live performance tracking</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#12372A] inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />Expenses</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueMonthly} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#12372A" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#12372A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#12372A" strokeWidth={2.5} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Two-column breakdown cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Application Status Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Application Pipeline Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribution of client requests</p>
          </div>
          {applicationStatus.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400">No application pipeline data yet</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={applicationStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {applicationStatus.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Expense Category Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribution by operational categories</p>
          </div>
          {expenseBreakdown.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400">No expense records logged yet</p>
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`exp-cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
