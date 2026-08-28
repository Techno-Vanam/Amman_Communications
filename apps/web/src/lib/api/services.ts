export interface Service {
  id: string;
  name: string;
  description: string;
  category?: string;
  governmentFee?: number;
  serviceFee?: number;
  totalFee?: number;
  estimatedTime?: string;
  status?: string;
}

export interface ServicesResponse {
  data: Service[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  'http://localhost:3003';

/**
 * Fetch available services from the API.
 * Returns null or empty array on any failure.
 */
export async function fetchServices(): Promise<Service[] | null> {
  try {
    let res = await fetch(`${API_BASE_URL}/v1/customer/services`, {
      cache: 'no-store',
    });

    if (res.status === 404) {
      res = await fetch(`${API_BASE_URL}/api/v1/customer/services`, {
        cache: 'no-store',
      });
    }

    if (!res.ok) {
      return [];
    }

    const data = await res.json().catch(() => ({}));
    const payload = data.data || data;
    return Array.isArray(payload) ? payload : [];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}
