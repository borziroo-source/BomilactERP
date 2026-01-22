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

export const fetchSuppliers = async (): Promise<ApiPartnerDto[]> => {
  const res = await fetch(BASE_URL, { cache: 'no-store' });
  await ensureOk(res);
  const data = await parseJson<ApiPartnerDto[]>(res);
  // Szűrjük csak a beszállítókat (type = 1 vagy 2)
  return data.filter(p => p.type === 1 || p.type === 2);
};

export const fetchSupplierById = async (id: number): Promise<ApiPartnerDto> => {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
  await ensureOk(res);
  return await parseJson<ApiPartnerDto>(res);
};

export const createSupplier = async (data: CreateUpdatePartnerDto): Promise<ApiPartnerDto> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await ensureOk(res);
  return await parseJson<ApiPartnerDto>(res);
};

export const updateSupplier = async (id: number, data: CreateUpdatePartnerDto): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await ensureOk(res);
};

export const deleteSupplier = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  await ensureOk(res);
};
