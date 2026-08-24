export interface Service {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface ServicesResponse {
  data: Service[];
}


// Temporary mock data since backend API is not implemented yet
const MOCK_SERVICES: Service[] = [
  {
    id: 'srv_1',
    name: 'New Installation',
    description: 'Request a new service installation for your premises. Includes site survey and equipment setup.',
    category: 'Installation'
  },
  {
    id: 'srv_2',
    name: 'Service Relocation',
    description: 'Move your existing service to a new address with minimal downtime and disruption.',
    category: 'Modifications'
  },
  {
    id: 'srv_3',
    name: 'Bandwidth Upgrade',
    description: 'Upgrade your current connection speed to support higher data demands and more devices.',
    category: 'Upgrades'
  },
  {
    id: 'srv_4',
    name: 'Equipment Replacement',
    description: 'Request replacement for faulty, damaged, or outdated communication equipment.',
    category: 'Maintenance'
  },
  {
    id: 'srv_5',
    name: 'Technical Inspection',
    description: 'Schedule a thorough on-site technical inspection to diagnose connectivity issues.',
    category: 'Support'
  },
  {
    id: 'srv_6',
    name: 'Account Transfer',
    description: 'Transfer ownership of an active service account to a different individual or entity.',
    category: 'Administration'
  }
];

/**
 * Fetch available services from the API.
 * Returns null on any failure so the UI can show an appropriate fallback.
 */
export async function fetchServices(): Promise<Service[] | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_SERVICES;
}
