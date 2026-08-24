import Link from 'next/link';
import styles from './Hero.module.css';

function HeroIllustration() {
  return (
    <div className={styles.illustration} aria-hidden="true">
      {/* Document checklist SVG illustration */}
      <svg
        viewBox="0 0 420 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        aria-hidden="true"
      >
        {/* Background card */}
        <rect x="40" y="40" width="340" height="300" rx="16" fill="#F4F5F7" />

        {/* Main document */}
        <rect x="80" y="72" width="220" height="240" rx="10" fill="white" />
        <rect x="80" y="72" width="220" height="240" rx="10" stroke="#E2E5EA" strokeWidth="1.5" />

        {/* Document header bar */}
        <rect x="80" y="72" width="220" height="44" rx="10" fill="#12372A" />
        <rect x="80" y="96" width="220" height="20" fill="#12372A" />

        {/* Header text lines */}
        <rect x="100" y="86" width="120" height="8" rx="4" fill="white" opacity="0.9" />
        <rect x="100" y="98" width="80" height="6" rx="3" fill="white" opacity="0.5" />

        {/* Checklist items */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            {/* Checkbox */}
            <rect
              x="100"
              y={140 + i * 32}
              width="18"
              height="18"
              rx="4"
              fill={i < 3 ? '#12372A' : '#E2E5EA'}
            />
            {/* Checkmark for completed */}
            {i < 3 && (
              <path
                d={`M ${104} ${149 + i * 32} l 4 4 l 6 -7`}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Item text */}
            <rect
              x="128"
              y={145 + i * 32}
              width={i < 3 ? 110 : 90}
              height="7"
              rx="3.5"
              fill={i < 3 ? '#3D4350' : '#B0B8C4'}
            />
          </g>
        ))}

        {/* Progress bar section */}
        <rect x="100" y="305" width="160" height="6" rx="3" fill="#E2E5EA" />
        <rect x="100" y="305" width="112" height="6" rx="3" fill="#12372A" />
        <rect x="268" y="302" width="30" height="12" rx="6" fill="#D8EBDD" />
        <rect x="273" y="305" width="20" height="6" rx="3" fill="#12372A" opacity="0.6" />

        {/* Badge / status pill */}
        <rect x="255" y="68" width="90" height="28" rx="14" fill="white" />
        <rect x="255" y="68" width="90" height="28" rx="14" stroke="#E2E5EA" strokeWidth="1.5" />
        <circle cx="271" cy="82" r="5" fill="#4D96FF" />
        <rect x="281" y="78" width="50" height="8" rx="4" fill="#3D4350" />

        {/* Floating mini card */}
        <rect x="290" y="200" width="90" height="70" rx="10" fill="white" />
        <rect x="290" y="200" width="90" height="70" rx="10" stroke="#E2E5EA" strokeWidth="1.5" />
        <rect x="302" y="213" width="40" height="6" rx="3" fill="#3D4350" />
        <rect x="302" y="225" width="55" height="5" rx="2.5" fill="#B0B8C4" />
        <rect x="302" y="240" width="30" height="14" rx="4" fill="#F4A261" />
        <rect x="307" y="244" width="20" height="6" rx="3" fill="white" />

        {/* Decorative dots */}
        <circle cx="60" cy="60" r="6" fill="#D8EBDD" />
        <circle cx="380" cy="320" r="8" fill="#12372A" opacity="0.12" />
        <circle cx="380" cy="60" r="4" fill="#D8EBDD" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={`${styles.inner} container`}>
        <div className={styles.content}>
          <p className="section-label">Service Applications, Simplified</p>
          <h1 id="hero-heading" className={styles.heading}>
            Your services,
            <br />
            <span className={styles.headingAccent}>managed in one place.</span>
          </h1>
          <p className={styles.description}>
            Amman Communications gives you a single, secure platform to create
            applications, upload required documents, and track your progress —
            every step of the way.
          </p>
          <div className={styles.ctas}>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link href="/#services" className="btn btn-outline">
              Explore Services
            </Link>
          </div>
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
}
