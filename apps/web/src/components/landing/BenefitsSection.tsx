import styles from './BenefitsSection.module.css';

const BENEFITS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'One Place for Everything',
    description:
      'Manage all your applications from a single, organised dashboard — no scattered paperwork or multiple portals.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M13 2v7h7" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    title: 'Organised Document Management',
    description:
      'Upload, view, and manage required documents in one place. Track which documents are pending, approved, or need correction.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Clear Status Visibility',
    description:
      'Always know exactly where your application stands. No guessing, no uncertainty — just clear, real-time updates.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Easier Communication',
    description:
      'Receive notifications and instructions directly through the platform, keeping all communication in one accessible location.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Secure Access',
    description:
      'Your account and information are protected. Only you can access your applications and documents when you log in.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19 11H5M19 11l-4-4M19 11l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Centralised Records',
    description:
      'All your application history, documents, and status updates are stored in one place and accessible whenever you need them.',
  },
] as const;

export default function BenefitsSection() {
  return (
    <section
      id="about"
      className={styles.section}
      aria-labelledby="benefits-heading"
    >
      <div className={`${styles.inner} container`}>
        <div className={styles.header}>
          <p className="section-label">Why Amman Communications</p>
          <h2 id="benefits-heading" className="section-heading">
            A better way to manage your applications
          </h2>
          <p className="section-subheading">
            The platform is built to reduce the complexity of managing service
            applications, giving you clarity and control at every step.
          </p>
        </div>
        <ul className={styles.grid} role="list">
          {BENEFITS.map(({ icon, title, description }) => (
            <li key={title} className={styles.card}>
              <div className={styles.iconWrap}>{icon}</div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardDescription}>{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
