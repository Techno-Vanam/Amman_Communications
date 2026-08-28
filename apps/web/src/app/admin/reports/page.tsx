'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  Download,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

// ── Data ──────────────────────────────────────────────────────

const REVENUE_MONTHLY = [
  { month: 'Jan', revenue: 124500, expenses: 48000 },
  { month: 'Feb', revenue: 138000, expenses: 52000 },
  { month: 'Mar', revenue: 162000, expenses: 60000 },
  { month: 'Apr', revenue: 147000, expenses: 55000 },
  { month: 'May', revenue: 178000, expenses: 63000 },
  { month: 'Jun', revenue: 195000, expenses: 68000 },
  { month: 'Jul', revenue: 184000, expenses: 70000 },
  { month: 'Aug', revenue: 221400, expenses: 94200 },
];

const APPLICATION_STATUS = [
  { name: 'Completed',          value: 48, color: '#10b981' },
  { name: 'Under Verification', value: 18, color: '#f59e0b' },
  { name: 'Approved',           value: 12, color: '#12372A' },
  { name: 'Pending Payment',    value: 10, color: '#f97316' },
  { name: 'Rejected',           value: 7,  color: '#f43f5e' },
  { name: 'Submitted',          value: 5,  color: '#6366f1' },
];

const TOP_SERVICES = [
  { name: 'Commercial Fiber',    applications: 34, revenue: 163200 },
  { name: 'Dedicated Leased',    applications: 22, revenue: 158400 },
  { name: 'Enterprise VoIP',     applications: 18, revenue: 171000 },
  { name: 'Network Security',    applications: 15, revenue:  54000 },
  { name: 'Cloud Backup',        applications: 12, revenue:  24000 },
];

const APPOINTMENTS_TREND = [
  { week: 'Wk 1', confirmed: 12, pending: 5, cancelled: 2 },
  { week: 'Wk 2', confirmed: 18, pending: 7, cancelled: 1 },
  { week: 'Wk 3', confirmed: 14, pending: 9, cancelled: 3 },
  { week: 'Wk 4', confirmed: 22, pending: 4, cancelled: 1 },
];

const EXPENSE_BREAKDOWN = [
  { name: 'Salaries',       value: 82000, color: '#6366f1' },
  { name: 'Infrastructure', value: 63500, color: '#12372A' },
  { name: 'Marketing',      value: 20100, color: '#f59e0b' },
  { name: 'Equipment',      value: 23000, color: '#3b82f6' },
  { name: 'Utilities',      value: 8400,  color: '#10b981' },
  { name: 'Others',         value: 16200, color: '#9ca3af' },
];

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

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3 text-xs">
      <p className="font-extrabold text-gray-900 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-bold text-gray-700">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ label, value, sub, change, up, icon, accent }: {
  label: string; value: string; sub: string; change: string; up: boolean;
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 hover:shadow-md transition-shadow ${accent}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">{icon}</div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs font-bold text-gray-600 mt-0.5">{label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ── Export helpers ────────────────────────────────────────────
function exportReport(period: string) {
  const csv = [
    ['Period', 'Revenue', 'Expenses', 'Net Profit'],
    ...REVENUE_MONTHLY.map(r => [r.month, r.revenue, r.expenses, r.revenue - r.expenses]),
  ].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `report_${period}_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ─────────────────────────────────────────────────
type Period = 'monthly' | 'quarterly' | 'yearly';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');

  const totalRevenue  = REVENUE_MONTHLY.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = REVENUE_MONTHLY.reduce((s, r) => s + r.expenses, 0);
  const netProfit     = totalRevenue - totalExpenses;
  const profitMargin  = Math.round((netProfit / totalRevenue) * 100);

  const fmtAmt = (n: number) => `₹${(n / 1000).toFixed(1)}k`;

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
        <KpiCard label="Total Revenue" value={fmtAmt(totalRevenue)} sub="Aug 2026 YTD" change="+14.2%" up={true}
          icon={<TrendingUp className="w-5 h-5 text-[#12372A]" />} accent="bg-[#f0f7f2] border-[#a8d5b9]/50" />
        <KpiCard label="Total Expenses" value={fmtAmt(totalExpenses)} sub="Aug 2026 YTD" change="+8.7%" up={false}
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />} accent="bg-rose-50 border-rose-200" />
        <KpiCard label="Net Profit" value={fmtAmt(netProfit)} sub={`${profitMargin}% margin`} change="+18.3%" up={true}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />} accent="bg-emerald-50 border-emerald-200" />
        <KpiCard label="Active Customers" value="1,248" sub="+32 this month" change="+2.6%" up={true}
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
            <p className="text-xs text-gray-400 mt-0.5">Monthly comparison for 2026</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#12372A] inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />Expenses</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_MONTHLY} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#12372A" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#12372A', r: 3 }} />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" dot={{ fill: '#f43f5e', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Application Status Pie + Service Performance Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Application Status Pie */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#12372A]" />
              Application Status
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribution of 89 total applications</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={APPLICATION_STATUS} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                  paddingAngle={3} dataKey="value">
                  {APPLICATION_STATUS.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {APPLICATION_STATUS.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-[10px] text-gray-600 font-medium flex-1 truncate">{s.name}</span>
                <span className="text-[10px] font-extrabold text-gray-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services Performance */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#12372A]" />
              Top Services by Applications
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Revenue generated per service</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_SERVICES} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="applications" name="Applications" fill="#12372A" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 3: Appointments Trend + Expense Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Appointments Trend */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#12372A]" />
                Appointments Trend
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Weekly breakdown — Aug 2026</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Confirmed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Pending</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />Cancelled</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={APPOINTMENTS_TREND} barSize={16} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending"   name="Pending"   stackId="a" fill="#f59e0b" />
                <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Expense Breakdown
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">By category — Aug 2026</p>
          </div>
          <div className="space-y-2.5">
            {EXPENSE_BREAKDOWN.map(e => {
              const pct = Math.round((e.value / totalExpenses) * 100);
              return (
                <div key={e.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                      <span className="text-[11px] font-semibold text-gray-700">{e.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-gray-900">₹{e.value.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400 w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: e.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 4: Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Applications This Month', value: '12', icon: <FileText className="w-4 h-4 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-700' },
          { label: 'Avg. Processing Time', value: '8 days', icon: <Clock className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50 border-amber-100', color: 'text-amber-700' },
          { label: 'Completed Services', value: '48', icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-700' },
          { label: 'Pending Payments', value: '₹1.06L', icon: <XCircle className="w-4 h-4 text-rose-600" />, bg: 'bg-rose-50 border-rose-100', color: 'text-rose-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center mb-3">{s.icon}</div>
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
