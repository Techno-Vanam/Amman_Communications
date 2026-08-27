import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { TrustStats } from './components/TrustStats';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { QuickEstimateModal } from './components/QuickEstimateModal';
import { AppointmentModal } from './components/AppointmentModal';
import { LoginPlaceholder } from './components/LoginPlaceholder';
import { ServiceItem } from './types/landing';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'login' | 'signup'>('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Sync route with window pathname/hash for standard browser navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/login' || hash === '#/login' || hash === '#login') {
        setCurrentRoute('login');
      } else if (path === '/signup' || hash === '#/signup' || hash === '#signup') {
        setCurrentRoute('signup');
      } else {
        setCurrentRoute('landing');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: 'landing' | 'login' | 'signup') => {
    setCurrentRoute(route);
    if (route === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (route === 'signup') {
      window.history.pushState({}, '', '/signup');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

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

  // If viewing Login or Signup route page
  if (currentRoute === 'login' || currentRoute === 'signup') {
    return (
      <LoginPlaceholder
        mode={currentRoute}
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-brand-600 selection:text-white flex flex-col justify-between">
      {/* Sticky Header Navbar */}
      <Navbar
        onOpenModal={handleOpenModal}
        onNavigateLogin={() => navigateTo('login')}
        onNavigateSignUp={() => navigateTo('signup')}
      />

      {/* Main Page Content */}
      <main className="flex-grow">
        <Hero
          onOpenAppointmentModal={handleOpenAppointmentModal}
        />
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
};

export default App;
