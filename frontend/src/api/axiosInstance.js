// Purpose: Axios instance — JWT injection, 401/429 response handling, TrustFlow base URL
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request: inject auth token ─────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('tf_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

/* ── Response: handle auth/rate errors ─────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

      if (!isAuthRoute) {
        // Clear session and redirect to login only for non-auth protected routes
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }

    if (status === 429) {
      const retryAfter = error.response?.data?.retryAfter;
      const msg = retryAfter
        ? `TrustFlow: Too many requests. Please wait ${retryAfter} seconds.`
        : 'TrustFlow: Too many requests. Please wait a moment.';
      // Dispatch a custom event for toast system
      window.dispatchEvent(new CustomEvent('tf:toast', { detail: { message: msg, type: 'warning' } }));
    }

    if (!error.response) {
      window.dispatchEvent(new CustomEvent('tf:toast', {
        detail: { message: 'Connection issue. Please check your network.', type: 'error' },
      }));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
