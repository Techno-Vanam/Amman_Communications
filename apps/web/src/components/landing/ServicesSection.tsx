'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, FileText } from 'lucide-react';
import { fetchServices, type Service } from '@/lib/api/services';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 animate-pulse" aria-hidden="true">
      <div className="w-10 h-10 rounded-xl bg-gray-100" />
      <div className="h-4 bg-gray-100 rounded-full w-3/5" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="h-3 bg-gray-100 rounded-full w-4/5" />
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 group">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center group-hover:bg-brand-700 group-hover:text-white transition-colors duration-200">
        <Layers size={22} strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
      <p className="text-sm text-gray-500 leading-relaxed flex-1">{service.description}</p>
      <Link
        href={`/services/${service.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors duration-150 mt-1"
        aria-label={`View details for ${service.name}`}
      >
        View Details
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-400 flex items-center justify-center">
        <FileText size={36} strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-gray-800">Services coming soon</p>
      <p className="text-sm text-gray-500 max-w-sm">
        Our available services will appear here. Contact us to learn more about what we offer.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-sm text-gray-500">Unable to load services at the moment.</p>
      <button
        onClick={onRetry}
        className="px-5 py-2 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors duration-150"
      >
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

  useEffect(() => { load(); }, []);

  return (
    <section id="services" className="bg-gray-50 py-24" aria-labelledby="services-heading">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-500 mb-3">What We Offer</p>
          <h2 id="services-heading" className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Services designed around your needs
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Browse the services available through the Amman Communications
            platform and start your application today.
          </p>
        </div>

        {state === 'loading' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading services">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {state === 'success' && services.length === 0 && <EmptyState />}
        {state === 'success' && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        )}
        {state === 'error' && <ErrorState onRetry={load} />}
      </div>
    </section>
  );
}
