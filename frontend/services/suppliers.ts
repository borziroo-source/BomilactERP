import axiosClient from './axiosClient';
import { Supplier, SupplierType, LegalType, SupplierGroup } from '../types';

/**
 * Suppliers Service - API calls for supplier (farmer/milk producer) management
 * Handles farmers, collection points, and cooperatives
 */

// API DTO Types
interface SupplierApiDto {
  id: string;
  name: string;
  cui: string;
  legal_type: string;
  exploitation_code: string;
  apia_code: string;
  has_subsidy8: boolean;
  bank_name: string;
  bank_branch: string;
  iban: string;
  type: string;
  group_id?: string;
  parent_supplier_id?: string;
  address: string;
  phone: string;
  email?: string;
  status: string;
  last_collection_date?: string;
  invoice_series?: string;
  next_invoice_number?: number;
}

interface SupplierGroupApiDto {
  id: string;
  name: string;
  color: string;
}

/**
 * Map API DTO to frontend Supplier type
 */
const mapFromApi = (dto: SupplierApiDto): Supplier => ({
  id: dto.id,
  name: dto.name,
  cui: dto.cui,
  legalType: dto.legal_type as LegalType,
  exploitationCode: dto.exploitation_code,
  apiaCode: dto.apia_code,
  hasSubsidy8: dto.has_subsidy8,
  bankName: dto.bank_name,
  bankBranch: dto.bank_branch,
  iban: dto.iban,
  type: dto.type as SupplierType,
  groupId: dto.group_id,
  parentSupplierId: dto.parent_supplier_id,
  address: dto.address,
  phone: dto.phone,
  email: dto.email,
  status: dto.status as Supplier['status'],
  lastCollectionDate: dto.last_collection_date,
  invoiceSeries: dto.invoice_series,
  nextInvoiceNumber: dto.next_invoice_number,
});

/**
 * Map frontend Supplier type to API DTO
 */
const mapToApi = (supplier: Partial<Supplier>): Partial<SupplierApiDto> => ({
  id: supplier.id,
  name: supplier.name,
  cui: supplier.cui,
  legal_type: supplier.legalType,
  exploitation_code: supplier.exploitationCode,
  apia_code: supplier.apiaCode,
  has_subsidy8: supplier.hasSubsidy8,
  bank_name: supplier.bankName,
  bank_branch: supplier.bankBranch,
  iban: supplier.iban,
  type: supplier.type,
  group_id: supplier.groupId,
  parent_supplier_id: supplier.parentSupplierId,
  address: supplier.address,
  phone: supplier.phone,
  email: supplier.email,
  status: supplier.status,
  last_collection_date: supplier.lastCollectionDate,
  invoice_series: supplier.invoiceSeries,
  next_invoice_number: supplier.nextInvoiceNumber,
});

/**
 * Map API DTO to frontend SupplierGroup type
 */
const mapGroupFromApi = (dto: SupplierGroupApiDto): SupplierGroup => ({
  id: dto.id,
  name: dto.name,
  color: dto.color,
});

/**
 * Map frontend SupplierGroup type to API DTO
 */
const mapGroupToApi = (group: Partial<SupplierGroup>): Partial<SupplierGroupApiDto> => ({
  id: group.id,
  name: group.name,
  color: group.color,
});

// ===== SUPPLIER CRUD OPERATIONS =====

/**
 * Get all suppliers
 */
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>('/suppliers');
  return response.data.map(mapFromApi);
};

/**
 * Get supplier by ID
 */
export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response = await axiosClient.get<SupplierApiDto>(`/suppliers/${id}`);
  return mapFromApi(response.data);
};

/**
 * Get suppliers by type
 */
export const getSuppliersByType = async (type: SupplierType): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>('/suppliers', {
    params: { type }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get active suppliers
 */
export const getActiveSuppliers = async (): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>('/suppliers', {
    params: { status: 'ACTIVE' }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get suppliers by group
 */
export const getSuppliersByGroup = async (groupId: string): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>(`/suppliers/group/${groupId}`);
  return response.data.map(mapFromApi);
};

/**
 * Get suppliers by parent (collection point)
 */
export const getSuppliersByParent = async (parentId: string): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>(`/suppliers/parent/${parentId}`);
  return response.data.map(mapFromApi);
};

/**
 * Search suppliers by name or CUI
 */
export const searchSuppliers = async (query: string): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>('/suppliers/search', {
    params: { q: query }
  });
  return response.data.map(mapFromApi);
};

/**
 * Create new supplier
 */
export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const dto = mapToApi(supplier);
  const response = await axiosClient.post<SupplierApiDto>('/suppliers', dto);
  return mapFromApi(response.data);
};

/**
 * Update existing supplier
 */
export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
  const dto = mapToApi(supplier);
  const response = await axiosClient.put<SupplierApiDto>(`/suppliers/${id}`, dto);
  return mapFromApi(response.data);
};

/**
 * Delete supplier
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  await axiosClient.delete(`/suppliers/${id}`);
};

// ===== SUPPLIER GROUP OPERATIONS =====

/**
 * Get all supplier groups
 */
export const getAllSupplierGroups = async (): Promise<SupplierGroup[]> => {
  const response = await axiosClient.get<SupplierGroupApiDto[]>('/supplier-groups');
  return response.data.map(mapGroupFromApi);
};

/**
 * Get supplier group by ID
 */
export const getSupplierGroupById = async (id: string): Promise<SupplierGroup> => {
  const response = await axiosClient.get<SupplierGroupApiDto>(`/supplier-groups/${id}`);
  return mapGroupFromApi(response.data);
};

/**
 * Create new supplier group
 */
export const createSupplierGroup = async (group: Omit<SupplierGroup, 'id'>): Promise<SupplierGroup> => {
  const dto = mapGroupToApi(group);
  const response = await axiosClient.post<SupplierGroupApiDto>('/supplier-groups', dto);
  return mapGroupFromApi(response.data);
};

/**
 * Update supplier group
 */
export const updateSupplierGroup = async (id: string, group: Partial<SupplierGroup>): Promise<SupplierGroup> => {
  const dto = mapGroupToApi(group);
  const response = await axiosClient.put<SupplierGroupApiDto>(`/supplier-groups/${id}`, dto);
  return mapGroupFromApi(response.data);
};

/**
 * Delete supplier group
 */
export const deleteSupplierGroup = async (id: string): Promise<void> => {
  await axiosClient.delete(`/supplier-groups/${id}`);
};

// ===== SPECIALIZED OPERATIONS =====

/**
 * Update last collection date for supplier
 */
export const updateLastCollectionDate = async (id: string, date: string): Promise<Supplier> => {
  const response = await axiosClient.patch<SupplierApiDto>(`/suppliers/${id}/last-collection`, {
    last_collection_date: date
  });
  return mapFromApi(response.data);
};

/**
 * Get suppliers with 8% subsidy
 */
export const getSuppliersWithSubsidy = async (): Promise<Supplier[]> => {
  const response = await axiosClient.get<SupplierApiDto[]>('/suppliers', {
    params: { has_subsidy8: true }
  });
  return response.data.map(mapFromApi);
};

/**
 * Generate next invoice number for supplier
 */
export const generateNextInvoiceNumber = async (id: string): Promise<{ invoiceNumber: string }> => {
  const response = await axiosClient.post<{ invoice_number: string }>(`/suppliers/${id}/next-invoice`);
  return { invoiceNumber: response.data.invoice_number };
};

/**
 * Bulk update supplier group
 */
export const bulkUpdateSupplierGroup = async (supplierIds: string[], groupId: string): Promise<{ updated: number }> => {
  const response = await axiosClient.patch<{ updated: number }>('/suppliers/bulk-update-group', {
    supplier_ids: supplierIds,
    group_id: groupId
  });
  return response.data;
};
