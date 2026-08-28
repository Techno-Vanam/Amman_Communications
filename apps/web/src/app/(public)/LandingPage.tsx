'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  Menu, X, Zap, Shield, FileText, Upload,
  CheckCircle2, Send, BarChart3, ArrowRight,
  ChevronDown, Clock, Users, Globe,
  FolderOpen, Bell, Lock, LayoutDashboard,
  Phone, Mail, MapPin, Layers, Star,
} from 'lucide-react';

/* ── NAVBAR ─────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => setScrolled(window.scrollY > 10), []);
  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open]);

  const links = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#process' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white/92 backdrop-blur-md border-b transition-all duration-200 ${scrolled ? 'border-gray-200 shadow-sm' : 'border-transparent'}`}>
      <div className="container flex items-center h-16 gap-8">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="w-8 h-8 bg-brand-700 text-white rounded-lg flex items-center justify-center">
            <Layers size={16} strokeWidth={2.5} />
          </span>
          <span className="font-extrabold text-gray-900 tracking-tight">Amman<span className="text-brand-700">Comm</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-auto" aria-label="Main">
          {links.map(l => (
            <a key={l.label} href={l.href} className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors duration-150">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-150">Sign In</Link>
          <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-700 rounded-lg hover:bg-brand-800 transition-colors duration-150 flex items-center gap-1">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg text-gray-600 hover:border-brand-700 hover:text-brand-700 hover:bg-brand-50 transition-colors ml-auto"
          aria-expanded={open}
          onClick={() => setOpen(p => !p)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-5 pt-3 flex flex-col gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href} className="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:text-brand-700 hover:bg-brand-50" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
            <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100" onClick={() => setOpen(false)}>Sign In</Link>
            <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-brand-700 rounded-lg hover:bg-brand-800" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── HERO ────────────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-float w-full max-w-[480px]">
      {/* Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-1.5">
          {['#f43f5e','#f59e0b','#22c55e'].map(c => <span key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
        </div>
        <div className="flex-1 text-center text-xs text-gray-400 font-medium">app.ammancomm.in/customer</div>
      </div>
      {/* Body */}
      <div className="flex">
        <div className="flex flex-col gap-2 p-3 bg-brand-700 w-12">
          {[LayoutDashboard, FolderOpen, FileText, Bell, Lock].map((Icon, i) => (
            <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-white text-brand-700' : 'text-brand-200/60'}`}>
              <Icon size={14} strokeWidth={1.8} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-4">
          <div className="text-xs font-semibold text-gray-700 mb-3">Good morning, Sasi 👋</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Applications', val: '3', color: '#12372A', Icon: FileText },
              { label: 'Pending', val: '1', color: '#f59e0b', Icon: Clock },
              { label: 'Approved', val: '2', color: '#22c55e', Icon: CheckCircle2 },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-2 border border-gray-100">
                <div className="w-5 h-5 rounded-md flex items-center justify-center mb-1.5" style={{ background: c.color + '18', color: c.color }}>
                  <c.Icon size={11} />
                </div>
                <div className="text-sm font-bold" style={{ color: c.color }}>{c.val}</div>
                <div className="text-[9px] text-gray-400">{c.label}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-semibold text-gray-600 mb-1.5">Application #AC-2024-031</div>
          <div className="flex items-center gap-1 mb-3">
            {['Applied', 'Docs', 'Review', 'Done'].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${i < 3 ? 'bg-brand-700' : 'bg-gray-100'}`}>
                  {i < 3 && <CheckCircle2 size={8} className="text-white" />}
                </div>
                <span className="text-[8px] text-gray-400">{s}</span>
                {i < 3 && <div className="w-3 h-px bg-brand-200" />}
              </div>
            ))}
          </div>
          <div className="text-[10px] font-semibold text-gray-600 mb-1.5">Recent Documents</div>
          {['Aadhar Card', 'Proof of Address'].map((d, i) => (
            <div key={d} className="flex items-center gap-2 py-1">
              <FileText size={10} className="text-brand-700" />
              <span className="text-[9px] text-gray-600 flex-1">{d}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${i === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {i === 0 ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-64px)]">
      {/* Left dark green */}
      <div className="bg-brand-700 flex items-center py-20 lg:py-0">
        <div className="max-w-[520px] ml-auto px-6 lg:pr-16 flex flex-col gap-7">
          <div className="inline-flex items-center gap-2 bg-white/10 text-brand-200 text-xs font-semibold px-4 py-2 rounded-full border border-brand-200/25 w-fit">
            <Zap size={12} strokeWidth={2.5} />
            Fastest way to manage applications
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            One platform.<br />
            Every application.<br />
            <span className="bg-gradient-to-r from-brand-200 to-brand-100 bg-clip-text text-transparent">Zero confusion.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-[44ch]">
            Amman Communications brings all your service applications, documents,
            and status updates into a single secure platform — so you always know
            exactly where things stand.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors shadow-lg">
              Start Free <ArrowRight size={16} />
            </Link>
            <a href="#process" className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors">
              See how it works <ChevronDown size={14} />
            </a>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex">
              {['#2e8a60','#1a4d3a','#236649','#0f2d1e'].map((c, i) => (
                <span key={i} className="w-7 h-7 rounded-full border-2 border-brand-700 block -ml-2 first:ml-0" style={{ background: c, zIndex: 4 - i }} />
              ))}
            </div>
            <p className="text-xs text-white/55">Trusted by <strong className="text-brand-200">500+</strong> customers across Tamil Nadu</p>
          </div>
        </div>
      </div>

      {/* Right white */}
      <div className="bg-white flex items-center justify-center p-8 lg:p-12">
        <DashboardMockup />
      </div>
    </section>
  );
}

/* ── STATS BAR ───────────────────────────────────── */
function StatsBar() {
  const stats = [
    { icon: <Users size={20} />, val: '500+', label: 'Customers Served' },
    { icon: <FileText size={20} />, val: '2,400+', label: 'Applications Processed' },
    { icon: <Clock size={20} />, val: '< 48h', label: 'Average Review Time' },
    { icon: <Globe size={20} />, val: '10+', label: 'Service Types' },
  ];
  return (
    <section className="bg-brand-50 border-y border-brand-100 py-10">
      <div className="container grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <div className="text-brand-700">{s.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{s.val}</div>
            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── SERVICES ────────────────────────────────────── */
function Services() {
  const items = [
    { icon: <FileText size={28} />, title: 'Service Applications', desc: 'Submit new service requests with guided forms.', wide: true },
    { icon: <Upload size={28} />, title: 'Document Upload', desc: 'Upload, organise and track all required documents.', wide: false },
    { icon: <BarChart3 size={28} />, title: 'Status Tracking', desc: 'Real-time updates on every application stage.', wide: false },
    { icon: <Shield size={28} />, title: 'Secure Portal', desc: 'Your data is encrypted and protected at every step.', wide: false },
    { icon: <Bell size={28} />, title: 'Notifications', desc: 'Instant alerts when your application status changes.', wide: true },
  ];
  return (
    <section id="services" className="bg-white py-24">
      <div className="container">
        <div className="text-center mb-14">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-500 mb-3"><Star size={11} /> What We Offer</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Everything in one place</h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">From submission to approval — the entire lifecycle of your service application, managed here.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className={`bg-brand-50 rounded-2xl p-6 border border-brand-100 flex flex-col gap-3 hover:shadow-md hover:border-brand-200 transition-all duration-200 ${item.wide ? 'col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="text-brand-700">{item.icon}</div>
              <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PROCESS ─────────────────────────────────────── */
function Process() {
  const steps = [
    { n: '01', icon: <Users size={24} />, title: 'Create Account', desc: 'Register in 2 minutes. No paperwork needed to get started.' },
    { n: '02', icon: <FileText size={24} />, title: 'Start Application', desc: 'Select the service you need and fill in the required details.' },
    { n: '03', icon: <Upload size={24} />, title: 'Upload Documents', desc: 'Attach PDFs, images directly through your secure portal.' },
    { n: '04', icon: <CheckCircle2 size={24} />, title: 'We Review', desc: 'Our team verifies everything and reaches out if anything is needed.' },
    { n: '05', icon: <Send size={24} />, title: 'Get Approved', desc: 'Receive your result and download certificates directly from the portal.' },
  ];
  return (
    <section id="process" className="bg-brand-700 py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-200 mb-3"><Zap size={11} /> The Process</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">Five steps to done</h2>
          <p className="text-white/60 leading-relaxed">Simple, fast, and transparent from day one.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col gap-4">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-brand-200/20 z-0" aria-hidden="true" />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-brand-200 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="text-xs font-bold text-brand-400 tracking-widest lg:hidden">{s.n}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES ────────────────────────────────────── */
function FeatureVisual({ type }: { type: string }) {
  const c = { primary: '#12372A', light: '#d8ebdd', mid: '#2e8a60', bg: '#f0f7f2' };
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-brand-50">
      {type === 'dashboard' && (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <rect width="320" height="220" rx="14" fill={c.bg} />
          <rect x="16" y="16" width="70" height="188" rx="8" fill={c.primary} />
          {[30, 60, 90, 120, 150].map((y, i) => (
            <rect key={i} x="26" y={y} width="50" height="16" rx="4" fill={i === 0 ? '#fff' : 'rgba(255,255,255,.25)'} />
          ))}
          <rect x="100" y="16" width="204" height="80" rx="8" fill="#fff" />
          <rect x="112" y="28" width="60" height="8" rx="4" fill={c.primary} opacity=".7" />
          {[{ x: 112, w: 50, col: c.primary }, { x: 178, w: 50, col: '#f59e0b' }, { x: 244, w: 50, col: '#22c55e' }].map((r, i) => (
            <g key={i}>
              <rect x={r.x} y={44} width={r.w} height={36} rx="6" fill={r.col} opacity=".1" />
              <rect x={r.x + 6} y={50} width={24} height={6} rx="3" fill={r.col} />
              <rect x={r.x + 6} y={62} width={16} height={5} rx="2.5" fill={r.col} opacity=".5" />
            </g>
          ))}
          <rect x="100" y="106" width="204" height="98" rx="8" fill="#fff" />
          <rect x="112" y="118" width="80" height="7" rx="3.5" fill={c.primary} opacity=".6" />
          {[0, 1, 2].map(i => (
            <g key={i}>
              <rect x="112" y={134 + i * 20} width="180" height="12" rx="4" fill={c.bg} />
              <rect x="114" y={136 + i * 20} width={100 + i * 20} height="8" rx="3" fill={c.mid} opacity={0.4 + i * 0.2} />
            </g>
          ))}
        </svg>
      )}
      {type === 'docs' && (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <rect width="320" height="220" rx="14" fill={c.bg} />
          {[0, 1, 2].map(i => (
            <g key={i}>
              <rect x={16 + i * 4} y={20 + i * 6} width="200" height="160" rx="10" fill={i === 0 ? '#fff' : c.light} opacity={i === 0 ? 1 : 0.6} />
              {i === 0 && (
                <>
                  <rect x="30" y="36" width="80" height="10" rx="5" fill={c.primary} opacity=".7" />
                  <rect x="30" y="54" width="160" height="7" rx="3.5" fill={c.primary} opacity=".2" />
                  <rect x="30" y="67" width="130" height="7" rx="3.5" fill={c.primary} opacity=".2" />
                  <rect x="30" y="90" width="36" height="26" rx="5" fill={c.light} />
                  <rect x="35" y="97" width="26" height="5" rx="2.5" fill={c.primary} />
                  <rect x="30" y="124" width="50" height="16" rx="4" fill={c.light} />
                  <rect x="30" y="148" width="90" height="7" rx="3.5" fill={c.primary} opacity=".15" />
                </>
              )}
            </g>
          ))}
          <rect x="200" y="60" width="104" height="36" rx="10" fill={c.primary} />
          <rect x="212" y="70" width="52" height="6" rx="3" fill="#fff" opacity=".9" />
          <rect x="212" y="80" width="36" height="5" rx="2.5" fill="#fff" opacity=".5" />
          <circle cx="278" cy="76" r="10" fill="#22c55e" />
          <path d="M274 76l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === 'notif' && (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <rect width="320" height="220" rx="14" fill={c.bg} />
          {[
            { y: 20, color: '#22c55e', label: 'Application Approved!', sub: 'Your AC-2024-031 was approved.' },
            { y: 80, color: '#f59e0b', label: 'Action Required', sub: 'Please upload proof of address.' },
            { y: 140, color: c.primary, label: 'Document Verified', sub: 'Aadhar Card has been verified.' },
          ].map((n, i) => (
            <g key={i}>
              <rect x="16" y={n.y} width="288" height="50" rx="10" fill="#fff" />
              <rect x="16" y={n.y} width="288" height="50" rx="10" stroke="#e9ecef" strokeWidth="1" />
              <circle cx="40" cy={n.y + 25} r="12" fill={n.color} opacity=".15" />
              <circle cx="40" cy={n.y + 25} r="5" fill={n.color} />
              <rect x="60" y={n.y + 13} width="100" height="8" rx="4" fill="#212529" />
              <rect x="60" y={n.y + 27} width="160" height="6" rx="3" fill="#adb5bd" />
              <rect x="250" y={n.y + 20} width="42" height="12" rx="6" fill={n.color} opacity=".15" />
              <rect x="255" y={n.y + 23} width="32" height="5" rx="2.5" fill={n.color} />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: <LayoutDashboard size={32} />,
      tag: 'Dashboard',
      title: 'Everything you need, one screen',
      desc: 'Your complete application command centre. See all applications, pending documents, and recent activity at a glance.',
      points: ['Live status updates', 'Application history', 'Document checklist'],
      visual: 'dashboard',
    },
    {
      icon: <FolderOpen size={32} />,
      tag: 'Documents',
      title: 'Upload once, access forever',
      desc: "Organise your documents in a secure digital vault. Upload PDFs, images, and certificates — our system checks each one and tells you exactly what's approved.",
      points: ['Drag and drop upload', 'Verification status per doc', 'Download anytime'],
      visual: 'docs',
    },
    {
      icon: <Bell size={32} />,
      tag: 'Notifications',
      title: 'Never miss an update',
      desc: "Get notified the moment your application status changes — whether it's approved, needs more documents, or requires your attention.",
      points: ['Instant portal alerts', 'Status change emails', 'Action reminders'],
      visual: 'notif',
    },
  ];

  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-500 mb-3"><Shield size={11} /> Features</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Built for real people</h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">Every feature is designed to reduce confusion and save you time.</p>
        </div>
        <div className="flex flex-col gap-20">
          {features.map((f, i) => (
            <div key={i} className={`flex flex-col lg:flex-row items-center gap-12 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 w-full">
                <FeatureVisual type={f.visual} />
              </div>
              <div className="flex-1 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-xs font-semibold w-fit">
                  {f.icon}
                  <span>{f.tag}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                <ul className="flex flex-col gap-2">
                  {f.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <CheckCircle2 size={15} strokeWidth={2.5} className="text-brand-700 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors w-fit mt-1">
                  Try It Free <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA BANNER ──────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="bg-brand-50 border-y border-brand-100 py-20">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-8 flex-wrap">
        <div className="max-w-[540px]">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-brand-700 tracking-tight leading-snug mb-3">Ready to simplify your applications?</h2>
          <p className="text-gray-500 leading-relaxed">Join hundreds of customers who manage their service applications the smarter way.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors shadow-md">
            Create Free Account <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────── */
const FAQS = [
  { q: 'How do I start a new application?', a: 'Register an account, log in to your portal, select the service you need and click "Start Application". The system will guide you step by step through the required information and documents.' },
  { q: 'What file formats are accepted for documents?', a: "We accept PDF, JPG, PNG and JPEG formats. Each document must be under 10 MB. You'll see a clear checklist of exactly which documents are required for your application type." },
  { q: 'How long does the review process take?', a: 'Most applications are reviewed within 24–48 business hours. You can monitor the exact stage of your review in real time from your dashboard.' },
  { q: 'What happens if my document is rejected?', a: "You'll receive an in-portal notification with the specific reason. You can re-upload a corrected version without restarting your entire application." },
  { q: 'Is my data secure?', a: 'Yes. All documents and personal data are encrypted in transit and at rest. Only authorised personnel involved in processing your specific application can access your information.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-white py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
          <div className="flex flex-col gap-5 lg:sticky lg:top-24">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-brand-500"><Shield size={11} /> FAQ</p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Questions?<br />We&apos;ve got answers.</h2>
            <p className="text-gray-500 leading-relaxed">Can&apos;t find what you&apos;re looking for? Contact our support team.</p>
            <Link href="/#contact" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors w-fit">
              <Mail size={15} /> Contact Support
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <div key={i} className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${open === i ? 'border-brand-700' : 'border-gray-200'}`}>
                <button
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-semibold text-gray-900">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className="flex-shrink-0 ml-4 text-brand-700"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 250ms ease' }}
                  />
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────── */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#0a1f15] text-brand-200/70">
      <div className="container py-16 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 pb-6 border-b border-brand-200/10 mb-6">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-brand-200/90 font-bold">
              <span className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center">
                <Layers size={16} strokeWidth={2.5} />
              </span>
              Amman<strong className="text-brand-200">Comm</strong>
            </Link>
            <p className="text-sm text-brand-200/55 leading-relaxed max-w-[34ch]">The unified platform for service applications — secure, fast, and transparent.</p>
            <div className="flex flex-col gap-1.5">
              {[
                { icon: <Mail size={13} />, text: 'support@ammancomm.in' },
                { icon: <Phone size={13} />, text: '+91 00000 00000' },
                { icon: <MapPin size={13} />, text: 'Tamil Nadu, India' },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-xs text-brand-200/50">{icon} {text}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { title: 'Platform', links: [['Services', '#services'], ['How It Works', '#process'], ['Features', '#features'], ['FAQ', '#faq']] },
              { title: 'Account', links: [['Sign In', '/login'], ['Register', '/register'], ['Portal', '/customer']] },
              { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Contact', '/#contact']] },
            ].map(col => (
              <div key={col.title} className="flex flex-col gap-3">
                <h4 className="text-xs font-bold tracking-widest uppercase text-brand-200">{col.title}</h4>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="text-sm text-brand-200/50 hover:text-white transition-colors duration-150">{label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-brand-200/30">&copy; {year} Amman Communications. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ── PAGE ROOT ───────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Services />
        <Process />
        <Features />
        <CtaBanner />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
