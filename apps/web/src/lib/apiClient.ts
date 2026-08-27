const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003/api/v1';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Try reading from localStorage first
  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;

  // 2. Fallback: Try reading from document.cookie
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  if (match && match[1]) return decodeURIComponent(match[1]);

  return null;
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
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const primaryUrl = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      document.cookie = 'access_token=; Max-Age=0; path=/;';
      window.location.href = '/login?expired=true';
    }

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
