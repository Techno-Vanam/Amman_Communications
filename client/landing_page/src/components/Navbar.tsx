import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, LogIn, UserPlus, Calendar, ArrowRight } from 'lucide-react';

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
      {/* OUTER GLASSMORPHISM NAVBAR CAPSULE */}
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0b1310]/85 backdrop-blur-xl shadow-2xl shadow-black/40 border border-white/[0.14] py-2 px-3 sm:px-5'
            : 'bg-[#0d1612]/75 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/[0.10] py-2.5 px-3 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#15803d] text-white flex items-center justify-center shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                Amman <span className="text-[#4ade80]">Communications</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-300 uppercase leading-tight mt-0.5">
                Registration & Consultancy
              </span>
            </div>
          </a>

          {/* INNER NAVIGATION LAYER - Dark Glass Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.07] backdrop-blur-md px-2 py-1.5 rounded-full border border-white/[0.08] shadow-inner">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1 text-xs sm:text-sm rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-white/[0.14] text-[#4ade80] font-semibold shadow-xs border border-white/[0.12]'
                      : 'text-slate-200 hover:text-white hover:bg-white/[0.08]'
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
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#4ade80]" />
              <span>Login</span>
            </button>

            {onOpenModal ? (
              <button
                onClick={onOpenModal}
                className="px-4 py-1.5 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-green-500/25 hover:scale-[1.02]"
              >
                <span>Get in Touch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onNavigateSignUp}
                className="px-4 py-1.5 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-green-500/25 hover:scale-[1.02]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Dark Glassmorphism) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-[#0d1612]/95 backdrop-blur-2xl rounded-3xl border border-white/[0.14] px-4 pt-3 pb-5 shadow-2xl text-white animate-fade-in max-w-7xl mx-auto">
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
                      ? 'bg-white/[0.12] text-[#4ade80] font-bold border border-white/[0.10]'
                      : 'font-medium text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.10]">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateLogin();
                }}
                className="py-2.5 px-3 rounded-xl border border-white/[0.15] bg-white/[0.05] text-center font-semibold text-slate-200 hover:bg-white/[0.10] hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#4ade80]" />
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
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-center font-bold text-black transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-md shadow-green-500/25"
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
