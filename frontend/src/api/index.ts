import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8002';
const COMPANIES_URL = import.meta.env.VITE_COMPANIES_URL || 'http://localhost:8001';
const GRADUATES_URL = import.meta.env.VITE_GRADUATES_URL || 'http://localhost:8003';

// ── Cliente de autenticación ─────────────────────────────────────────────────
export const authApi = axios.create({
  baseURL: `${AUTH_URL}/api/auth`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Cliente de empresas/vacantes ─────────────────────────────────────────────
const api = axios.create({
  baseURL: `${COMPANIES_URL}/api/modulo2`,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adjunta el token JWT a cada request protegida
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si el backend devuelve 401, limpia sesión y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const graduatesApi = axios.create({
  baseURL: `${GRADUATES_URL}/api/modulo1`,
  headers: { 'Content-Type': 'application/json' },
});

graduatesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

graduatesApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;