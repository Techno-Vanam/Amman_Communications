import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, ArrowRight, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onOpenModal: () => void;
  onNavigateLogin: () => void;
  onNavigateSignUp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenModal,
  onNavigateLogin,
  onNavigateSignUp,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Choose Us', href: '#why-choose-us' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white/80 backdrop-blur-xs py-4 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm shadow-brand-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                AMMAN
              </span>
              <span className="text-[11px] font-semibold tracking-widest text-brand-600 uppercase leading-tight">
                Communications
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200/70 shadow-xs">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-white rounded-full transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons (Login, Sign Up, Get Started) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={onNavigateLogin}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100/80 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-brand-600" />
              <span>Login</span>
            </button>

            <button
              onClick={onNavigateSignUp}
              className="px-4 py-2 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 rounded-xl transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-brand-600" />
              <span>Sign Up</span>
            </button>

            <button
              onClick={onOpenModal}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm hover:shadow-brand-glow transition-all duration-200 flex items-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-fade-in">
          <div className="flex flex-col space-y-1 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateLogin();
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <LogIn className="w-4 h-4 text-brand-600" />
                <span>Login</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateSignUp();
                }}
                className="py-2.5 px-3 rounded-xl bg-brand-50 border border-brand-200 text-center font-semibold text-brand-700 hover:bg-brand-100 transition-colors flex items-center justify-center gap-1.5 text-sm"
              >
                <UserPlus className="w-4 h-4 text-brand-600" />
                <span>Sign Up</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-center shadow-sm flex items-center justify-center gap-2 text-sm mt-1"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
