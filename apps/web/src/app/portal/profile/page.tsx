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
  Calendar,
  Building,
  FileCheck
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useUser } from '@/context/UserContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';

export default function ProfilePage() {
  const { showToast } = useNotifications();
  const { user, updateUser } = useUser();
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: user.name || '',
    mobileNumber: user.phone || '+91 ',
    emailAddress: user.email || '',
    residentialAddress: user.address || '',
    dob: user.dob || '',
    aadhaarNumber: user.aadhaarNumber || '',
    panNumber: user.panNumber || '',
    occupation: user.occupation || '',
    altPhone: user.altPhone || '+91 ',
    emergencyContact: user.emergencyContact || ''
  });

  // Sync state if user changes
  React.useEffect(() => {
    setProfileData({
      fullName: user.name || '',
      mobileNumber: user.phone || '+91 ',
      emailAddress: user.email || '',
      residentialAddress: user.address || '',
      dob: user.dob || '',
      aadhaarNumber: user.aadhaarNumber || '',
      panNumber: user.panNumber || '',
      occupation: user.occupation || '',
      altPhone: user.altPhone || '+91 ',
      emergencyContact: user.emergencyContact || ''
    });
  }, [user]);

  const isAadhaarEntered = Boolean(profileData.aadhaarNumber && profileData.aadhaarNumber.trim().length > 0);
  const isPanEntered = Boolean(profileData.panNumber && profileData.panNumber.trim().length > 0);
  const isAddressEntered = Boolean(profileData.residentialAddress && profileData.residentialAddress.trim().length > 0);
  const isFullyVerified = isAadhaarEntered && isPanEntered;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: profileData.fullName,
      email: profileData.emailAddress,
      phone: profileData.mobileNumber,
      address: profileData.residentialAddress,
      dob: profileData.dob,
      aadhaarNumber: profileData.aadhaarNumber,
      panNumber: profileData.panNumber,
      occupation: profileData.occupation,
      altPhone: profileData.altPhone,
      emergencyContact: profileData.emergencyContact
    });
    setSaved(true);
    showToast('Profile Details Saved Successfully!', 'Your personal profile information has been updated.');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 font-sans pb-12">
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
              <div className="w-24 h-24 rounded-full bg-[#dce9f7] text-[#1c3a63] flex items-center justify-center border-2 border-blue-200 shadow-inner font-extrabold text-2xl">
                {user.initials || 'U'}
              </div>
              <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
                isFullyVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`} title={isFullyVerified ? 'Verified Account' : 'Pending Verification'}>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{profileData.fullName}</h2>
              <span className={`inline-block mt-1 text-xs font-bold px-3.5 py-0.5 rounded-full ${
                isFullyVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isFullyVerified ? 'Client • Verified Member' : 'Client • Profile Incomplete'}
              </span>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Member Account
            </p>
          </div>

          {/* Identity & Verification Status Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Verification Badges
            </h3>

            <div className="space-y-3 text-xs">
              {/* Aadhaar Identity Badge */}
              <div className={`flex items-center justify-between p-3 border rounded-2xl ${
                isAadhaarEntered ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <FileCheck className={`w-4 h-4 ${isAadhaarEntered ? 'text-emerald-700' : 'text-amber-600'}`} />
                  <span className="font-bold text-gray-800">Aadhaar Identity</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isAadhaarEntered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isAadhaarEntered ? 'Submitted' : 'Pending Entry'}
                </span>
              </div>

              {/* PAN Card Status Badge */}
              <div className={`flex items-center justify-between p-3 border rounded-2xl ${
                isPanEntered ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <FileCheck className={`w-4 h-4 ${isPanEntered ? 'text-emerald-700' : 'text-amber-600'}`} />
                  <span className="font-bold text-gray-800">PAN Card Status</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isPanEntered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isPanEntered ? 'Submitted' : 'Pending Entry'}
                </span>
              </div>

              {/* Residential Address / Property Status */}
              <div className={`flex items-center justify-between p-3 border rounded-2xl ${
                isAddressEntered ? 'bg-blue-50/70 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Building className={`w-4 h-4 ${isAddressEntered ? 'text-[#1c3a63]' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-800">Address Status</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isAddressEntered ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isAddressEntered ? 'Configured' : 'Not Provided'}
                </span>
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
                Enter and update your official personal information and contact credentials.
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
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Mobile Phone Number</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={profileData.mobileNumber}
                      onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                      placeholder="+91 Mobile Number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
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
                      placeholder="your.email@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Date of Birth</label>
                  <CustomDatePicker
                    value={profileData.dob}
                    onChange={(val) => setProfileData({ ...profileData, dob: val })}
                    disableFuture
                  />
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
                    placeholder="Enter house no, street, city & pincode"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  />
                </div>
              </div>

              {/* Government ID References - Editable by user */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 mb-3">Government Identity References</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Aadhaar Number</label>
                    <input
                      type="text"
                      value={profileData.aadhaarNumber}
                      onChange={(e) => setProfileData({ ...profileData, aadhaarNumber: e.target.value })}
                      placeholder="Enter 12-digit Aadhaar number"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">PAN Card Number</label>
                    <input
                      type="text"
                      value={profileData.panNumber}
                      onChange={(e) => setProfileData({ ...profileData, panNumber: e.target.value })}
                      placeholder="Enter 10-char PAN (e.g. ABCDE1234F)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
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
                      placeholder="Alternate contact number"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                      placeholder="Name & relation (e.g. Parent / Spouse)"
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
