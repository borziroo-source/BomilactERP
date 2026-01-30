import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api/Partners`;

type ApiPartnerDto = {
  id: number;
  name: string;
  taxNumber?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  type: number;
  isActive: boolean;
};

export type PartnerRef = {
  id: number;
  name: string;
  isActive: boolean;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

export const fetchPartners = async (): Promise<PartnerRef[]> => {
  try {
    const response = await apiClient.get<ApiPartnerDto[]>('');
    return response.data.map((p) => ({ id: p.id, name: p.name, isActive: p.isActive }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || 'Hiba történt a partnerek lekérdezése közben');
    }
    throw error;
  }
};
