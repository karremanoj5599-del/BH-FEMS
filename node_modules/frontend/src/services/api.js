/**
 * FEMS — API Service
 * Axios-based HTTP client with JWT interceptors.
 */
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/me');
    const isDemoMode = localStorage.getItem('fems_token') === 'demo-token';
    const isLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isAuthRequest && !isDemoMode && !isLoginPage) {
      localStorage.removeItem('fems_token');
      localStorage.removeItem('fems_refresh');
      localStorage.removeItem('fems_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
