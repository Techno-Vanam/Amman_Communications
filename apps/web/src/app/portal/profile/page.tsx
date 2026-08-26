'use client';

import React, { useState } from 'react';
import {
  User,
  Smartphone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Calendar,
  Building,
  FileCheck,
  Lock,
  PhoneCall
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export default function ProfilePage() {
  const { showToast } = useNotifications();
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    mobileNumber: '+91 9876543210',
    emailAddress: 'john.doe@email.com',
    residentialAddress: '123 Main Street, City, State - 600001',
    dob: '1992-05-15',
    aadhaarNumber: 'XXXX-XXXX-9042',
    panNumber: 'ABCDE1234F',
    occupation: 'Business Owner',
    altPhone: '+91 91234 56789',
    emergencyContact: 'Jane Doe (Spouse)'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Profile Details Saved Successfully!', 'Your personal profile information has been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0e2a47]">
          My Profile &amp; Identity
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Manage your official personal information, government verification status, and contact credentials.
        </p>
      </div>

      {/* Save Toast Notification */}
      {saved && (
        <div className="bg-[#e6f4ea] border border-[#a8d5b9] text-[#137333] p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#137333]" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Grid: Left Profile Card & Right Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Card & Verification Badges (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main User Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 text-center space-y-4 shadow-2xs">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-full bg-[#dce9f7] text-[#1c3a63] flex items-center justify-center border-2 border-blue-200 shadow-inner">
                <User className="w-12 h-12 text-[#1c3a63]" />
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs" title="Verified Account">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{profileData.fullName}</h2>
              <span className="inline-block mt-1 bg-[#dce9f7] text-[#1c3a63] text-xs font-bold px-3.5 py-0.5 rounded-full">
                Client • Verified Member
              </span>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Member since Jan 2024
            </p>
          </div>

          {/* Identity & Verification Status Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Verification Badges
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-gray-800">Aadhaar Identity</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Verified</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-gray-800">PAN Card Status</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Verified</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-[#1c3a63]" />
                  <span className="font-bold text-gray-800">Property Records</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Information Form (8/12) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#1c3a63]" />
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Update your basic profile information and official contact details.
              </p>
              <div className="mt-4 border-b border-gray-100" />
            </div>

            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Mobile Phone Number *</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={profileData.mobileNumber}
                      onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={profileData.emailAddress}
                      onChange={(e) => setProfileData({ ...profileData, emailAddress: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={profileData.residentialAddress}
                    onChange={(e) => setProfileData({ ...profileData, residentialAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  />
                </div>
              </div>

              {/* Government ID References */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 mb-3">Government Identity References</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-500">Aadhaar Number</label>
                    <input
                      type="text"
                      disabled
                      value={profileData.aadhaarNumber}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-500">PAN Card Number</label>
                    <input
                      type="text"
                      disabled
                      value={profileData.panNumber}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 mb-3">Emergency Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Alternate Phone Number</label>
                    <input
                      type="text"
                      value={profileData.altPhone}
                      onChange={(e) => setProfileData({ ...profileData, altPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Details</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
