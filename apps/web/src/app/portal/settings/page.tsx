'use client';

import React, { useState } from 'react';
import {
  User,
  Lock,
  Phone,
  Sliders,
  FileText,
  Smartphone,
  Mail,
  MapPin,
  Save,
  CheckCircle2
} from 'lucide-react';

import { useNotifications } from '@/context/NotificationContext';

export default function ProfileSettingsPage() {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<'Personal Details' | 'Change Password' | 'Contact Information' | 'Preferences'>('Personal Details');
  const [saved, setSaved] = useState(false);

  // Form State
  const [personalDetails, setPersonalDetails] = useState({
    fullName: 'John Doe',
    mobileNumber: '+91 9876543210',
    emailAddress: 'john.doe@email.com',
    residentialAddress: '123 Main Street, City, State - 600001'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [contactForm, setContactForm] = useState({
    altPhone: '+91 91234 56789',
    emergencyContact: 'Jane Doe (Spouse)',
    preferredChannel: 'Email'
  });

  const [preferencesForm, setPreferencesForm] = useState({
    emailAlerts: true,
    smsAlerts: true,
    language: 'English'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Profile Settings Saved Successfully!', 'Your information has been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-12">
      {/* Top Title */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0e2a47]">
        Profile Settings
      </h1>

      {/* Toast Notification on Save */}
      {saved && (
        <div className="bg-[#e6f4ea] border border-[#a8d5b9] text-[#137333] p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#137333]" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 text-center space-y-3 shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-[#dce9f7] text-[#1c3a63] mx-auto flex items-center justify-center border border-blue-200">
              <User className="w-10 h-10 text-[#1c3a63]" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{personalDetails.fullName}</h2>
              <span className="inline-block mt-1 bg-[#dce9f7] text-[#1c3a63] text-xs font-bold px-3.5 py-0.5 rounded-full">
                Client
              </span>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Member since Jan 2024
            </p>
          </div>

          {/* Navigation Menu Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <nav className="divide-y divide-gray-100 text-xs">
              <button
                onClick={() => setActiveTab('Personal Details')}
                className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                  activeTab === 'Personal Details'
                    ? 'bg-[#f0f5fa] text-[#1c3a63] font-bold border-l-4 border-l-[#1c3a63]'
                    : 'text-gray-700 font-semibold hover:bg-gray-50/80 border-l-4 border-l-transparent'
                }`}
              >
                <User className="w-4 h-4 text-[#1c3a63]" />
                <span>Personal Details</span>
              </button>

              <button
                onClick={() => setActiveTab('Change Password')}
                className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                  activeTab === 'Change Password'
                    ? 'bg-[#f0f5fa] text-[#1c3a63] font-bold border-l-4 border-l-[#1c3a63]'
                    : 'text-gray-700 font-semibold hover:bg-gray-50/80 border-l-4 border-l-transparent'
                }`}
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setActiveTab('Contact Information')}
                className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                  activeTab === 'Contact Information'
                    ? 'bg-[#f0f5fa] text-[#1c3a63] font-bold border-l-4 border-l-[#1c3a63]'
                    : 'text-gray-700 font-semibold hover:bg-gray-50/80 border-l-4 border-l-transparent'
                }`}
              >
                <Phone className="w-4 h-4 text-gray-500" />
                <span>Contact Information</span>
              </button>

              <button
                onClick={() => setActiveTab('Preferences')}
                className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                  activeTab === 'Preferences'
                    ? 'bg-[#f0f5fa] text-[#1c3a63] font-bold border-l-4 border-l-[#1c3a63]'
                    : 'text-gray-700 font-semibold hover:bg-gray-50/80 border-l-4 border-l-transparent'
                }`}
              >
                <Sliders className="w-4 h-4 text-gray-500" />
                <span>Preferences</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column (8/12) - Active Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
            {/* TAB 1: Personal Details (Matching Screenshot) */}
            {activeTab === 'Personal Details' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1c3a63]" />
                    <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Update your basic profile information. Fields marked with <span className="text-rose-600 font-bold">*</span> are mandatory.
                  </p>
                  <div className="mt-4 border-b border-gray-100" />
                </div>

                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-gray-700">
                        Full Name <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          value={personalDetails.fullName}
                          onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                          required
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-gray-700">
                        Mobile Number <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="text"
                          value={personalDetails.mobileNumber}
                          onChange={(e) => setPersonalDetails({ ...personalDetails, mobileNumber: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">
                      Email Address <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email"
                        value={personalDetails.emailAddress}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, emailAddress: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                        required
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">
                      Residential Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={personalDetails.residentialAddress}
                        onChange={(e) => setPersonalDetails({ ...personalDetails, residentialAddress: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPersonalDetails({
                        fullName: 'John Doe',
                        mobileNumber: '+91 9876543210',
                        emailAddress: 'john.doe@email.com',
                        residentialAddress: '123 Main Street, City, State - 600001'
                      });
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Change Password */}
            {activeTab === 'Change Password' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#1c3a63]" />
                    <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                  <div className="mt-4 border-b border-gray-100" />
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Contact Information */}
            {activeTab === 'Contact Information' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#1c3a63]" />
                    <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage alternate phone numbers and emergency contact options.
                  </p>
                  <div className="mt-4 border-b border-gray-100" />
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Alternate Phone Number</label>
                    <input
                      type="text"
                      value={contactForm.altPhone}
                      onChange={(e) => setContactForm({ ...contactForm, altPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={contactForm.emergencyContact}
                      onChange={(e) => setContactForm({ ...contactForm, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Preferred Communication Channel</label>
                    <select
                      value={contactForm.preferredChannel}
                      onChange={(e) => setContactForm({ ...contactForm, preferredChannel: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    >
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Contact Info</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: Preferences */}
            {activeTab === 'Preferences' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#1c3a63]" />
                    <h2 className="text-lg font-bold text-gray-900">Preferences</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Customize notification channels and portal language options.
                  </p>
                  <div className="mt-4 border-b border-gray-100" />
                </div>

                <div className="space-y-5 text-xs">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">Email Notifications</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Receive status updates and payment receipts via email.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.emailAlerts}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, emailAlerts: e.target.checked })}
                      className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">SMS Notifications</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Receive appointment reminders via SMS.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferencesForm.smsAlerts}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, smsAlerts: e.target.checked })}
                      className="w-5 h-5 text-[#0e2a47] rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Preferred Language</label>
                    <select
                      value={preferencesForm.language}
                      onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
