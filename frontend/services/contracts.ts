import axiosClient from './axiosClient';
import { Contract } from '../types';

/**
 * Contract Service - API calls for contract management
 * Handles contract CRUD operations and related queries
 */

// API DTO Types (if backend uses different structure)
interface ContractApiDto {
  id: string;
  supplier_id: string;
  supplier_name: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  milk_quota_liters: number;
  base_price_per_liter: number;
  status: string;
}

/**
 * Map API DTO to frontend Contract type
 */
const mapFromApi = (dto: ContractApiDto): Contract => ({
  id: dto.id,
  supplierId: dto.supplier_id,
  supplierName: dto.supplier_name,
  contractNumber: dto.contract_number,
  startDate: dto.start_date,
  endDate: dto.end_date,
  milkQuotaLiters: dto.milk_quota_liters,
  basePricePerLiter: dto.base_price_per_liter,
  status: dto.status as Contract['status'],
});

/**
 * Map frontend Contract type to API DTO
 */
const mapToApi = (contract: Partial<Contract>): Partial<ContractApiDto> => ({
  id: contract.id,
  supplier_id: contract.supplierId,
  supplier_name: contract.supplierName,
  contract_number: contract.contractNumber,
  start_date: contract.startDate,
  end_date: contract.endDate,
  milk_quota_liters: contract.milkQuotaLiters,
  base_price_per_liter: contract.basePricePerLiter,
  status: contract.status,
});

/**
 * Get all contracts
 */
export const getAllContracts = async (): Promise<Contract[]> => {
  const response = await axiosClient.get<ContractApiDto[]>('/contracts');
  return response.data.map(mapFromApi);
};

/**
 * Get contract by ID
 */
export const getContractById = async (id: string): Promise<Contract> => {
  const response = await axiosClient.get<ContractApiDto>(`/contracts/${id}`);
  return mapFromApi(response.data);
};

/**
 * Get contracts by supplier ID
 */
export const getContractsBySupplierId = async (supplierId: string): Promise<Contract[]> => {
  const response = await axiosClient.get<ContractApiDto[]>(`/contracts/supplier/${supplierId}`);
  return response.data.map(mapFromApi);
};

/**
 * Get active contracts
 */
export const getActiveContracts = async (): Promise<Contract[]> => {
  const response = await axiosClient.get<ContractApiDto[]>('/contracts', {
    params: { status: 'ACTIVE' }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get expiring contracts (within specified days)
 */
export const getExpiringContracts = async (daysUntilExpiry: number = 30): Promise<Contract[]> => {
  const response = await axiosClient.get<ContractApiDto[]>('/contracts/expiring', {
    params: { days: daysUntilExpiry }
  });
  return response.data.map(mapFromApi);
};

/**
 * Create new contract
 */
export const createContract = async (contract: Omit<Contract, 'id'>): Promise<Contract> => {
  const dto = mapToApi(contract);
  const response = await axiosClient.post<ContractApiDto>('/contracts', dto);
  return mapFromApi(response.data);
};

/**
 * Update existing contract
 */
export const updateContract = async (id: string, contract: Partial<Contract>): Promise<Contract> => {
  const dto = mapToApi(contract);
  const response = await axiosClient.put<ContractApiDto>(`/contracts/${id}`, dto);
  return mapFromApi(response.data);
};

/**
 * Delete contract
 */
export const deleteContract = async (id: string): Promise<void> => {
  await axiosClient.delete(`/contracts/${id}`);
};

/**
 * Renew contract (create new contract based on existing one)
 */
export const renewContract = async (id: string, newEndDate: string): Promise<Contract> => {
  const response = await axiosClient.post<ContractApiDto>(`/contracts/${id}/renew`, {
    new_end_date: newEndDate
  });
  return mapFromApi(response.data);
};
