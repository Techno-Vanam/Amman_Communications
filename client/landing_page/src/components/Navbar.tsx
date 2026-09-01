import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface NavbarProps {
  onOpenModal?: () => void;
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
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['hero', 'services', 'how-it-works', 'why-choose-us', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
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
    <header className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-3 sm:px-6 transition-all duration-300">
      {/* OUTER LIGHT GLASSMORPHISM CAPSULE */}
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/[0.06] border border-white/90 py-2 px-3 sm:px-5'
            : 'bg-white/65 backdrop-blur-lg shadow-lg shadow-black/[0.03] border border-white/70 py-2.5 px-3 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
<<<<<<< HEAD
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                Amman <span className="text-brand-600">Communications</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-500 uppercase leading-tight mt-0.5">
                Registration & Consultancy
              </span>
            </div>
=======
            <img src="/logo@4x-8.png" alt="TechnoVanam Communications" className="w-32 sm:w-36 h-auto group-hover:scale-[1.02] transition-transform" />
>>>>>>> origin/feature/landing-technovanam
          </a>

          {/* INNER NAVIGATION LAYER - Light Frosted Glass Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/[0.04] backdrop-blur-md px-2 py-1.5 rounded-full border border-black/[0.04] shadow-inner">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1 text-xs sm:text-sm rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-brand-700 font-bold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={onNavigateLogin}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-700 hover:bg-white/80 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-600" />
              <span>Login</span>
            </button>

            {onOpenModal ? (
              <button
                onClick={onOpenModal}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-600/25 hover:scale-[1.02]"
              >
                <span>Get in Touch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onNavigateSignUp}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-600/25 hover:scale-[1.02]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:text-brand-600 hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Light Glassmorphism) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 px-4 pt-3 pb-5 shadow-2xl text-slate-800 animate-fade-in max-w-7xl mx-auto">
          <div className="flex flex-col space-y-1 mb-4">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-100'
                      : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateLogin();
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white/70 text-center font-semibold text-slate-700 hover:bg-white transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-600" />
                <span>Login</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenModal) {
                    onOpenModal();
                  } else {
                    onNavigateSignUp();
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-center font-bold text-white transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-md shadow-brand-600/25"
              >
                <span>Get in Touch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
