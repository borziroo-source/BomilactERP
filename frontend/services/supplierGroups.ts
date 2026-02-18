import axiosClient from './axiosClient';

const BASE_URL = '/SupplierGroups';

export type SupplierGroupDto = {
  id: number;
  name: string;
  color: string;
};

export type CreateUpdateSupplierGroupDto = {
  name: string;
  color: string;
};

export type SupplierGroupMemberDto = {
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
  supplierGroupId?: number | null;
};

// Axios automatikusan kezeli a JSON parse-olást és hibakezelést

export const fetchSupplierGroups = async (): Promise<SupplierGroupDto[]> => {
  const { data } = await axiosClient.get<SupplierGroupDto[]>(BASE_URL);
  return data;
};

export const fetchSupplierGroupById = async (id: number): Promise<SupplierGroupDto> => {
  const { data } = await axiosClient.get<SupplierGroupDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createSupplierGroup = async (data: CreateUpdateSupplierGroupDto): Promise<SupplierGroupDto> => {
  const { data: result } = await axiosClient.post<SupplierGroupDto>(BASE_URL, data);
  return result;
};

export const updateSupplierGroup = async (id: number, data: CreateUpdateSupplierGroupDto): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, data);
};

export const deleteSupplierGroup = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const fetchSupplierGroupMembers = async (groupId: number): Promise<SupplierGroupMemberDto[]> => {
  const { data } = await axiosClient.get<SupplierGroupMemberDto[]>(`${BASE_URL}/${groupId}/members`);
  return data;
};

export const addSupplierGroupMember = async (groupId: number, partnerId: number): Promise<void> => {
  await axiosClient.post(`${BASE_URL}/${groupId}/members`, { partnerId });
};

export const removeSupplierGroupMember = async (groupId: number, partnerId: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${groupId}/members/${partnerId}`);
};

export type ImportResult = {
  success: boolean;
  message: string;
  groupsCreated: number;
  groupsUpdated: number;
  suppliersCreated: number;
  suppliersUpdated: number;
  associationsCreated: number;
  errors: string[];
};

export const importSupplierGroupsFromExcel = async (file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await axiosClient.post<ImportResult>(`${BASE_URL}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
