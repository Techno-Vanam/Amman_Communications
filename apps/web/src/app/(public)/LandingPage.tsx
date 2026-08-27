'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/landing/Navbar';
import { Hero } from '../../components/landing/Hero';
import { ServicesSection } from '../../components/landing/ServicesSection';
import { HowItWorks } from '../../components/landing/HowItWorks';
import { WhyChooseUs } from '../../components/landing/WhyChooseUs';
import { TrustStats } from '../../components/landing/TrustStats';
import { FAQSection } from '../../components/landing/FAQSection';
import { ContactSection } from '../../components/landing/ContactSection';
import { Footer } from '../../components/landing/Footer';
import { QuickEstimateModal } from '../../components/landing/QuickEstimateModal';
import { AppointmentModal } from '../../components/landing/AppointmentModal';
import { ServiceItem } from '../../types/landing';

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleOpenModal = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-brand-600 selection:text-white flex flex-col justify-between">
      {/* Sticky Header Navbar */}
      <Navbar
        onOpenModal={handleOpenModal}
        onNavigateLogin={() => router.push('/login')}
        onNavigateSignUp={() => router.push('/register')}
      />

      {/* Main Page Content */}
      <main className="flex-grow">
        <Hero onOpenAppointmentModal={handleOpenAppointmentModal} />
        <ServicesSection onSelectService={handleSelectService} />
        <HowItWorks onOpenModal={handleOpenModal} />
        <WhyChooseUs />
        <TrustStats />
        <FAQSection />
        <ContactSection />
      </main>

      {/* Multi-column Footer */}
      <Footer />

      {/* Interactive Consultation / Quick Estimate Modal */}
      <QuickEstimateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialService={selectedService}
      />

      {/* Dedicated Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </div>
  );
}
