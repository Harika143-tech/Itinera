// API Client for Overlap backend
const API_BASE = '/api';

export async function apiRequest(endpoint, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const storedToken = token || localStorage.getItem('overlap_token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || 'Something went wrong';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.field = data?.error?.field;
    throw error;
  }

  return data;
}

// Convenient helper methods
export const api = {
  get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body }),
  patch: (url, body, options) => apiRequest(url, { ...options, method: 'PATCH', body }),
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }),
};
