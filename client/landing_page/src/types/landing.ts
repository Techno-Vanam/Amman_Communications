export interface ServiceItem {
  id: string;
  title: string;
  category: 'Registration' | 'Verification' | 'Applications' | 'Certificates' | 'Consultation';
  shortDesc: string;
  fullDesc: string;
  features: string[];
  processingTime: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
}

export interface ProcessStep {
  stepNumber: string;
  title: string;
  summary: string;
  details: string[];
  iconName: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlightText: string;
}

export interface StatItem {
  value: string;
  label: string;
  helperText: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Documentation' | 'Timeline & Status' | 'Fees & Billing';
}

export interface EstimateFormData {
  serviceType: string;
  urgency: 'Standard (3-5 days)' | 'Express (24-48 hrs)' | 'Immediate Assistance';
  documentCount: string;
  applicantType: 'Individual' | 'Commercial / Business' | 'Legal Representative';
  name: string;
  phone: string;
  email: string;
  notes: string;
}
