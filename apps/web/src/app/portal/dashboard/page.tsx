'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Info,
  ArrowUpRight
} from 'lucide-react';

import { useUser, getUserStorageKey } from '@/context/UserContext';

interface DashboardAppItem {
  id: string;
  serviceType: string;
  status: string;
  submittedDate: string;
  assignedOfficer?: string;
  [key: string]: unknown;
}

interface DashboardAptItem {
  id: string;
  serviceType: string;
  consultationType: string;
  originalDateTime: string;
  [key: string]: unknown;
}

export default function PortalDashboardPage() {
  const { user } = useUser();
  const [applications, setApplications] = useState<DashboardAppItem[]>([]);
  const [appointments, setAppointments] = useState<DashboardAptItem[]>([]);

  useEffect(() => {
    try {
      const appsKey = getUserStorageKey(user.email, 'amman_user_applications');
      const savedApps = localStorage.getItem(appsKey);
      setApplications(savedApps ? JSON.parse(savedApps) : []);

      const aptsKey = getUserStorageKey(user.email, 'amman_user_appointments');
      const savedApts = localStorage.getItem(aptsKey);
      setAppointments(savedApts ? JSON.parse(savedApts) : []);
    } catch (e) {
      console.error('Error loading dashboard state:', e);
      setApplications([]);
      setAppointments([]);
    }
  }, [user.email]);

  const activeAppsCount = applications.filter((a) => a.status !== 'Completed').length;
  const completedAppsCount = applications.filter((a) => a.status === 'Completed').length;
  const pendingActionsCount = applications.filter((a) => a.status === 'Verification' || a.status === 'Documents Received').length;
  const appointmentsCount = appointments.length;

  // Build combined top 3 recent activities list
  const recentActivities = [
    ...applications.map((app) => ({
      id: `app-${app.id}`,
      title: `Application ${app.id}`,
      service: app.serviceType,
      status: app.status,
      date: app.submittedDate,
      isApp: true
    })),
    ...appointments.map((apt) => ({
      id: `apt-${apt.id || apt.serviceType}`,
      title: `Appointment Scheduled`,
      service: apt.serviceType,
      status: apt.consultationType || 'Office Visit',
      date: apt.originalDateTime || 'Scheduled',
      isApp: false
    }))
  ].slice(0, 3);

  // Build top 3 alerts & reminders list
  const topAlerts = [
    ...(applications.length > 0 ? [{
      id: 'alt-1',
      title: 'Application Under Verification',
      desc: `Application ${applications[0].id} for ${applications[0].serviceType} is being verified.`,
      badge: 'Active',
      badgeBg: 'bg-blue-100 text-blue-800'
    }] : []),
    ...(appointments.length > 0 ? [{
      id: 'alt-2',
      title: 'Upcoming Appointment Session',
      desc: `${appointments[0].serviceType} session (${appointments[0].consultationType || 'Office Visit'}).`,
      badge: 'Scheduled',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    }] : []),
    {
      id: 'alt-3',
      title: 'System Security & Verification',
      desc: 'Account credentials and identity document vault status active.',
      badge: 'Protected',
      badgeBg: 'bg-gray-100 text-gray-800'
    }
  ].slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* 4 KPI Summary Cards Grid - Matching Payments Card Styling & Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Active Applications */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs relative flex flex-col justify-between min-h-[140px] sm:h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide truncate">Active Applications</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3 sm:mt-4">
              {applications.length}
            </p>
          </div>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              {activeAppsCount > 0 ? `${activeAppsCount} active` : 'No active apps'}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Actions */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs relative flex flex-col justify-between min-h-[140px] sm:h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide truncate">Pending Actions</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3 sm:mt-4">
              {pendingActionsCount}
            </p>
          </div>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
              {pendingActionsCount > 0 ? 'Verification in progress' : 'Up to date'}
            </span>
          </div>
        </div>

        {/* Card 3: Completed Services */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs relative flex flex-col justify-between min-h-[140px] sm:h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide truncate">Completed Services</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3 sm:mt-4">
              {completedAppsCount}
            </p>
          </div>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
              {completedAppsCount > 0 ? `${completedAppsCount} Completed` : '0 Completed'}
            </span>
          </div>
        </div>

        {/* Card 4: Appointments */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs relative flex flex-col justify-between min-h-[140px] sm:h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-gray-600 tracking-wide truncate">Appointments</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0e2a47] tracking-tight mt-3 sm:mt-4">
              {appointmentsCount}
            </p>
          </div>
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/60">
              Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Main Container Card Grid: Recent Activity (Top 3) & Alerts (Top 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Activity (Left Col 7/12) - Perfectly Sized Top 3 Cards */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 min-w-0 truncate">Recent Activity &amp; Updates</h2>
              <Link
                href="/portal/applications"
                className="text-xs font-bold text-[#12372A] hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {recentActivities.length === 0 ? (
                <div className="p-6 text-center bg-gray-50/70 border border-gray-200/60 rounded-xl space-y-1.5">
                  <Info className="w-5 h-5 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800">No Recent Activity Recorded</p>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                    Create an application or schedule an appointment to track status updates.
                  </p>
                </div>
              ) : (
                recentActivities.slice(0, 3).map((act) => (
                  <div key={act.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/60 flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      act.isApp ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {act.isApp ? <RefreshCw className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {act.isApp ? (
                        <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                          {act.title} ({act.service}) is currently in <span className="font-bold text-[#12372A]">&quot;{act.status}&quot;</span>.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                          Appointment scheduled for <span className="font-bold text-gray-900">{act.service}</span> via <span className="font-bold text-gray-900">{act.status}</span>.
                        </p>
                      )}
                      <span className="text-[10px] text-gray-400 block mt-0.5">{act.isApp ? `Submitted: ${act.date}` : act.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium text-[11px]">Real-time tracking active</span>
            <Link href="/portal/applications" className="font-bold text-[#12372A] hover:underline">
              Track requests &rarr;
            </Link>
          </div>
        </div>

        {/* Action Alerts & Reminders (Right Col 5/12) - Perfectly Sized Cards */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-sm font-bold text-gray-900 truncate">Alerts &amp; Reminders</h2>
              </div>
              <Link href="/portal/notifications" className="text-xs font-bold text-[#12372A] hover:underline shrink-0 whitespace-nowrap">
                View All
              </Link>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              {topAlerts.map((alt) => (
                <div key={alt.id} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/70 space-y-1.5 transition-all hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs truncate">{alt.title}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-gray-200 ${alt.badgeBg}`}>
                      {alt.badge}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">
                    {alt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-center">
            <Link href="/portal/notifications" className="text-xs font-bold text-[#12372A] hover:underline">
              Open Notification Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}