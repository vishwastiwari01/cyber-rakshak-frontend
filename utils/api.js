// frontend/utils/api.js
const BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:3001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cr_token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
};

export { getToken };
