'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, Layers } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
] as const;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  return (
    <header
      role="banner"
      className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
        scrolled ? 'border-b border-gray-200 shadow-sm' : 'border-b border-transparent'
      }`}
    >
      <nav className="container flex items-center gap-8 h-[68px]" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 no-underline" onClick={closeMenu}>
          <span className="flex items-center justify-center w-9 h-9 bg-brand-700 text-white rounded-lg">
            <Layers size={20} strokeWidth={2} />
          </span>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Amman <span className="text-brand-700">Communications</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1 ml-auto list-none" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="inline-block px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-brand-700 hover:bg-brand-50 transition-colors duration-150"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-700 rounded-lg hover:bg-brand-800 transition-colors duration-150 shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 ml-auto border border-gray-200 rounded-lg text-gray-600 hover:border-brand-700 hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white px-6 pb-6 pt-3 flex flex-col gap-1">
          <ul className="flex flex-col gap-0.5 list-none" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:text-brand-700 hover:bg-brand-50 transition-colors duration-150"
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
            <Link
              href="/login"
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              onClick={closeMenu}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-brand-700 rounded-lg hover:bg-brand-800 transition-colors duration-150"
              onClick={closeMenu}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
