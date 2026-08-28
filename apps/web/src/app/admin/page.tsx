'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ShieldAlert,
  FileText,
  CreditCard,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface RecentItem {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: string;
  mode?: string;
}

// ── Status badge helper ───────────────────────────────────────
function AppStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: 'bg-emerald-100 text-emerald-800',
    'Under Verification': 'bg-amber-100 text-amber-800',
    'Documents Received': 'bg-blue-100 text-blue-800',
    'Pending Payment': 'bg-rose-100 text-rose-800',
    Confirmed: 'bg-emerald-100 text-emerald-800',
    Pending: 'bg-amber-100 text-amber-800',
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${map[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {status}
    </span>
  );
}

// ── Custom Pie Tooltip ────────────────────────────────────────
function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12372A] text-white text-xs px-3 py-2 rounded-xl shadow-lg font-semibold">
        <p>{payload[0].name}</p>
        <p className="text-[#a8d5b9] mt-0.5">{payload[0].value}% of revenue</p>
      </div>
    );
  }
  return null;
}

// ── Custom Bar Tooltip ────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#12372A] text-white text-xs px-3 py-2 rounded-xl shadow-lg font-semibold">
        <p className="text-[#a8d5b9]">{label}</p>
        <p>₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboardPage() {
  const [revenueFilter, setRevenueFilter] = useState<'yearly' | 'monthly' | 'weekly'>('monthly');
  const [stats, setStats] = useState({
    totalClients: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0,
    totalAppointments: 0,
    pendingVerifications: 0,
    totalApplications: 0,
    pendingPayment: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState<RecentItem[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentItem[]>([]);
  const [servicesPieData, setServicesPieData] = useState<{ name: string; value: number; color: string }[]>([]);

  const revenueData = {
    yearly: [
      { label: '2024', value: 0 },
      { label: '2025', value: 0 },
      { label: '2026', value: stats.totalIncome },
    ],
    monthly: [
      { label: 'Jan', value: 0 },
      { label: 'Feb', value: 0 },
      { label: 'Mar', value: 0 },
      { label: 'Apr', value: 0 },
      { label: 'May', value: 0 },
      { label: 'Jun', value: 0 },
      { label: 'Jul', value: 0 },
      { label: 'Aug', value: stats.totalIncome },
    ],
    weekly: [
      { label: 'Mon', value: 0 },
      { label: 'Tue', value: 0 },
      { label: 'Wed', value: 0 },
      { label: 'Thu', value: 0 },
      { label: 'Fri', value: 0 },
      { label: 'Sat', value: 0 },
      { label: 'Sun', value: 0 },
    ],
  };

  useEffect(() => {
    // Live stats from database / localStorage
    try {
      const keys = Object.keys(localStorage);
      let clientCount = 0;
      let appCount = 0;
      let aptCount = 0;

      for (const k of keys) {
        if (k.includes('amman_user_applications')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            appCount += Array.isArray(arr) ? arr.length : 0;
          }
        }
        if (k.includes('amman_user_appointments')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            aptCount += Array.isArray(arr) ? arr.length : 0;
          }
        }
      }

      setStats({
        totalClients: clientCount,
        totalIncome: 0,
        totalExpense: 0,
        totalProfit: 0,
        totalAppointments: aptCount,
        pendingVerifications: 0,
        totalApplications: appCount,
        pendingPayment: 0,
      });
    } catch {
      // Graceful fallback
    }
  }, []);

  const kpiCards = [
    {
      label: 'Total Clients',
      value: stats.totalClients.toString(),
      sub: 'Active accounts',
      icon: Users,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
      iconBorder: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    },
    {
      label: 'Total Income',
      value: `₹${stats.totalIncome.toLocaleString('en-IN')}`,
      sub: 'Revenue generated',
      icon: TrendingUp,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      iconBorder: 'border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200/60',
    },
    {
      label: 'Total Expense',
      value: `₹${stats.totalExpense.toLocaleString('en-IN')}`,
      sub: 'Operational expenses',
      icon: TrendingDown,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      iconBorder: 'border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/60',
    },
    {
      label: 'Total Profit',
      value: `₹${stats.totalProfit.toLocaleString('en-IN')}`,
      sub: 'Net margin',
      icon: DollarSign,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      iconBorder: 'border-violet-100',
      badgeBg: 'bg-violet-50 text-violet-800 border-violet-200/60',
    },
    {
      label: 'Total Appointments',
      value: stats.totalAppointments.toString(),
      sub: 'Booked sessions',
      icon: Calendar,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      iconBorder: 'border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60',
    },
    {
      label: 'Pending Verifications',
      value: stats.pendingVerifications.toString(),
      sub: 'Requires review',
      icon: ShieldAlert,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      iconBorder: 'border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/60',
    },
    {
      label: 'Total Applications',
      value: stats.totalApplications.toString(),
      sub: 'Client requests',
      icon: FileText,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-700',
      iconBorder: 'border-teal-100',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/60',
    },
    {
      label: 'Pending Payment',
      value: stats.pendingPayment.toString(),
      sub: 'Unpaid invoices',
      icon: CreditCard,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      iconBorder: 'border-orange-100',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200/60',
    },
  ];

  const currentData = revenueData[revenueFilter];
  const totalRevenue = currentData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12" suppressHydrationWarning>

      {/* ── Welcome Header ── */}
      <div className="flex justify-end">
        <Link
          href="/admin/services"
          className="bg-[#12372A] hover:bg-[#1a4a38] text-white px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#a8d5b9]" />
          <span>Manage Services</span>
        </Link>
      </div>

      {/* ── KPI Cards — Row 1 (4 cards) ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.slice(0, 4).map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-full ${card.iconBg} ${card.iconColor} border ${card.iconBorder} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-gray-500 tracking-wide leading-tight truncate">{card.label}</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#0e2a47] tracking-tight">{card.value}</p>
              <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeBg} self-start`}>
                {card.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── KPI Cards — Row 2 (4 cards) ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.slice(4, 8).map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-8 h-8 rounded-full ${card.iconBg} ${card.iconColor} border ${card.iconBorder} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-gray-500 tracking-wide leading-tight truncate">{card.label}</span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#0e2a47] tracking-tight">{card.value}</p>
              <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${card.badgeBg} self-start`}>
                {card.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Revenue Chart + Pie Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Revenue Chart (col-span 8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-2xs p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Total:{' '}
                <span className="font-bold text-[#12372A]">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </span>
              </p>
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 self-start sm:self-auto">
              {(['yearly', 'monthly', 'weekly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRevenueFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 capitalize ${
                    revenueFilter === f
                      ? 'bg-[#12372A] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f0f7f2', radius: 8 }} />
                <Bar dataKey="value" fill="#12372A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Services Pie Chart (col-span 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Services Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">By application demand</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            {servicesPieData.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-400">No service data recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={servicesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {servicesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Appointments + Recent Applications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Recent Appointments */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Appointments</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest customer bookings</p>
            </div>
            <Link href="/admin/appointments" className="text-xs font-bold text-[#12372A] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-bold text-gray-900 truncate">{apt.customer}</p>
                      <span className="text-[9px] text-gray-400">({apt.id})</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{apt.service}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{apt.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <AppStatusBadge status={apt.status} />
                    {apt.mode && <span className="text-[9px] text-gray-400 font-medium">{apt.mode}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Recent Applications */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest client submissions</p>
            </div>
            <Link href="/admin/applications" className="text-xs font-bold text-[#12372A] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400">No applications submitted yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-bold text-gray-900 truncate">{app.customer}</p>
                      <span className="text-[9px] text-gray-400">({app.id})</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{app.service}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{app.date}</p>
                  </div>
                  <div className="shrink-0">
                    <AppStatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
