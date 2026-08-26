'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Info,
  ArrowUpRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';

export default function PortalDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* Welcome Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            Good day, John Doe <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500 font-medium">
            Here&apos;s a quick overview of your current applications and account status.
          </p>
        </div>

        <Link
          href="/portal/book-appointment"
          className="bg-[#12372A] hover:bg-[#1a4a38] text-white px-6 py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* 4 KPI Summary Cards Grid matching Pillio UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Active applications</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">5</h3>
            <span className="text-[11px] font-bold text-emerald-600">↑ 2 active phase</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending actions</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">3</h3>
            <span className="text-[11px] font-semibold text-amber-600">Action required</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Completed services</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">7</h3>
            <span className="text-[11px] font-semibold text-gray-400">100% verified</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Appointments</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">4</h3>
            <span className="text-[11px] font-semibold text-blue-600">This month</span>
          </div>
        </div>
      </div>

      {/* Main Container Card Grid: Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity (Left Col 7/12) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Recent Activity &amp; Status Updates</h2>
              <Link
                href="/portal/applications"
                className="text-xs font-bold text-[#12372A] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {/* Activity Item 1 */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/60 hover:border-[#a8d5b9] transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                    Application <span className="font-bold text-[#12372A]">AMC-2026-000001</span> status changed to <span className="font-bold text-[#12372A]">&quot;Verification&quot;</span>.
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">2 hours ago</span>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/60 hover:border-[#a8d5b9] transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#f0f7f2] text-[#12372A] flex items-center justify-center shrink-0 border border-[#a8d5b9]/50">
                  <CheckCircle2 className="w-4 h-4 text-[#12372A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                    Document <span className="font-bold text-gray-900">&quot;EC Certificate&quot;</span> uploaded successfully.
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Yesterday, 10:30 AM</span>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/60 hover:border-[#a8d5b9] transition-all flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                    Appointment on <span className="font-bold text-gray-900">25 May 2026</span> is confirmed.
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-0.5">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Updated real-time</span>
            <Link href="/portal/applications" className="font-bold text-[#12372A] hover:underline">
              Track requests &rarr;
            </Link>
          </div>
        </div>

        {/* Action Alerts & Notifications (Right Col 5/12) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Alerts &amp; Reminders</h2>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <Link href="/portal/notifications" className="text-xs font-bold text-[#12372A] hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Upload Missing Document</span>
                  <span className="text-[10px] text-gray-400">Just now</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Your application AMC-2026-000003 is missing a valid ID proof.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Payment Receipt Ready</span>
                  <span className="text-[10px] text-gray-400">5 hours ago</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Payment of $150.00 for Property Registration has been processed.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link href="/portal/notifications" className="text-xs font-bold text-[#12372A] hover:underline">
              Open Notification Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}