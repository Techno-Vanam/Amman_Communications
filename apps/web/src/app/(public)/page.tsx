import Hero from '@/components/landing/Hero';
import TrustSection from '@/components/landing/TrustSection';
import ServicesSection from '@/components/landing/ServicesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TrackingCTA from '@/components/landing/TrackingCTA';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTA from '@/components/landing/FinalCTA';

export const metadata = {
  title: 'Amman Communications | Platform',
  description:
    'The unified platform for managing your service applications safely, securely, and efficiently.',
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustSection />
      <ServicesSection />
      <HowItWorks />
      <BenefitsSection />
      <TrackingCTA />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
