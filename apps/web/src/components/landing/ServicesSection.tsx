'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchServices, type Service } from '@/lib/api/services';
import styles from './ServicesSection.module.css';

function ServiceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonIcon} />
      <div className={styles.skeletonLine} style={{ width: '60%', height: '1.1rem' }} />
      <div className={styles.skeletonLine} style={{ width: '90%' }} />
      <div className={styles.skeletonLine} style={{ width: '75%' }} />
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>
        <ServiceIcon />
      </div>
      <h3 className={styles.cardTitle}>{service.name}</h3>
      <p className={styles.cardDescription}>{service.description}</p>
      <Link href={`/services/${service.id}`} className={styles.cardLink} aria-label={`View details for ${service.name}`}>
        View Details
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className={styles.emptyTitle}>Services coming soon</p>
      <p className={styles.emptyDescription}>
        Our available services will appear here. Contact us to learn more about what we offer.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.errorState}>
      <p className={styles.errorText}>
        Unable to load services at the moment.
      </p>
      <button onClick={onRetry} className="btn btn-outline">
        Try Again
      </button>
    </div>
  );
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [state, setState] = useState<FetchState>('loading');

  const load = () => {
    setState('loading');
    fetchServices().then((result) => {
      if (result === null) {
        setState('error');
      } else {
        setServices(result);
        setState('success');
      }
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section
      id="services"
      className={styles.section}
      aria-labelledby="services-heading"
    >
      <div className={`${styles.inner} container`}>
        <div className={styles.header}>
          <p className="section-label">What We Offer</p>
          <h2 id="services-heading" className="section-heading">
            Services designed around your needs
          </h2>
          <p className="section-subheading">
            Browse the services available through the Amman Communications
            platform and start your application today.
          </p>
        </div>

        {state === 'loading' && (
          <div className={styles.grid} aria-busy="true" aria-label="Loading services">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {state === 'success' && services.length === 0 && <EmptyState />}

        {state === 'success' && services.length > 0 && (
          <div className={styles.grid}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {state === 'error' && <ErrorState onRetry={load} />}
      </div>
    </section>
  );
}
