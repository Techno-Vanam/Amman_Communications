import styles from './TrustSection.module.css';

const TRUST_ITEMS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Secure Document Handling',
    description: 'Your documents are stored and processed with care.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Clear Application Tracking',
    description: 'See exactly where your application stands at all times.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Organised Process',
    description: 'A structured workflow guides you from start to finish.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Dedicated Support',
    description: 'Help is available whenever you need assistance.',
  },
] as const;

export default function TrustSection() {
  return (
    <section className={styles.section} aria-label="Key benefits">
      <div className={`${styles.inner} container`}>
        {TRUST_ITEMS.map(({ icon, title, description }) => (
          <div key={title} className={styles.item}>
            <div className={styles.iconWrap}>{icon}</div>
            <div className={styles.text}>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
