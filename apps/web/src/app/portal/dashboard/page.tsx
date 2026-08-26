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
  ArrowUpRight
} from 'lucide-react';

export default function PortalDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          Welcome back, John Doe <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-600">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Current Applications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#f0f7f2] border border-[#a8d5b9]/40 flex items-center justify-center text-[#12372A]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="bg-[#d8ebdd] text-[#12372A] text-xs font-semibold px-3 py-1 rounded-full border border-[#a8d5b9]/50">
              Active
            </span>
          </div>
          <div className="mt-6">
            <div className="text-4xl font-extrabold text-gray-900 tracking-tight">5</div>
            <div className="mt-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Current Applications
            </div>
          </div>
        </div>

        {/* Card 2: Pending Applications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
              Action Needed
            </span>
          </div>
          <div className="mt-6">
            <div className="text-4xl font-extrabold text-gray-900 tracking-tight">3</div>
            <div className="mt-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Pending Applications
            </div>
          </div>
        </div>

        {/* Card 3: Completed Applications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6">
            <div className="text-4xl font-extrabold text-gray-900 tracking-tight">7</div>
            <div className="mt-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Completed Applications
            </div>
          </div>
        </div>

        {/* Card 4: Upcoming Appointments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="bg-blue-100 text-blue-900 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
              This Week
            </span>
          </div>
          <div className="mt-6">
            <div className="text-4xl font-extrabold text-gray-900 tracking-tight">4</div>
            <div className="mt-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              Upcoming Appointments
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section: Recent Activity & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity (Left Col 7/12) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link
                href="/portal/applications"
                className="text-xs font-semibold text-[#12372A] hover:text-[#2e8a60] flex items-center gap-1 transition-colors"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {/* Activity Item 1 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8faf9] border border-gray-200/60 hover:border-[#a8d5b9] transition-colors">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">
                    Application <span className="font-bold text-[#12372A]">AMC-2026-000001</span> status changed to <span className="font-bold text-[#12372A]">&quot;Verification&quot;</span>.
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">2 hours ago</span>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8faf9] border border-gray-200/60 hover:border-[#a8d5b9] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#f0f7f2] text-[#12372A] flex items-center justify-center shrink-0 border border-[#a8d5b9]/50">
                  <CheckCircle2 className="w-4 h-4 text-[#12372A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">
                    Document <span className="font-bold text-gray-900">&quot;EC Certificate&quot;</span> uploaded successfully.
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">Yesterday, 10:30 AM</span>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#f8faf9] border border-gray-200/60 hover:border-[#a8d5b9] transition-colors">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">
                    Appointment on <span className="font-bold text-gray-900">25 May 2026</span> is confirmed.
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing last 3 activities</span>
            <Link
              href="/portal/applications"
              className="text-xs font-semibold text-[#12372A] hover:underline"
            >
              Track all requests &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Notifications (Right Col 5/12) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <Link
                href="/portal/notifications"
                className="text-xs font-semibold text-[#12372A] hover:text-[#2e8a60] transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="mt-6 space-y-3.5">
              {/* Notification Card 1 (Action Required) */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#12372A] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <AlertCircle className="w-4 h-4 text-[#a8d5b9]" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 leading-tight">
                      Action Required: Upload Missing Document
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 shrink-0">Just now</span>
                </div>
                <p className="text-xs text-gray-600 pl-9 leading-relaxed">
                  Your application <span className="font-semibold text-gray-800">AMC-2026-000003</span> is missing a valid ID proof. Please upload it to proceed.
                </p>
              </div>

              {/* Notification Card 2 (Payment Receipt) */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#12372A] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CreditCard className="w-4 h-4 text-[#a8d5b9]" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900 leading-tight">
                      Payment Receipt Available
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 shrink-0">5 hours ago</span>
                </div>
                <p className="text-xs text-gray-600 pl-9 leading-relaxed">
                  Payment of <span className="font-semibold text-gray-800">$150.00</span> for Property Registration has been processed successfully.
                </p>
              </div>

              {/* Notification Card 3 (Maintenance) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-800 leading-tight">
                      System Maintenance Notice
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 shrink-0">May 20</span>
                </div>
                <p className="text-xs text-gray-500 pl-9 leading-relaxed">
                  The portal will be down for scheduled maintenance this Sunday from 2 AM to 4 AM EST.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/portal/notifications"
              className="text-xs font-semibold text-[#12372A] hover:underline"
            >
              Open Notification Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}