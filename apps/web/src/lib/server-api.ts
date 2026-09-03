import { getAccessToken } from './server-auth';

const API_BASE = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:3003'
)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

export async function serverFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const token = await getAccessToken();
  const cleanPath = path.replace(/^\/?(api\/v1|v1)\/?/, '').replace(/^\/+/, '');
  const url = `${API_BASE}/api/v1/${cleanPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, cache: 'no-store' });
  } catch (_err) {
    const fallbackUrl = url.includes('localhost')
      ? url.replace('localhost', '127.0.0.1')
      : url.replace('127.0.0.1', 'localhost');
    try {
      res = await fetch(fallbackUrl, { ...options, headers, cache: 'no-store' });
    } catch (_fallbackErr) {
      return { ok: false, status: 503, error: 'Backend service unavailable' };
    }
  }

  const contentType = res.headers.get('content-type');
  let data: any = null;
  if (contentType?.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? Array.isArray(data.message)
          ? data.message.join(', ')
          : String(data.message)
        : `Request failed with status ${res.status}`;
    return { ok: false, status: res.status, error: message, data };
  }

  return { ok: true, status: res.status, data };
}
