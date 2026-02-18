import axiosClient from './axiosClient';

const BASE_URL = '/Partners';

type ApiPartnerDto = {
  id: number;
  name: string;
  taxNumber?: string | null;
  exploitationCode?: string | null;
  apiaCode?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  type: number; // 0 = Customer, 1 = Supplier, 2 = Both
  isActive: boolean;
  supplierGroupId?: number | null;
};

type CreateUpdatePartnerDto = {
  name: string;
  taxNumber?: string | null;
  exploitationCode?: string | null;
  apiaCode?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  type: number;
  isActive?: boolean;
  supplierGroupId?: number | null;
};

export type ImportSuppliersResult = {
  createdPartners: number;
  skippedPartners: number;
  createdContracts: number;
  skippedContracts: number;
  errors: Array<{ rowNumber: number; message: string }>;
};

// Axios automatikusan kezeli a JSON parse-olást és hibakezelést

export const fetchSuppliers = async (): Promise<ApiPartnerDto[]> => {
  const { data } = await axiosClient.get<ApiPartnerDto[]>(BASE_URL);
  // Szűrjük csak a beszállítókat (type = 1 vagy 2)
  return data.filter(p => p.type === 1 || p.type === 2);
};

export const fetchSupplierById = async (id: number): Promise<ApiPartnerDto> => {
  const { data } = await axiosClient.get<ApiPartnerDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createSupplier = async (data: CreateUpdatePartnerDto): Promise<ApiPartnerDto> => {
  const { data: result } = await axiosClient.post<ApiPartnerDto>(BASE_URL, data);
  return result;
};

export const updateSupplier = async (id: number, data: CreateUpdatePartnerDto): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, data);
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const importSuppliers = async (file: File): Promise<ImportSuppliersResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axiosClient.post<ImportSuppliersResult>(`${BASE_URL}/import-suppliers`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
