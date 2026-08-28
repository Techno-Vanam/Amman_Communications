'use client';

import { apiClient } from './apiClient';
import { getInMemoryAccessToken, setInMemoryAccessToken } from './auth-context';

export function getCustomerToken(): string | null {
  return getInMemoryAccessToken();
}

export function setCustomerToken(token: string) {
  if (typeof window !== 'undefined') {
    setInMemoryAccessToken(token);
  }
}

export function clearCustomerToken() {
  if (typeof window !== 'undefined') {
    setInMemoryAccessToken(null);
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getInMemoryAccessToken();
}

export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    setInMemoryAccessToken(token);
  }
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    setInMemoryAccessToken(null);
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Network request failed';
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; error?: unknown }> {
  try {
    return { success: true, data: await apiClient<T>(endpoint, options) };
  } catch (err: unknown) {
    console.error('API Request failed:', err);
    return {
      success: false,
      message: errorMessage(err),
    };
  }
}

export async function adminApiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; message?: string; error?: unknown }> {
  try {
    return { success: true, data: await apiClient<T>(endpoint, options) };
  } catch (err: unknown) {
    console.error('Admin API Request failed:', err);
    return {
      success: false,
      message: errorMessage(err),
    };
  }
}
