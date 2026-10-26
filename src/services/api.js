// Talks to the Konnect Spring Boot backend.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Client-Token': token } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running on port 8080.');
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) {
    const message =
      res.status === 429
        ? 'You are sending messages too fast. Wait a moment and try again.'
        : data?.message || data?.error || `Request failed (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status });
  }
  return data;
}

export const api = {
  createSession: () => request('/api/clients', { method: 'POST' }),
  createRoom: () => request('/api/rooms', { method: 'POST', body: {} }),
  getRoom: (code) => request(`/api/rooms/${encodeURIComponent(code)}`),
  getMessages: (code, token) => request(`/api/rooms/${encodeURIComponent(code)}/messages`, { token }),
  sendMessage: (code, content, token) =>
    request(`/api/rooms/${encodeURIComponent(code)}/messages`, { method: 'POST', body: { content }, token }),
  deleteMessage: (code, id, token) =>
    request(`/api/rooms/${encodeURIComponent(code)}/messages/${encodeURIComponent(id)}`, { method: 'DELETE', token }),
};
