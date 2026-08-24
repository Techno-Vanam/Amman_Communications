'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

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

  // Close menu on Escape key
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
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <nav
        className={`${styles.nav} container`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoAccent}>A</span>mman{' '}
          <span className={styles.logoSecond}>Communications</span>
        </Link>

        {/* Desktop nav links */}
        <ul className={styles.navLinks} role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className={styles.navLink}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className={styles.navCtas}>
          <Link href="/login" className={`btn btn-ghost ${styles.loginBtn}`}>
            Login
          </Link>
          <Link href="/register" className="btn btn-outline">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.menuBtn}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barTopOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barMidOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barBotOpen : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className={styles.mobileLinks} role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className={styles.mobileLink}
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.mobileCtas}>
          <Link
            href="/login"
            className={`btn btn-ghost ${styles.mobileBtn} ${styles.loginBtn}`}
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={`btn btn-outline ${styles.mobileBtn}`}
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
