import Link from 'next/link';
import styles from './FinalCTA.module.css';

export default function FinalCTA() {
  return (
    <section className={styles.section} aria-labelledby="final-cta-heading">
      <div className={`${styles.inner} container`}>
        <div className={styles.content}>
          <h2 id="final-cta-heading" className={styles.heading}>
            Ready to get started?
          </h2>
          <p className={styles.description}>
            Create your account today and experience a more organised,
            transparent way to manage your applications.
          </p>
          <div className={styles.actions}>
            <Link href="/register" className="btn btn-outline">
              Create an Account
            </Link>
            <Link href="/login" className={`btn ${styles.btnSecondary}`}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
