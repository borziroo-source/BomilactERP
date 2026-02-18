import { Contract } from '../types';
import axiosClient from './axiosClient';

const BASE_URL = '/Contracts';

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

// Axios automatikusan kezeli a JSON parse-olást és hibakezelést

export const fetchContracts = async (): Promise<Contract[]> => {
  const { data } = await axiosClient.get<ApiContractDto[]>(BASE_URL);
  return data.map(mapFromApi);
};

export const fetchContract = async (id: number): Promise<Contract> => {
  const { data } = await axiosClient.get<ApiContractDto>(`${BASE_URL}/${id}`);
  return mapFromApi(data);
};

export const updateContract = async (id: number, contract: Partial<Contract>): Promise<Contract> => {
  await axiosClient.put(`${BASE_URL}/${id}`, mapToApi(contract));
  return fetchContract(id);
};

export const createContract = async (contract: Partial<Contract>): Promise<Contract> => {
  const { data } = await axiosClient.post<ApiContractDto>(BASE_URL, mapToApi(contract));
  return mapFromApi(data);
};

export const deleteContract = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
