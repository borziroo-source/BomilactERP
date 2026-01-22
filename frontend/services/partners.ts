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

export const fetchPartners = async (): Promise<PartnerRef[]> => {
  const res = await fetch(BASE_URL, { cache: 'no-store' });
  await ensureOk(res);
  const data = await parseJson<ApiPartnerDto[]>(res);
  return data.map((p) => ({ id: p.id, name: p.name, isActive: p.isActive }));
};
