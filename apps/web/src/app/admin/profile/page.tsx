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
  editing = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  editing?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">
        {label} {required && editing && <span className="text-rose-500">*</span>}
      </label>
      {editing ? (
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            suppressHydrationWarning
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] focus:bg-white transition-all shadow-xs"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3.5 py-2 px-1">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 shadow-2xs">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 text-gray-500' } as any)}
          </div>
          <span className="text-sm font-extrabold text-gray-900 break-words mt-0.5">{value || '—'}</span>
        </div>
      )}
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
  const [imgError, setImgError] = useState(false);
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
        setImgError(false);
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
      setImgError(false);
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
    setImgError(false);
    setEditing(false);
  }

  const currentLogo = editing ? (logoPreview ?? draft.logoUrl) : profile.logoUrl;
  const initials = profile.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans space-y-6">
      
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Profile saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── Left Sidebar: Identity Card ── */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 self-start">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-br from-[#12372A] to-[#2e8a60] relative">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            </div>

            <div className="px-6 pb-8 text-center relative -mt-14">
              {/* Logo */}
              <div className="relative inline-block mb-4">
                <div
                  className={`w-28 h-28 mx-auto rounded-[2rem] border-[6px] border-white shadow-xl overflow-hidden flex items-center justify-center bg-gray-100 transition-all ${editing ? 'cursor-pointer hover:ring-4 hover:ring-[#12372A]/20' : ''}`}
                  onClick={() => editing && fileRef.current?.click()}
                  onDragOver={e => { if (editing) { e.preventDefault(); setDragOver(true); }}}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { if (editing) handleDrop(e); }}
                >
                  {currentLogo && !imgError ? (
                    <img src={currentLogo} alt={profile.companyName} onError={() => setImgError(true)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl font-extrabold text-[#12372A] drop-shadow-sm">{initials}</span>
                    </div>
                  )}
                  {editing && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all bg-black/50 ${dragOver ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
              </div>

              {/* Text Info */}
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{profile.companyName}</h2>
              <p className="text-sm font-semibold text-gray-500 mt-1">{profile.email}</p>
              
              {/* Admin info badge */}
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-[#12372A] flex items-center justify-center text-white text-[9px] font-bold">
                  {profile.adminName.charAt(0)}
                </div>
                <span className="text-xs font-bold text-gray-700">{profile.adminName}</span>
                <span className="text-gray-300">|</span>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{profile.adminRole}</span>
              </div>
            </div>

            {/* Editing actions */}
            <div className="px-6 pb-6 bg-gray-50/50 pt-4 border-t border-gray-50">
              {!editing ? (
                <button type="button" onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#12372A] text-white text-sm font-bold hover:bg-[#1a4a38] transition-all shadow-md">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Drag-drop hint */}
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-dashed border-[#12372A]/30 bg-[#f0f7f2]/50 text-[#12372A] text-xs font-bold hover:bg-[#f0f7f2] transition-colors">
                    <Upload className="w-4 h-4" /> Upload New Logo
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleCancel}
                      className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 py-3 rounded-2xl bg-[#12372A] text-white text-sm font-bold hover:bg-[#1a4a38] transition-all shadow-md flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Content: Form Fields ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Company Information */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-[#f0f7f2] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#12372A]" />
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Business Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="sm:col-span-2">
                <Field label="Company Name" required icon={<Building2 />} editing={editing}
                  value={editing ? draft.companyName : profile.companyName}
                  onChange={v => set('companyName', v)}
                  placeholder="e.g. Amman Communications" />
              </div>
              <Field label="Business Email" required type="email" icon={<Mail />} editing={editing}
                value={editing ? draft.email : profile.email}
                onChange={v => set('email', v)}
                placeholder="admin@company.com" />
              <Field label="Website" icon={<Globe />} editing={editing}
                value={editing ? draft.website : profile.website}
                onChange={v => set('website', v)}
                placeholder="www.yourcompany.com" />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Contact Details</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <Field label="Primary Phone" required type="tel" icon={<Phone />} editing={editing}
                value={editing ? draft.phone : profile.phone}
                onChange={v => set('phone', v)}
                placeholder="+91 XXXXX XXXXX" />
              <Field label="Alternate Phone" type="tel" icon={<Phone />} editing={editing}
                value={editing ? draft.altPhone : profile.altPhone}
                onChange={v => set('altPhone', v)}
                placeholder="+91 XXXXX XXXXX (optional)" />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-base font-extrabold text-gray-900">Headquarters</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">
                  Street Address {editing && <span className="text-rose-500">*</span>}
                </label>
                {editing ? (
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      value={draft.address}
                      onChange={e => set('address', e.target.value)}
                      placeholder="Building name, street, locality..."
                      rows={2}
                      suppressHydrationWarning
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#12372A]/30 focus:border-[#12372A] focus:bg-white transition-all resize-none shadow-xs"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3.5 py-2 px-1">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 shadow-2xs">
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-extrabold text-gray-900 leading-relaxed max-w-md mt-2">{profile.address || '—'}</span>
                  </div>
                )}
              </div>
              
              <Field label="City" required icon={<Building2 />} editing={editing}
                value={editing ? draft.city : profile.city}
                onChange={v => set('city', v)}
                placeholder="e.g. Chennai" />
                
              <div className="grid grid-cols-2 gap-4">
                <Field label="State" icon={<MapPin />} editing={editing}
                  value={editing ? draft.state : profile.state}
                  onChange={v => set('state', v)}
                  placeholder="e.g. Tamil Nadu" />
                <Field label="Pincode" type="text" icon={<MapPin />} editing={editing}
                  value={editing ? draft.pincode : profile.pincode}
                  onChange={v => set('pincode', v)}
                  placeholder="600001" />
              </div>
            </div>
          </div>
          
        </div>
      </form>
    </div>
  );
}

