const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = {
  get: async (url: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  post: async (url: string, body: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  delete: async (url: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
