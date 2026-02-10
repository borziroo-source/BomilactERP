import { Contract } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api/Contracts`;

type ApiContractDto = {
  id: number;
  partnerId: number;
  partnerName?: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  milkQuotaLiters: number;
  basePricePerLiter: number;
  status: number;
  notes?: string | null;
};

const statusFromApi = (status: number): Contract['status'] => {
  switch (status) {
    case 1:
      return 'ACTIVE';
    case 2:
      return 'EXPIRED';
    default:
      return 'PENDING';
  }
};

const statusToApi = (status: Contract['status']): number => {
  switch (status) {
    case 'ACTIVE':
      return 1;
    case 'EXPIRED':
      return 2;
    default:
      return 0;
  }
};

const normalizeDate = (value: string | undefined | null): string => {
  if (!value) return '';
  return value.length > 10 ? value.substring(0, 10) : value;
};

const mapFromApi = (dto: ApiContractDto): Contract => ({
  id: dto.id,
  partnerId: dto.partnerId,
  partnerName: dto.partnerName ?? '',
  contractNumber: dto.contractNumber,
  startDate: normalizeDate(dto.startDate),
  endDate: normalizeDate(dto.endDate),
  milkQuotaLiters: Number(dto.milkQuotaLiters),
  basePricePerLiter: Number(dto.basePricePerLiter),
  status: statusFromApi(dto.status),
  notes: dto.notes ?? undefined
});

const mapToApi = (contract: Partial<Contract>) => ({
  contractNumber: contract.contractNumber ?? '',
  partnerId: contract.partnerId ?? 0,
  startDate: contract.startDate ? new Date(contract.startDate).toISOString() : new Date().toISOString(),
  endDate: contract.endDate ? new Date(contract.endDate).toISOString() : new Date().toISOString(),
  milkQuotaLiters: contract.milkQuotaLiters ?? 0,
  basePricePerLiter: contract.basePricePerLiter ?? 0,
  status: statusToApi(contract.status ?? 'PENDING'),
  notes: contract.notes ?? null
});

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

export const fetchContracts = async (search?: string): Promise<Contract[]> => {
  const url = search ? `${BASE_URL}?search=${encodeURIComponent(search)}` : BASE_URL;
  const res = await fetch(url, { cache: 'no-store' });
  await ensureOk(res);
  const data = await parseJson<ApiContractDto[]>(res);
  return data.map(mapFromApi);
};

export const fetchContract = async (id: number): Promise<Contract> => {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
  await ensureOk(res);
  const dto = await parseJson<ApiContractDto>(res);
  return mapFromApi(dto);
};

export const updateContract = async (id: number, contract: Partial<Contract>): Promise<Contract> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToApi(contract))
  });

  if (res.status !== 204) {
    await ensureOk(res);
  }

  return fetchContract(id);
};

export const createContract = async (contract: Partial<Contract>): Promise<Contract> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapToApi(contract))
  });
  await ensureOk(res);
  const dto = await parseJson<ApiContractDto>(res);
  return mapFromApi(dto);
};

export const deleteContract = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (res.status !== 204) {
    await ensureOk(res);
  }
};
