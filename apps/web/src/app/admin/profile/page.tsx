'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  CheckCircle,
  Edit2,
  X,
  Globe,
  Upload,
} from 'lucide-react';
import {
  fetchBusinessProfileAction,
  updateBusinessProfileAction,
  deleteBusinessLogoAction,
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

// ── Field Component ────────────────────────────────────────────
function Field({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          suppressHydrationWarning
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProfile = async () => {
    setIsLoading(true);
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
      setProfile(mapped);
      setDraft(mapped);
      if (dbProf.logoUrl) {
        setLogoPreview(dbProf.logoUrl);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  function set(key: keyof CompanyProfile, value: string) {
    setDraft(p => ({ ...p, [key]: value }));
  }

  function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setDraft(p => ({ ...p, logoUrl: result }));
    };
    reader.readAsDataURL(file);
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
    const res = await updateBusinessProfileAction({
      companyName: draft.companyName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
      website: draft.website,
      registrationNumber: 'COMM-TN-2026-9921',
    });

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setProfile(draft);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadProfile();
    }
  }

  function handleCancel() {
    setDraft(profile);
    setLogoPreview(profile.logoUrl);
    setEditing(false);
  }

  const currentLogo = editing ? (logoPreview ?? draft.logoUrl) : profile.logoUrl;
  const initials = profile.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans space-y-6">

      {/* ── Page Header ── */}
      <div className="flex justify-end">
        {/* Success toast */}
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm animate-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Profile saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Logo + Identity Card ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-[#12372A] via-[#1a5c3a] to-[#2e8a60] relative">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>

          <div className="px-6 pb-6">
            {/* Logo upload zone */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-5">
              <div className="relative shrink-0">
                {/* Logo circle */}
                <div
                  className={`w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gray-100 transition-all ${editing ? 'cursor-pointer ring-2 ring-[#12372A]/30' : ''}`}
                  onClick={() => editing && fileRef.current?.click()}
                  onDragOver={e => { if (editing) { e.preventDefault(); setDragOver(true); }}}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { if (editing) handleDrop(e); }}
                >
                  {currentLogo ? (
                    <img src={currentLogo} alt="Company logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-[#12372A]">{initials}</span>
                  )}
                  {editing && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all rounded-2xl ${dragOver ? 'bg-[#12372A]/80' : 'bg-black/40 opacity-0 hover:opacity-100'}`}>
                      <Camera className="w-5 h-5 text-white" />
                      <span className="text-[9px] text-white font-bold mt-1">Change</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />

                {/* Upload hint when editing */}
                {editing && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    suppressHydrationWarning
                    className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-[#f0f7f2] border border-[#a8d5b9] text-[10px] font-bold text-[#12372A] hover:bg-[#dceee4] transition-colors">
                    <Upload className="w-3 h-3" /> Upload Logo
                  </button>
                )}
              </div>

              <div className="flex-1 pt-14 sm:pt-0">
                <p className="text-xl font-extrabold text-gray-900">{profile.companyName}</p>
                <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
                <p className="text-xs text-gray-400 mt-1">{profile.city}, {profile.state}</p>
              </div>

              <div className="sm:self-auto self-start">
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    suppressHydrationWarning
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-all shadow-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCancel}
                      suppressHydrationWarning
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button type="submit"
                      suppressHydrationWarning
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#12372A] text-white text-xs font-bold hover:bg-[#1a4a38] transition-all shadow-md">
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drag-drop hint */}
            {editing && (
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-1 ${dragOver ? 'border-[#12372A] bg-[#f0f7f2]' : 'border-gray-200 bg-gray-50 hover:border-[#12372A]/40'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { handleDrop(e); }}
              >
                <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-600">Drop your logo here, or <span className="text-[#12372A] underline">browse</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG up to 2 MB. Recommended: 256 × 256 px</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Company Information ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#f0f7f2] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#12372A]" />
            </div>
            <h2 className="text-sm font-extrabold text-gray-900">Company Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Company Name" required icon={<Building2 className="w-4 h-4" />}
                value={editing ? draft.companyName : profile.companyName}
                onChange={v => set('companyName', v)}
                placeholder="e.g. Amman Communications"
              />
            </div>
            <Field label="Business Email" required type="email" icon={<Mail className="w-4 h-4" />}
              value={editing ? draft.email : profile.email}
              onChange={v => set('email', v)}
              placeholder="admin@company.com"
            />
            <Field label="Website" icon={<Globe className="w-4 h-4" />}
              value={editing ? draft.website : profile.website}
              onChange={v => set('website', v)}
              placeholder="www.yourcompany.com"
            />
          </div>
        </div>

        {/* ── Contact Details ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm font-extrabold text-gray-900">Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Primary Phone" required type="tel" icon={<Phone className="w-4 h-4" />}
              value={editing ? draft.phone : profile.phone}
              onChange={v => set('phone', v)}
              placeholder="+91 XXXXX XXXXX"
            />
            <Field label="Alternate Phone" type="tel" icon={<Phone className="w-4 h-4" />}
              value={editing ? draft.altPhone : profile.altPhone}
              onChange={v => set('altPhone', v)}
              placeholder="+91 XXXXX XXXXX (optional)"
            />
          </div>
        </div>

        {/* ── Address ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-extrabold text-gray-900">Address</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  value={editing ? draft.address : profile.address}
                  onChange={e => set('address', e.target.value)}
                  disabled={!editing}
                  placeholder="Building name, street, locality..."
                  rows={2}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] focus:bg-white transition-all resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <Field label="City" required icon={<MapPin className="w-4 h-4" />}
              value={editing ? draft.city : profile.city}
              onChange={v => set('city', v)}
              placeholder="e.g. Chennai"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="State" icon={<MapPin className="w-4 h-4" />}
                value={editing ? draft.state : profile.state}
                onChange={v => set('state', v)}
                placeholder="e.g. Tamil Nadu"
              />
              <Field label="Pincode" type="text" icon={<MapPin className="w-4 h-4" />}
                value={editing ? draft.pincode : profile.pincode}
                onChange={v => set('pincode', v)}
                placeholder="600001"
              />
            </div>
          </div>
        </div>

        {/* ── Read-only info strip ── */}
        {!editing && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{profile.adminName}</p>
              <p className="text-[11px] text-gray-400">{profile.adminRole} · Last updated just now</p>
            </div>
            <button type="button" onClick={() => setEditing(true)}
              suppressHydrationWarning
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#12372A] text-white text-[10px] font-bold hover:bg-[#1a4a38] transition-colors">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
        )}

        {/* ── Save / Cancel (bottom) ── */}
        {editing && (
          <div className="flex gap-3">
            <button type="button" onClick={handleCancel}
              suppressHydrationWarning
              className="flex-1 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              suppressHydrationWarning
              className="flex-1 py-3 rounded-full bg-[#12372A] text-white text-sm font-bold hover:bg-[#1a4a38] transition-all shadow-md flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
