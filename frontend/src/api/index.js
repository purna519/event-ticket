// ─── api/index.js ─────────────────────────────────────────────────────────────
// Axios instance with automatic JWT injection for admin routes
// ──────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
});

// Attach JWT token for admin or user requests
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');

  if (config.url.startsWith('/admin') || config.url.startsWith('admin')) {
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    // Public or User routes
    if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

// Handle 401 by clearing token and redirecting to admin login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
