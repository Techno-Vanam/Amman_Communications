'use client';

// Empty string = same-origin; Next.js rewrites /api/* → http://localhost:3003/api/*
// This avoids all cross-origin / CORS issues in the browser.
const API_BASE = '';

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('amman_customer_token');
}

export function setCustomerToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('amman_customer_token', token);
    document.cookie = `customer_access_token=${token}; path=/; max-age=604800`;
  }
}

export function clearCustomerToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('amman_customer_token');
    document.cookie = 'customer_access_token=; path=/; max-age=0';
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('amman_admin_token');
}

export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('amman_admin_token', token);
  }
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('amman_admin_token');
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = getCustomerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    
    if (res.ok) {
      // If backend already returns { success, data }, don't double wrap
      if (data && typeof data === 'object' && 'success' in data) {
        return data;
      }
      return { success: true, data };
    } else {
      return { success: false, message: data?.message || data?.error || 'Request failed', error: data };
    }
  } catch (err: any) {
    console.error('API Request failed:', err);
    return {
      success: false,
      message: err?.message || 'Network request failed',
    };
  }
}

export async function adminApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Remove Content-Type if it's explicitly undefined (e.g. for FormData)
  if (headers['Content-Type'] === 'undefined' || headers['Content-Type'] === undefined) {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (res.ok) {
      // If backend already returns { success, data }, don't double wrap
      if (data && typeof data === 'object' && 'success' in data) {
        return data;
      }
      return { success: true, data };
    } else {
      return { success: false, message: data?.message || data?.error || 'Request failed', error: data };
    }
  } catch (err: any) {
    console.error('Admin API Request failed:', err);
    return {
      success: false,
      message: err?.message || 'Network request failed',
    };
  }
}
