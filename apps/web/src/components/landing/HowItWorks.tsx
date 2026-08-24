import styles from './HowItWorks.module.css';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Application',
    description:
      'Register on the platform and start a new application. Provide the required information to get the process underway.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 2v6h6M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Upload Required Documents',
    description:
      'Attach all necessary documents to your application directly through the portal. Accepted formats are clearly indicated.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Documents Are Reviewed',
    description:
      'Our team reviews your submitted documents. You will be notified if any corrections or additional information are required.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Application Is Submitted',
    description:
      'Once everything is in order, your application is marked as submitted and processing begins.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Track Your Progress',
    description:
      'Stay informed through your customer portal. View updates, download results, and manage any follow-up requirements.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={styles.section}
      aria-labelledby="how-heading"
    >
      <div className={`${styles.inner} container`}>
        <div className={styles.header}>
          <p className="section-label">The Process</p>
          <h2 id="how-heading" className="section-heading">
            How it works
          </h2>
          <p className="section-subheading">
            A straightforward process designed to keep you informed and in
            control from start to finish.
          </p>
        </div>

        <ol className={styles.steps} aria-label="Application process steps">
          {STEPS.map((step, index) => (
            <li key={step.number} className={styles.step}>
              {/* Connector line (not shown on last item) */}
              {index < STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true" />
              )}

              <div className={styles.stepNumber} aria-hidden="true">
                {step.number}
              </div>

              <div className={styles.stepIcon} aria-hidden="true">
                {step.icon}
              </div>

              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
