'use server';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:3003';

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNotificationsAction() {
  try {
    const authHeader = await getAuthHeader();
    if (!authHeader.Authorization) return { success: false, data: [] };

    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { ...authHeader },
      cache: 'no-store',
    });

    if (!res.ok) return { success: false, data: [] };
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    const authHeader = await getAuthHeader();
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...authHeader },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const authHeader = await getAuthHeader();
    await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: { ...authHeader },
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
