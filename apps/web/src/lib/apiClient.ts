import { getInMemoryAccessToken, setInMemoryAccessToken } from './auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003/api/v1';
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return null;
        const session = (await response.json()) as { accessToken?: string };
        const token = session.accessToken ?? null;
        setInMemoryAccessToken(token);
        return token;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getInMemoryAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let primaryUrl: string;
  if (endpoint.startsWith('http')) {
    primaryUrl = endpoint;
  } else if (normalizedEndpoint.startsWith('/api/v1')) {
    primaryUrl = `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}${normalizedEndpoint}`;
  } else {
    primaryUrl = `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/api/v1${normalizedEndpoint}`;
  }

  let response: Response;

  try {
    response = await fetch(primaryUrl, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (primaryErr) {
    // If localhost failed due to IPv6 connection issues, retry with 127.0.0.1
    if (primaryUrl.includes('localhost')) {
      const fallbackUrl = primaryUrl.replace('localhost', '127.0.0.1');
      try {
        response = await fetch(fallbackUrl, {
          ...options,
          credentials: 'include',
          headers,
        });
      } catch {
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }

  const contentType = response.headers.get('content-type');
  let data: unknown = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok && response.status === 401 && !endpoint.includes('/auth/refresh')) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${refreshedToken}` };
      return apiClient<T>(endpoint, { ...options, headers: retryHeaders });
    }
  }

  if (!response.ok) {

    const errorMessage =
      data && typeof data === 'object' && 'message' in data && (data as { message: unknown }).message
        ? Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message).join(', ')
          : String((data as { message: unknown }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}
