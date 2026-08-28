'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, FileText, Settings, User } from 'lucide-react';

interface CustomerSummary {
  applications: number;
  documents: number;
}

interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
}

export default function CustomerDashboardPage() {
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [summaryRes, profileRes] = await Promise.all([
          fetch('/api/customer/dashboard/summary'),
          fetch('/api/customer/dashboard/profile'),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }
        
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        }
      } catch (e) {
        console.error('Failed to load dashboard', e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">Here is a summary of your account activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/customer/appointments" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Appointments</h3>
              <p className="text-sm text-slate-500">Manage bookings</p>
            </div>
          </div>
        </Link>

        <Link href="/portal/applications" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Applications</h3>
                <p className="text-sm text-slate-500">View progress</p>
              </div>
            </div>
            {summary && (
              <span className="text-xl font-bold text-slate-700">{summary.applications}</span>
            )}
          </div>
        </Link>

        <Link href="/portal/documents" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Documents</h3>
                <p className="text-sm text-slate-500">Your uploads</p>
              </div>
            </div>
            {summary && (
              <span className="text-xl font-bold text-slate-700">{summary.documents}</span>
            )}
          </div>
        </Link>

        <Link href="/customer/profile-settings" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Settings</h3>
              <p className="text-sm text-slate-500">Profile & preferences</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Getting Started</h3>
          <p className="text-slate-600 mb-4">
            Welcome to the Amman Communications platform! From here you can book appointments, submit applications, and upload documents securely.
          </p>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Make sure your profile information is up to date in the Settings tab.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Book a consultation with one of our experts for your business needs.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Upload any required documents via the Portal so we can begin processing your application.</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2">Need Support?</h3>
            <p className="text-blue-100 text-sm mb-6">
              Our team is here to help with your applications and consultations.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-5 h-5 text-blue-300" />
                <span>+962 79 XXX XXXX</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-5 h-5 text-blue-300" />
                <span>support@amman-comm.com</span>
              </div>
            </div>
          </div>
          <svg className="absolute bottom-0 right-0 text-white opacity-10 w-48 h-48 -mr-12 -mb-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
