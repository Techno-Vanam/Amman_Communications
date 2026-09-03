import { getInMemoryAccessToken, setInMemoryAccessToken } from './auth-context';

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          setInMemoryAccessToken(null);
          return null;
        }
        const session = (await response.json()) as { accessToken?: string };
        const token = session.accessToken ?? null;
        setInMemoryAccessToken(token);
        return token;
      })
      .catch(() => {
        setInMemoryAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
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

  const primaryUrl = endpoint.startsWith('http')
    ? endpoint
    : endpoint.startsWith('/api/')
      ? endpoint
      : `/api/v1/${endpoint.replace(/^\/?(api\/v1|v1)\/?/, '').replace(/^\/+/, '')}`;

  let response: Response;

  try {
    response = await fetch(primaryUrl, {
      ...options,
      credentials: 'include',
      headers,
    });
  } catch (primaryErr) {
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

  // Response interceptor: automatically catch 401, perform silent refresh, and retry
  if (!response.ok && response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${refreshedToken}` };
      return apiClient<T>(endpoint, { ...options, headers: retryHeaders });
    }
  }

  const contentType = response.headers.get('content-type');
  let data: unknown = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
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
