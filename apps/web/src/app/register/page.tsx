import { Metadata } from 'next';
import styles from './page.module.css';
import RegisterForm from './RegisterForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register | Amman Communications',
  description: 'Create a new customer account',
};

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.leftCol}>
        <div className={styles.formCard}>
          <Link href="/" className={styles.logo} aria-label="Home">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.logoIcon}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Amman Comm</span>
          </Link>
          <RegisterForm />
        </div>
      </div>
      
      <div className={styles.rightCol}>
        <div className={styles.decorativeCircle1} />
        <div className={styles.decorativeCircle2} />
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Start your journey with <span>us today.</span>
          </h2>
          <p className={styles.heroText}>
            Join Amman Communications to access our secure portal, manage your applications, and track your essential documents.
          </p>
        </div>
      </div>
    </div>
  );
}