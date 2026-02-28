import axios, { AxiosError } from 'axios';

// Központi Axios instance konfigurációval
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const axiosClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 30000, // 30 másodperc timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT Bearer token hozzáadása
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - globális hibakezelés
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    let errorMessage = 'Ismeretlen hiba történt az API hívás során.';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // 401 esetén logout
      if (status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.dispatchEvent(new Event('auth:logout'));
      }

      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && typeof data === 'object' && 'message' in data) {
        errorMessage = (data as any).message;
      } else {
        errorMessage = `HTTP ${status}: ${error.message}`;
      }
    } else if (error.request) {
      errorMessage = 'Nincs válasz az API-tól. Ellenőrizd, hogy a backend fut-e.';
    } else {
      errorMessage = error.message || 'Hiba a kérés előkészítésekor.';
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
