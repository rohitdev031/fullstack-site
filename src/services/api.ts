const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

async function request<T>(endpoint: string, init: RequestInit, fallback: T): Promise<T> {
  if (!apiBaseUrl) return fallback;

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, fallback: T): Promise<T> =>
    request(endpoint, { method: 'GET' }, fallback),

  post: <T>(endpoint: string, body: unknown, fallback: T): Promise<T> =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }, fallback),
};
