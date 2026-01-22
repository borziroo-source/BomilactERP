import axiosClient from './axiosClient';

/**
 * Partners Service - API calls for partner (customer) management
 * Handles retail, wholesale, HORECA and key account customers
 */

// Frontend Partner type (from PartnerManagement component)
type PartnerType = 'RETAIL' | 'WHOLESALE' | 'HORECA' | 'KEY_ACCOUNT';

interface Partner {
  id: string;
  name: string;
  cui: string;
  regNo: string;
  type: PartnerType;
  address: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  paymentTermDays: number;
  creditLimit: number;
  currentDebt: number;
  priceList: 'STANDARD' | 'VIP' | 'DISTRIBUTOR';
  sagaId: string;
}

// API DTO Types
interface PartnerApiDto {
  id: string;
  name: string;
  cui: string;
  reg_no: string;
  type: string;
  address: string;
  city: string;
  contact_person: string;
  phone: string;
  email: string;
  status: string;
  payment_term_days: number;
  credit_limit: number;
  current_debt: number;
  price_list: string;
  saga_id: string;
}

/**
 * Map API DTO to frontend Partner type
 */
const mapFromApi = (dto: PartnerApiDto): Partner => ({
  id: dto.id,
  name: dto.name,
  cui: dto.cui,
  regNo: dto.reg_no,
  type: dto.type as PartnerType,
  address: dto.address,
  city: dto.city,
  contactPerson: dto.contact_person,
  phone: dto.phone,
  email: dto.email,
  status: dto.status as Partner['status'],
  paymentTermDays: dto.payment_term_days,
  creditLimit: dto.credit_limit,
  currentDebt: dto.current_debt,
  priceList: dto.price_list as Partner['priceList'],
  sagaId: dto.saga_id,
});

/**
 * Map frontend Partner type to API DTO
 */
const mapToApi = (partner: Partial<Partner>): Partial<PartnerApiDto> => ({
  id: partner.id,
  name: partner.name,
  cui: partner.cui,
  reg_no: partner.regNo,
  type: partner.type,
  address: partner.address,
  city: partner.city,
  contact_person: partner.contactPerson,
  phone: partner.phone,
  email: partner.email,
  status: partner.status,
  payment_term_days: partner.paymentTermDays,
  credit_limit: partner.creditLimit,
  current_debt: partner.currentDebt,
  price_list: partner.priceList,
  saga_id: partner.sagaId,
});

/**
 * Get all partners
 */
export const getAllPartners = async (): Promise<Partner[]> => {
  const response = await axiosClient.get<PartnerApiDto[]>('/partners');
  return response.data.map(mapFromApi);
};

/**
 * Get partner by ID
 */
export const getPartnerById = async (id: string): Promise<Partner> => {
  const response = await axiosClient.get<PartnerApiDto>(`/partners/${id}`);
  return mapFromApi(response.data);
};

/**
 * Get partners by type
 */
export const getPartnersByType = async (type: PartnerType): Promise<Partner[]> => {
  const response = await axiosClient.get<PartnerApiDto[]>('/partners', {
    params: { type }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get active partners
 */
export const getActivePartners = async (): Promise<Partner[]> => {
  const response = await axiosClient.get<PartnerApiDto[]>('/partners', {
    params: { status: 'ACTIVE' }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get partners with overdue debt
 */
export const getPartnersWithOverdueDebt = async (): Promise<Partner[]> => {
  const response = await axiosClient.get<PartnerApiDto[]>('/partners/overdue-debt');
  return response.data.map(mapFromApi);
};

/**
 * Get partners near credit limit
 */
export const getPartnersNearCreditLimit = async (threshold: number = 0.9): Promise<Partner[]> => {
  const response = await axiosClient.get<PartnerApiDto[]>('/partners/credit-warning', {
    params: { threshold }
  });
  return response.data.map(mapFromApi);
};

/**
 * Search partners by name or CUI
 */
export const searchPartners = async (query: string): Promise<Partner[]> => {
  const response = await axiosClient.get<PartnerApiDto[]>('/partners/search', {
    params: { q: query }
  });
  return response.data.map(mapFromApi);
};

/**
 * Create new partner
 */
export const createPartner = async (partner: Omit<Partner, 'id'>): Promise<Partner> => {
  const dto = mapToApi(partner);
  const response = await axiosClient.post<PartnerApiDto>('/partners', dto);
  return mapFromApi(response.data);
};

/**
 * Update existing partner
 */
export const updatePartner = async (id: string, partner: Partial<Partner>): Promise<Partner> => {
  const dto = mapToApi(partner);
  const response = await axiosClient.put<PartnerApiDto>(`/partners/${id}`, dto);
  return mapFromApi(response.data);
};

/**
 * Delete partner
 */
export const deletePartner = async (id: string): Promise<void> => {
  await axiosClient.delete(`/partners/${id}`);
};

/**
 * Update partner debt
 */
export const updatePartnerDebt = async (id: string, amount: number, operation: 'add' | 'subtract'): Promise<Partner> => {
  const response = await axiosClient.patch<PartnerApiDto>(`/partners/${id}/debt`, {
    amount,
    operation
  });
  return mapFromApi(response.data);
};

/**
 * Sync partner with SAGA accounting system
 */
export const syncPartnerWithSaga = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosClient.post<{ success: boolean; message: string }>(`/partners/${id}/sync-saga`);
  return response.data;
};
