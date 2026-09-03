import { cookies } from 'next/headers';
import { getAccessToken } from './server-auth';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://127.0.0.1:3003';

export async function getAuthHeader(): Promise<Record<string, string>> {
  const token = (await getAccessToken()) || (await cookies()).get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function serverApiFetch(path: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const endpoint = normalizedPath.startsWith('/api/v1')
    ? normalizedPath
    : `/api/v1${normalizedPath}`;

  const defaultHeaders: Record<string, string> = {
    ...authHeader,
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> || {}),
    },
    cache: 'no-store',
  });
}
