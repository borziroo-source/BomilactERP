const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api/SupplierGroups`;

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

const ensureOk = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Nem JSON válasz érkezett az API-tól. Ellenőrizd a VITE_API_URL beállítást. Válasz (részlet): ${text.substring(0, 200)}`);
  }
  return (await response.json()) as T;
};

export const fetchSupplierGroups = async (): Promise<SupplierGroupDto[]> => {
  const res = await fetch(BASE_URL, { cache: 'no-store' });
  await ensureOk(res);
  return await parseJson<SupplierGroupDto[]>(res);
};

export const fetchSupplierGroupById = async (id: number): Promise<SupplierGroupDto> => {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
  await ensureOk(res);
  return await parseJson<SupplierGroupDto>(res);
};

export const createSupplierGroup = async (data: CreateUpdateSupplierGroupDto): Promise<SupplierGroupDto> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await ensureOk(res);
  return await parseJson<SupplierGroupDto>(res);
};

export const updateSupplierGroup = async (id: number, data: CreateUpdateSupplierGroupDto): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await ensureOk(res);
};

export const deleteSupplierGroup = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  await ensureOk(res);
};

export const fetchSupplierGroupMembers = async (groupId: number): Promise<SupplierGroupMemberDto[]> => {
  const res = await fetch(`${BASE_URL}/${groupId}/members`, { cache: 'no-store' });
  await ensureOk(res);
  return await parseJson<SupplierGroupMemberDto[]>(res);
};

export const addSupplierGroupMember = async (groupId: number, partnerId: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partnerId }),
  });
  await ensureOk(res);
};

export const removeSupplierGroupMember = async (groupId: number, partnerId: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${groupId}/members/${partnerId}`, {
    method: 'DELETE',
  });
  await ensureOk(res);
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
  
  const res = await fetch(`${BASE_URL}/import`, {
    method: 'POST',
    body: formData,
  });
  await ensureOk(res);
  return await parseJson<ImportResult>(res);
};
