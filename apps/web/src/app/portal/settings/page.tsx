'use client';

import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Bell,
  Globe,
  Shield,
  Save,
  CheckCircle2,
  Moon,
  KeyRound,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export default function SettingsPage() {
  const { showToast } = useNotifications();
  const [saved, setSaved] = useState(false);

  // Security Form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  });

  // Notification Preferences
  const [notificationsForm, setNotificationsForm] = useState({
    emailAlerts: true,
    smsAlerts: fontSmsDefault(true),
    whatsappAlerts: true,
    weeklyDigest: false
  });

  // Portal Preferences
  const [portalForm, setPortalForm] = useState({
    language: 'English',
    timezone: 'Asia/Kolkata (IST +5:30)',
    autoLogout: '30 minutes'
  });

  function fontSmsDefault(val: boolean) {
    return val;
  }

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Security Settings Updated!', 'Your password and authentication settings have been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Portal Preferences Saved!', 'Your notification and language preferences have been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ security: securityForm, notifications: notificationsForm, portal: portalForm }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'My-Portal-Settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Data Exported!', 'Your account settings data file has been downloaded.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0e2a47]">
          System &amp; Security Settings
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Manage your account security, notification alerts, language options, and privacy preferences.
        </p>
      </div>

      {/* Save Toast Notification */}
      {saved && (
        <div className="bg-[#e6f4ea] border border-[#a8d5b9] text-[#137333] p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#137333]" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      {/* SECTION 1: Account Security & Password */}
      <form onSubmit={handleSaveSecurity} className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1c3a63]" />
            <h2 className="text-lg font-bold text-gray-900">Security &amp; Password</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Update your login password and configure two-factor authentication (2FA).
          </p>
          <div className="mt-4 border-b border-gray-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={securityForm.currentPassword}
              onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={securityForm.newPassword}
              onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={securityForm.confirmPassword}
              onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
            />
          </div>
        </div>

        {/* 2FA Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-[#1c3a63]" />
            <div>
              <p className="font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Require an OTP verification code sent to your phone upon login.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={securityForm.twoFactor}
            onChange={(e) => setSecurityForm({ ...securityForm, twoFactor: e.target.checked })}
            className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Password &amp; Security</span>
          </button>
        </div>
      </form>

      {/* SECTION 2: Notification & Portal System Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1c3a63]" />
            <h2 className="text-lg font-bold text-gray-900">Notification Alerts &amp; Portal Preferences</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Control which notification channels stay active and set language defaults.
          </p>
          <div className="mt-4 border-b border-gray-100" />
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">Email Notifications</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive application receipts &amp; status emails.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.emailAlerts}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, emailAlerts: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">SMS Reminders</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive appointment reminders via SMS.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.smsAlerts}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, smsAlerts: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">WhatsApp Alerts</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive direct status updates on WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.whatsappAlerts}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, whatsappAlerts: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900">Weekly Activity Summary</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Receive a weekly digest report of active requests.</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsForm.weeklyDigest}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, weeklyDigest: e.target.checked })}
                className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Preferred Portal Language</label>
              <select
                value={portalForm.language}
                onChange={(e) => setPortalForm({ ...portalForm, language: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Timezone</label>
              <input
                type="text"
                disabled
                value={portalForm.timezone}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700">Auto Logout Inactivity</label>
              <select
                value={portalForm.autoLogout}
                onChange={(e) => setPortalForm({ ...portalForm, autoLogout: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
              >
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* SECTION 3: Account Data & Privacy */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-4 text-xs">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-[#1c3a63]" />
            <span>Account Data &amp; Privacy</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Download a copy of your system preferences and account activity data.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div>
            <p className="font-bold text-gray-900">Export Settings &amp; Logs</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Download your configuration data as a JSON file.</p>
          </div>
          <button
            onClick={handleExportData}
            className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition-colors shrink-0"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}
