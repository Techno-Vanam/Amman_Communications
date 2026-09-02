'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  CheckCircle2,
  Globe,
  Upload,
} from 'lucide-react';
import {
  fetchBusinessProfileAction,
  updateBusinessProfileAction,
  uploadBusinessLogoAction
} from './actions';

// ── Types ─────────────────────────────────────────────────────
interface CompanyProfile {
  logoUrl: string | null;
  companyName: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  adminName: string;
  adminRole: string;
}

const DEFAULT_PROFILE: CompanyProfile = {
  logoUrl: null,
  companyName: 'Amman Communications',
  email: 'admin@ammancommunications.com',
  phone: '+91 98456 12300',
  altPhone: '',
  address: '12, Main Road, Industrial Area',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600001',
  website: 'www.ammancommunications.com',
  adminName: 'Super Admin',
  adminRole: 'Administrator',
};

// ── Main Page ─────────────────────────────────────────────────
export default function AdminProfilePage() {
  const [profileData, setProfileData] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProfile = async () => {
    setErrorMsg(null);
    const res = await fetchBusinessProfileAction();
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.success && res.data) {
      const dbProf = res.data;
      const mapped: CompanyProfile = {
        logoUrl: dbProf.logoUrl || null,
        companyName: dbProf.businessName || 'Amman Communications',
        email: dbProf.supportEmail || 'admin@ammancomm.in',
        phone: dbProf.primaryPhone || '+91 98456 12300',
        altPhone: '',
        address: dbProf.officeAddress || '12, Main Road, Industrial Area',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600002',
        website: 'www.ammancomm.in',
        adminName: 'Amman Admin',
        adminRole: 'Administrator',
      };
      setProfileData(mapped);
      if (dbProf.logoUrl) {
        setLogoPreview(dbProf.logoUrl);
        setImgError(false);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setImgError(false);
      setProfileData(p => ({ ...p, logoUrl: result }));
    };
    reader.readAsDataURL(file);

    // Upload to server immediately
    const formData = new FormData();
    formData.append('file', file);
    const res = await uploadBusinessLogoAction(formData);
    if (res.error) {
      setErrorMsg(res.error);
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleLogoFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);
    const res = await updateBusinessProfileAction({
      companyName: profileData.companyName,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      website: profileData.website,
      registrationNumber: 'COMM-TN-2026-9921',
    });
    setSaving(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadProfile();
    }
  }

  const getFullLogoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';
    return `${API_BASE_URL}${url}`;
  };

  const currentLogo = getFullLogoUrl(logoPreview ?? profileData.logoUrl);
  const initials = profileData.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 font-sans pb-12">
      {/* Save Toast Notification */}
      {saved && (
        <div className="max-w-4xl mx-auto w-full bg-[#e6f4ea] border border-[#a8d5b9] text-[#137333] p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#137333]" />
          <span>Business profile saved to database successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="max-w-4xl mx-auto w-full bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200">
          <span>Error: {errorMsg}</span>
        </div>
      )}

      {/* Centered Business Profile Form Card */}
      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 md:p-10 shadow-2xs space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Logo Upload Section */}
            <div className="relative inline-block shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-gray-50 shadow-sm overflow-hidden flex items-center justify-center bg-gray-100 transition-all cursor-pointer hover:ring-4 hover:ring-[#0e2a47]/20`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {currentLogo && !imgError ? (
                  <img src={currentLogo} alt={profileData.companyName} onError={() => setImgError(true)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-3xl font-extrabold text-[#0e2a47] drop-shadow-sm">{initials}</span>
                  </div>
                )}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all bg-black/50 ${dragOver ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest">Upload</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1c3a63] flex items-center justify-center border border-blue-100 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Business Identity</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage your company's official public profile and contact details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100" />

          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Company Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Website <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="www.yourcompany.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Business Email */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Business Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="admin@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>

              {/* Primary Phone */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Primary Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Headquarters Address */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 mb-3">Headquarters / Office Address</h3>
              
              <div className="space-y-5">
                {/* Full Address */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">Street Address *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="Building name, street, locality..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">City *</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      placeholder="e.g. Chennai"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">State *</label>
                    <input
                      type="text"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-gray-700">Pincode *</label>
                    <input
                      type="text"
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      placeholder="e.g. 600001"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Admin Name</label>
                <input
                  type="text"
                  disabled
                  value={profileData.adminName}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">Admin Role</label>
                <input
                  type="text"
                  disabled
                  value={profileData.adminRole}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0e2a47] hover:bg-[#153e68] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
