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

// Request interceptor (későbbi token kezeléshez is használható)
axiosClient.interceptors.request.use(
  (config) => {
    // Itt lehet hozzáadni Bearer token-t, ha lesz authentication
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - globális hibakezelés
axiosClient.interceptors.response.use(
  (response) => {
    // Sikeres válasz esetén visszaadjuk a response-t
    return response;
  },
  (error: AxiosError) => {
    // Hibakezelés
    let errorMessage = 'Ismeretlen hiba történt az API hívás során.';

    if (error.response) {
      // A szerver válaszolt, de hibakóddal
      const status = error.response.status;
      const data = error.response.data;

      // Ha a backend stringként küldi a hibát
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && typeof data === 'object' && 'message' in data) {
        errorMessage = (data as any).message;
      } else {
        errorMessage = `HTTP ${status}: ${error.message}`;
      }
    } else if (error.request) {
      // A kérés el lett küldve, de nem érkezett válasz
      errorMessage = 'Nincs válasz az API-tól. Ellenőrizd, hogy a backend fut-e.';
    } else {
      // Valami hiba történt a kérés összeállításakor
      errorMessage = error.message || 'Hiba a kérés előkészítésekor.';
    }

    // Dobunk egy új Error-t az üzenettel
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
