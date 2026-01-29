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
  type: number; // 0 = Customer, 1 = Supplier, 2 = Both
  isActive: boolean;
};

type CreateUpdatePartnerDto = {
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
  isActive?: boolean;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

export const fetchSuppliers = async (): Promise<ApiPartnerDto[]> => {
  try {
    const response = await apiClient.get<ApiPartnerDto[]>('');
    // Szűrjük csak a beszállítókat (type = 1 vagy 2)
    return response.data.filter(p => p.type === 1 || p.type === 2);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || 'Hiba történt a beszállítók lekérdezése közben');
    }
    throw error;
  }
};

export const fetchSupplierById = async (id: number): Promise<ApiPartnerDto> => {
  try {
    const response = await apiClient.get<ApiPartnerDto>(`/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || `Hiba történt a beszállító (${id}) lekérdezése közben`);
    }
    throw error;
  }
};

export const createSupplier = async (data: CreateUpdatePartnerDto): Promise<ApiPartnerDto> => {
  try {
    const response = await apiClient.post<ApiPartnerDto>('', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || 'Hiba történt a beszállító létrehozása közben');
    }
    throw error;
  }
};

export const updateSupplier = async (id: number, data: CreateUpdatePartnerDto): Promise<void> => {
  try {
    await apiClient.put(`/${id}`, data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || `Hiba történt a beszállító (${id}) frissítése közben`);
    }
    throw error;
  }
};

export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || `Hiba történt a beszállító (${id}) törlése közben`);
    }
    throw error;
  }
};
