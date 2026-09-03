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
import { fetchApplicationsAction, fetchAppointmentsAction } from '@/app/portal/actions';
import StatCard from '@/components/ui/StatCard';

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
    async function loadDashboardData() {
      try {
        const [appsData, aptsData] = await Promise.all([
          fetchApplicationsAction(),
          fetchAppointmentsAction(),
        ]);

        if (appsData && Array.isArray(appsData) && appsData.length > 0) {
          setApplications(appsData.map((app: any) => ({
            id: app.applicationNumber || app.id,
            serviceType: app.serviceType || 'Service',
            status: app.status === 'COMPLETED' ? 'Completed' : (app.status === 'PROCESSING' ? 'Processing' : 'Verification'),
            submittedDate: app.submittedAt
              ? new Date(app.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          })));
        } else {
          // Fallback to localStorage
          try {
            const appsKey = getUserStorageKey(user.email, 'amman_user_applications');
            const savedApps = localStorage.getItem(appsKey);
            if (savedApps) setApplications(JSON.parse(savedApps));
          } catch {}
        }

        if (aptsData && Array.isArray(aptsData) && aptsData.length > 0) {
          setAppointments(aptsData.map((apt: any) => {
            const dateStr = apt.appointmentDate ? new Date(apt.appointmentDate).toISOString().split('T')[0] : '';
            const timeStr = apt.appointmentTime || '';
            let consultationType = 'Office Visit';
            if (apt.appointmentType === 'ONLINE_CONSULTATION') {
              const channel = apt.consultationMode || 'Phone';
              consultationType = `Online (${channel})`;
            } else if (apt.office?.name) {
              consultationType = `Office (${apt.office.name})`;
            }
            return {
              id: apt.id,
              serviceType: apt.service?.name || apt.notes || 'Service Appointment',
              consultationType,
              originalDateTime: `${dateStr} ${timeStr}`.trim() || 'Scheduled',
              status: apt.status,
            };
          }));
        } else {
          // Fallback to localStorage
          try {
            const aptsKey = getUserStorageKey(user.email, 'amman_user_appointments');
            const savedApts = localStorage.getItem(aptsKey);
            if (savedApts) setAppointments(JSON.parse(savedApts));
          } catch {}
        }
      } catch (e) {
        console.error('Error loading dashboard state:', e);
      }
    }
    loadDashboardData();
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
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-5 font-sans">
      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Applications"
          value={applications.length}
          sub={activeAppsCount > 0 ? `${activeAppsCount} active` : 'No active apps'}
          icon={FileText}
          variant="teal"
        />
        <StatCard
          label="Pending Actions"
          value={pendingActionsCount}
          sub={pendingActionsCount > 0 ? 'Verification active' : 'Up to date'}
          icon={Clock}
          variant="amber"
        />
        <StatCard
          label="Completed Services"
          value={completedAppsCount}
          sub={`${completedAppsCount} finalized`}
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          label="Booked Appointments"
          value={appointmentsCount}
          sub={appointmentsCount > 0 ? `${appointmentsCount} scheduled` : 'No appointments'}
          icon={Calendar}
          variant="indigo"
        />
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
