import { getAuthToken } from '../utils/storage';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const apiClient = {
  get(url: string): Promise<Response> {
    return fetch(url, { method: 'GET', headers: authHeaders() });
  },

  post(url: string, body: unknown): Promise<Response> {
    return fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  },

  put(url: string, body: unknown): Promise<Response> {
    return fetch(url, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  },

  delete(url: string): Promise<Response> {
    return fetch(url, { method: 'DELETE', headers: authHeaders() });
  },
};
