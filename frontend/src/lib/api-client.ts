import { getAuthToken } from './auth-storage';

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

interface RequestParams extends RequestInit {}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse server response');
  }
}

async function request<T>(path: string, { headers, ...init }: RequestParams = {}): Promise<T> {
  const url = `${DEFAULT_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const token = getAuthToken();

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
      credentials: 'include',
    });

    const body = await parseJson(response);

    if (!response.ok) {
      const message =
        (body && (body.message || body.error)) ||
        `Request to ${url} failed with status ${response.status}`;
      throw new Error(message);
    }

    return (body?.data ?? body) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: <T>(path: string, params?: RequestParams) =>
    request<T>(path, { ...params, method: 'GET' }),
  post: <T>(path: string, body: unknown, params?: RequestParams) =>
    request<T>(path, {
      ...params,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown, params?: RequestParams) =>
    request<T>(path, {
      ...params,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string, params?: RequestParams) =>
    request<T>(path, { ...params, method: 'DELETE' }),
};

export const API_DEFAULTS = {
  baseUrl: DEFAULT_API_BASE_URL,
};
