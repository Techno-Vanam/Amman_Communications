import { ServiceItem, ProcessStep, BenefitItem, StatItem, FAQItem } from '../types/landing';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'prop-reg',
    title: 'Property Registration Assistance',
    category: 'Registration',
    shortDesc: 'Comprehensive guidance and documentation handling for property deeds, titles, and land records.',
    fullDesc: 'End-to-end consultancy for smooth property registration. We assist in title verification, deed drafting, stamp duty calculation, and scheduling appointment slots with registrar offices.',
    features: [
      'Encumbrance & Title Search Report guidance',
      'Deed Drafting & Review by domain specialists',
      'Stamp Duty & Tax calculation support',
      'Slot Booking & Token Assistance'
    ],
    processingTime: '2 - 4 Business Days',
    iconName: 'Building2',
    badge: 'High Demand',
    popular: true
  },
  {
    id: 'doc-verify',
    title: 'Document Verification Consultancy',
    category: 'Verification',
    shortDesc: 'Rigorous legal & administrative verification of essential documents prior to formal submission.',
    fullDesc: 'Mitigate risk and prevent application rejections with our multi-point document check. We review land records, identity proofs, NOCs, and affidavits against statutory guidelines.',
    features: [
      'Comprehensive Checklist Audit',
      'Discrepancy Identification & Rectification',
      'Notary & Attestation Guidance',
      'Affidavit & Declaration Drafting'
    ],
    processingTime: '24 - 48 Hours',
    iconName: 'ShieldCheck',
    popular: true
  },
  {
    id: 'online-app',
    title: 'Online Portal Application Processing',
    category: 'Applications',
    shortDesc: 'Expert assistance for filing complex government and municipal e-services applications.',
    fullDesc: 'Filing online applications can be cumbersome due to strict document formatting and technical steps. We manage the digital submission process from start to finish.',
    features: [
      'Digital Form Filling & Uploading',
      'File Compression & Format Standardization',
      'Real-time Application Status Monitoring',
      'Acknowledgement & Receipt Archiving'
    ],
    processingTime: '1 - 2 Business Days',
    iconName: 'FileSpreadsheet'
  },
  {
    id: 'cert-assist',
    title: 'Certificates & Attestation Support',
    category: 'Certificates',
    shortDesc: 'Streamlined application assistance for essential legal, commercial, and personal certificates.',
    fullDesc: 'Acquire official certificates with minimal hassle. We guide you through prerequisite preparation for birth, income, encumbrance, and business registration certificates.',
    features: [
      'Prerequisite Document Mapping',
      'Application Drafting & Submission',
      'Tracking & Follow-up Guidance',
      'Certified Copy Retrieval Assistance'
    ],
    processingTime: '3 - 5 Business Days',
    iconName: 'Award'
  },
  {
    id: 'doc-consult',
    title: '1-on-1 Document Consultation',
    category: 'Consultation',
    shortDesc: 'Personalized advisory sessions with senior consultants to evaluate your document workflow.',
    fullDesc: 'Unsure about missing records or legal requirements? Schedule a dedicated consultation session with our expert advisors to map out a clear action plan.',
    features: [
      'In-depth Document Audit',
      'Custom Step-by-Step Action Plan',
      'Legal & Compliance Risk Assessment',
      'Dedicated Case Manager Support'
    ],
    processingTime: 'Same-day Appointments Available',
    iconName: 'UserCheck',
    popular: true
  },
  {
    id: 'reg-assist',
    title: 'Business & Commercial Registration',
    category: 'Registration',
    shortDesc: 'Consultancy for trade licenses, MSME registration, GST paperwork, and shop act filings.',
    fullDesc: 'Establish your commercial operations effortlessly. We handle paperwork preparation and digital filing for enterprise registrations and commercial licenses.',
    features: [
      'Entity Name Availability Check',
      'MOU & Agreement Standardization',
      'Commercial Address Verification Prep',
      'Filing with Relevant Authorities'
    ],
    processingTime: '3 - 7 Business Days',
    iconName: 'Briefcase'
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Submit Requirements',
    summary: 'Share details of your registration or document assistance requirement via our secure intake form or consultation desk.',
    details: [
      'Select your required service category',
      'Provide basic applicant & property/entity context',
      'Receive an immediate document checklist'
    ],
    iconName: 'FileText'
  },
  {
    stepNumber: '02',
    title: 'Document Upload & Review',
    summary: 'Upload scanned copies of relevant records. Our specialists perform a preliminary verification check.',
    details: [
      'Secure encrypted upload portal',
      'Verification against standard regulatory criteria',
      'Instant alert on missing or illegible documents'
    ],
    iconName: 'UploadCloud'
  },
  {
    stepNumber: '03',
    title: 'Processing & Verification',
    summary: 'Our team drafts necessary deeds, verifies compliance, files online submissions, and schedules appointments.',
    details: [
      'Professional legal deed & affidavit drafting',
      'Pre-registration audit by senior consultants',
      'Appointment slot coordination with offices'
    ],
    iconName: 'Cpu'
  },
  {
    stepNumber: '04',
    title: 'Completion & Tracking',
    summary: 'Receive completed documentation, filing receipts, and final certificates with full transparency.',
    details: [
      'Real-time status updates via SMS/Email',
      'Secure digital dispatch & physical delivery support',
      'Archived digital copies for future reference'
    ],
    iconName: 'CheckCircle2'
  }
];

export const BENEFITS_DATA: BenefitItem[] = [
  {
    id: 'b1',
    title: 'Secure Document Handling',
    description: 'Strict confidentiality protocols and encrypted data storage protect all personal and property records.',
    iconName: 'Lock',
    highlightText: 'Confidential & Encrypted'
  },
  {
    id: 'b2',
    title: 'Transparent Process',
    description: 'No hidden charges or unexpected delays. We provide upfront timelines and clear fee breakdowns.',
    iconName: 'Eye',
    highlightText: 'Clear Upfront Guidance'
  },
  {
    id: 'b3',
    title: 'Easy Application Tracking',
    description: 'Stay updated at every step with regular milestone updates on your application progress.',
    iconName: 'Activity',
    highlightText: 'Real-time Updates'
  },
  {
    id: 'b4',
    title: 'Professional Assistance',
    description: 'Experienced documentation specialists review every detail to minimize error rates and rejections.',
    iconName: 'UserCheck',
    highlightText: '12+ Yrs Experience'
  },
  {
    id: 'b5',
    title: 'Reduced Paperwork Burden',
    description: 'We handle formatting, drafting, and portal submissions so you don\'t have to deal with complex procedures.',
    iconName: 'Sparkles',
    highlightText: 'Stress-free Filing'
  },
  {
    id: 'b6',
    title: 'Reliable Service Delivery',
    description: 'Proven track record of dependable turnarounds and dedicated client support whenever you need help.',
    iconName: 'Clock',
    highlightText: 'Timely Execution'
  }
];

export const STATS_DATA: StatItem[] = [
  {
    value: '15,000+',
    label: 'Applications Assisted',
    helperText: 'Successfully guided applicants across property & certificate documentation',
    iconName: 'CheckSquare'
  },
  {
    value: '99.4%',
    label: 'Verification Accuracy',
    helperText: 'Meticulous pre-audit ensures minimal document rejection rates',
    iconName: 'ShieldAlert'
  },
  {
    value: '12+ Years',
    label: 'Domain Experience',
    helperText: 'Deep consultancy knowledge across regional registration norms',
    iconName: 'Building'
  },
  {
    value: '24/7',
    label: 'Client Assistance',
    helperText: 'Responsive consultation and status tracking desk',
    iconName: 'Headphones'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'Is TechnoVanam Communications a government office?',
    answer: 'No. TechnoVanam Communications is an independent professional consultancy and business service provider. We offer expert documentation, application filing assistance, deed drafting, and procedural guidance to help clients navigate official processes smoothly.'
  },
  {
    id: 'faq-2',
    category: 'Documentation',
    question: 'What documents do I need to bring for Property Registration Consultancy?',
    answer: 'Requirements vary depending on the transaction type (sale, gift, partition, lease). Generally, you need parent title deeds, encumbrance certificates, ID proofs (Aadhaar/PAN), tax receipts, and site layout plans. Our team provides an exact checklist during your initial consultation.'
  },
  {
    id: 'faq-3',
    category: 'Timeline & Status',
    question: 'How long does document verification typically take?',
    answer: 'Standard document verification is completed within 24 to 48 hours. If extensive historical title search or certified copy retrieval is required, it may take 2 to 4 business days.'
  },
  {
    id: 'faq-4',
    category: 'General',
    question: 'Can you assist with online e-services applications remotely?',
    answer: 'Yes! Most of our application assistance services can be completed digitally. You can securely send scanned documents via email or our intake portal, and our consultants will manage the submission and track progress for you.'
  },
  {
    id: 'faq-5',
    category: 'Fees & Billing',
    question: 'How are your consultancy fees structured?',
    answer: 'We maintain 100% transparency. Our service charges are fixed based on the type and complexity of the documentation required. All government fees, stamp duties, and registration charges are billed at actual cost with official receipts provided.'
  },
  {
    id: 'faq-6',
    category: 'Documentation',
    question: 'What happens if a discrepancy is found during document verification?',
    answer: 'If our specialists identify missing links, spelling variations, or missing NOCs, we guide you through obtaining rectification deeds, affidavits, or supplementary certificates before submitting to official authorities.'
  }
];
