import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className={`${styles.inner} container`}>
        <div className={styles.main}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo} aria-label="Home">
              {/* Replace with actual logo if available */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Amman Communications</span>
            </Link>
            <p className={styles.description}>
              The unified platform for managing your service applications safely,
              securely, and efficiently.
            </p>
          </div>

          <nav className={styles.navCol} aria-label="Quick links">
            <h3 className={styles.colTitle}>Platform</h3>
            <ul className={styles.navList}>
              <li>
                <Link href="/#services">Services</Link>
              </li>
              <li>
                <Link href="/#how-it-works">How It Works</Link>
              </li>
              <li>
                <Link href="/#about">About</Link>
              </li>
              <li>
                <Link href="/#contact">FAQ</Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.navCol} aria-label="Account links">
            <h3 className={styles.colTitle}>Account</h3>
            <ul className={styles.navList}>
              <li>
                <Link href="/login">Sign In</Link>
              </li>
              <li>
                <Link href="/register">Create Account</Link>
              </li>
              <li>
                <Link href="/portal">Customer Portal</Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.navCol} aria-label="Support links">
            <h3 className={styles.colTitle}>Support</h3>
            <ul className={styles.navList}>
              <li>
                <Link href="/#contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} Amman Communications. All rights reserved.
          </p>
          <div className={styles.legal}>
            {/* Additional legal links if necessary */}
          </div>
        </div>
      </div>
    </footer>
  );
}
