import { NextAuthOptions } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchWithAuth(url: string, options: RequestInit = {}, session: any) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  symptoms: {
    list: (session: any) => fetchWithAuth('/api/symptoms', { method: 'GET' }, session),
    create: (data: any, session: any) => fetchWithAuth('/api/symptoms', { method: 'POST', body: JSON.stringify(data) }, session),
    update: (id: string, data: any, session: any) => fetchWithAuth(`/api/symptoms/${id}`, { method: 'PUT', body: JSON.stringify(data) }, session),
    delete: (id: string, session: any) => fetchWithAuth(`/api/symptoms/${id}`, { method: 'DELETE' }, session),
  },
  patterns: {
    analyze: (symptoms: any[], session: any) => fetchWithAuth('/api/patterns/analyze', { method: 'POST', body: JSON.stringify({ symptoms }) }, session),
    summary: (symptoms: any[], session: any) => fetchWithAuth('/api/patterns/summary', { method: 'GET', body: JSON.stringify({ symptoms }) }, session),
  },
};