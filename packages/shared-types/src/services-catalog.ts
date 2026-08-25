export interface RequiredDocumentSpec {
  type: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
}

export interface ServiceDefinition {
  id: string;
  code: string;
  title: string;
  category: string;
  tagline: string;
  icon: string;
  estimatedProcessingDays: string;
  description: string;
  requiredDocuments: RequiredDocumentSpec[];
}

export const SERVICES_CATALOG: ServiceDefinition[] = [
  {
    id: 'passport-services',
    code: 'PASSPORT_SERVICE',
    title: 'Passport Application & Renewal',
    category: 'Travel & Identity',
    tagline: 'Fresh passport issuance, renewal, ECR deletion, and address changes.',
    icon: '🛂',
    estimatedProcessingDays: '7-14 Days',
    description: 'Complete assistance for fresh Indian/International passport issuance, renewal of expired passports, tatkaal services, and name/address modifications.',
    requiredDocuments: [
      {
        type: 'NATIONAL_ID_PROOF',
        name: 'National ID Proof (Aadhaar / Voter ID)',
        description: 'Clear color scan of Aadhaar card, Voter ID, or Driving License showing date of birth and full name.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'ADDRESS_PROOF',
        name: 'Proof of Address (Utility Bill / Bank Passbook)',
        description: 'Electricity bill, piped gas bill, water bill, or bank passbook with photo from past 3 months.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'BIRTH_PROOF',
        name: 'Proof of Date of Birth',
        description: 'Birth Certificate issued by municipal authority, PAN card, or 10th Standard School Leaving Certificate.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'PASSPORT_PHOTO',
        name: 'Passport Size Photograph',
        description: 'Recent 35x45mm studio color photograph with white background, 80% face coverage, no glare.',
        required: true,
        acceptedFormats: ['JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'OLD_PASSPORT_COPY',
        name: 'Old Passport Booklet Scan (If Renewal)',
        description: 'First two and last two pages with ECR/Non-ECR page of your previous passport booklet.',
        required: false,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
    ],
  },
  {
    id: 'visa-immigration',
    code: 'VISA_SERVICE',
    title: 'Tourist & Business Visa Processing',
    category: 'Immigration & Travel',
    tagline: 'Fast-track visa consultation, document preparation, and submission.',
    icon: '✈️',
    estimatedProcessingDays: '5-10 Days',
    description: 'End-to-end visa assistance for Schengen, USA, UK, UAE, Singapore, Malaysia, Canada, and Gulf countries.',
    requiredDocuments: [
      {
        type: 'PASSPORT_SCAN',
        name: 'Original Passport Scan (6+ Months Validity)',
        description: 'Color scan of all bio-data pages and blank stamp pages with at least 6 months validity.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'PHOTOGRAPH',
        name: 'Visa Specification Photograph',
        description: 'Recent color photograph matching specific destination country dimensions (white/light gray background).',
        required: true,
        acceptedFormats: ['JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'BANK_STATEMENT',
        name: 'Bank Statement (Last 6 Months)',
        description: 'Duly attested and signed 6-month original bank statement showing adequate travel funds.',
        required: true,
        acceptedFormats: ['PDF'],
        maxSizeMb: 10,
      },
      {
        type: 'EMPLOYMENT_PROOF',
        name: 'Employment / Business Letter / NOC',
        description: 'Company NOC letter, latest 3 salary slips, business registration, or leave sanction letter.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'TRAVEL_ITINERARY',
        name: 'Flight Itinerary & Hotel Booking',
        description: 'Confirmed round-trip flight booking and hotel accommodation confirmation.',
        required: false,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
    ],
  },
  {
    id: 'company-registration',
    code: 'COMPANY_REGISTRATION',
    title: 'Company Registration & Trade License',
    category: 'Corporate & Business',
    tagline: 'Pvt Ltd, LLP, Partnership, MSME Udyam, and Municipal Trade Licensing.',
    icon: '🏢',
    estimatedProcessingDays: '7-12 Days',
    description: 'Complete corporate incorporation, GST registration, PAN/TAN, MSME certification, and local municipal trade license issuance.',
    requiredDocuments: [
      {
        type: 'DIRECTOR_PAN_ID',
        name: 'Directors PAN & Identity Proof',
        description: 'PAN Card and Aadhaar/Passport of all proposed directors and shareholders.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'DIRECTOR_ADDRESS_PROOF',
        name: 'Directors Residential Address Proof',
        description: 'Bank statement or electricity bill in director name (not older than 2 months).',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'REGISTERED_OFFICE_PROOF',
        name: 'Registered Office Address Proof',
        description: 'Electricity bill, property tax receipt, or ownership deed of registered commercial space.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'LANDLORD_NOC',
        name: 'No Objection Certificate (NOC) from Owner',
        description: 'Signed NOC from property owner consenting to business registration at the premise.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'SPECIMEN_SIGNATURE',
        name: 'Specimen Signature & Digital Consent',
        description: 'Signed director specimen document on white paper.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
    ],
  },
  {
    id: 'citizen-services',
    code: 'CITIZEN_SERVICES',
    title: 'Aadhaar, PAN & Government Citizen Services',
    category: 'Citizen & Identity',
    tagline: 'Aadhaar updates, PAN card generation, Voter ID, and certificate services.',
    icon: '🪪',
    estimatedProcessingDays: '3-7 Days',
    description: 'Instant assistance for government ID enrollments, biometric/demographic updates, duplicate card requests, and linkings.',
    requiredDocuments: [
      {
        type: 'POI_PROOF',
        name: 'Proof of Identity (POI)',
        description: 'Government photo ID such as Driving License, Ration Card with photo, or Passport.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'POA_PROOF',
        name: 'Proof of Address (POA)',
        description: 'Utility bill, bank statement, or registered rental agreement in applicant name.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
      {
        type: 'DOB_PROOF',
        name: 'Proof of Date of Birth (PDB)',
        description: 'Birth Certificate, SSLC/10th mark certificate, or verified hospital birth record.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG', 'WEBP'],
        maxSizeMb: 10,
      },
    ],
  },
  {
    id: 'document-attestation',
    code: 'DOCUMENT_ATTESTATION',
    title: 'Legal Attestation, Apostille & Embassy Stamping',
    category: 'Legal & Verification',
    tagline: 'MEA Apostille, HRD Attestation, Notary, and Embassy legalization.',
    icon: '📜',
    estimatedProcessingDays: '4-8 Days',
    description: 'Official authentication for educational degrees, birth/marriage certificates, commercial invoices, and power of attorney for overseas use.',
    requiredDocuments: [
      {
        type: 'ORIGINAL_CERTIFICATE',
        name: 'Original Certificate Scan (Front & Back)',
        description: 'High resolution color scan of the complete original document with all prior stamps.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'PASSPORT_COPY',
        name: 'Applicant Passport Copy',
        description: 'Color copy of applicant passport first and last pages.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
      {
        type: 'AUTHORIZATION_LETTER',
        name: 'Signed Authorization Letter',
        description: 'Signed letter authorizing Amman Communications to submit documents on applicant behalf.',
        required: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMb: 10,
      },
    ],
  },
];
