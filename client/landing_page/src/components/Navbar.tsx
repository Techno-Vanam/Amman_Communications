import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onOpenModal?: () => void;
  onNavigateLogin: () => void;
  onNavigateSignUp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
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
      {/* OUTER NAVBAR LAYER - Single Rounded Container */}
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 py-2 px-3 sm:px-5'
            : 'bg-white/90 backdrop-blur-sm border border-slate-200/80 py-2.5 px-3 sm:px-6 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <img src="/logo@4x-8.png" alt="TechnoVanam Communications" className="w-32 sm:w-36 h-auto group-hover:scale-[1.02] transition-transform" />
          </a>

          {/* INNER NAVIGATION LAYER - Layer inside a layer */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 shadow-inner">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-xs'
                      : 'font-semibold text-slate-700 hover:text-brand-700 hover:bg-white/80'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* AUTHENTICATION LAYER - Distinct action group */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70">
            <button
              onClick={onNavigateLogin}
              className="px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-700 hover:bg-white rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-600" />
              <span>Login</span>
            </button>

            <button
              onClick={onNavigateSignUp}
              className="px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 border border-brand-800/80 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-brand-200" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white rounded-3xl border border-slate-200 px-4 pt-3 pb-5 shadow-xl animate-fade-in max-w-7xl mx-auto">
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
                      ? 'bg-brand-600 text-white font-bold'
                      : 'font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50'
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
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-600" />
                <span>Login</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateSignUp();
                }}
                className="py-2.5 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-center font-semibold text-white transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-brand-200" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
