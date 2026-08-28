'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  RefreshCw,
  AlertCircle,
  Info,
  ArrowUpRight,
  Plus
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      {/* Welcome Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            Good day, {user.name} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500 font-medium">
            Here&apos;s a real-time overview of your current applications and scheduled appointments.
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

      {/* 4 KPI Summary Cards Grid - Matching Payments Card Styling & Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Active Applications */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-2xs relative flex flex-col justify-between min-h-[140px] sm:h-44">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
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
                <Clock className="w-5 h-5" />
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
                <CheckCircle2 className="w-5 h-5" />
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
                <Calendar className="w-5 h-5" />
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
              {applications.length === 0 && appointments.length === 0 ? (
                <div className="p-8 text-center bg-gray-50/70 border border-gray-200/60 rounded-2xl space-y-2">
                  <Info className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800">No Recent Activity Recorded</p>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                    Create an application or schedule an appointment to track status updates and verification milestones in real-time.
                  </p>
                </div>
              ) : (
                <>
                  {applications.slice(0, 2).map((app: DashboardAppItem) => (
                    <div key={app.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/60 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                          Application <span className="font-bold text-[#12372A]">{app.id}</span> ({app.serviceType}) is currently in <span className="font-bold text-[#12372A]">&quot;{app.status}&quot;</span>.
                        </p>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Submitted: {app.submittedDate}</span>
                      </div>
                    </div>
                  ))}

                  {appointments.slice(0, 2).map((apt: DashboardAptItem) => (
                    <div key={apt.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/60 flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-semibold leading-relaxed">
                          Appointment scheduled for <span className="font-bold text-gray-900">{apt.serviceType}</span> via <span className="font-bold text-gray-900">{apt.consultationType}</span>.
                        </p>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{apt.originalDateTime}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
                <span className="bg-[#12372A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {applications.length > 0 ? '1 Active' : '0 New'}
                </span>
              </div>
              <Link href="/portal/notifications" className="text-xs font-bold text-[#12372A] hover:underline">
                View All
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {applications.length > 0 ? (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Application Under Verification</span>
                    <span className="text-[10px] text-gray-400">Active</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Your application {applications[0].id} for {applications[0].serviceType} is being verified by officer {applications[0].assignedOfficer}.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 border border-gray-200/70 rounded-2xl space-y-2">
                  <AlertCircle className="w-5 h-5 text-gray-400 mx-auto" />
                  <p className="font-bold text-gray-800 text-xs">No Action Alerts</p>
                  <p className="text-gray-500 text-[11px]">Your account status and documents are up to date.</p>
                </div>
              )}
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