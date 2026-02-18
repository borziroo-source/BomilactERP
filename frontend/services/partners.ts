import axiosClient from './axiosClient';

const BASE_URL = '/Partners';

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

// Axios automatikusan kezeli a JSON parse-olást és hibakezelést

export const fetchPartners = async (): Promise<PartnerRef[]> => {
  const { data } = await axiosClient.get<ApiPartnerDto[]>(BASE_URL);
  return data.map((p) => ({ id: p.id, name: p.name, isActive: p.isActive }));
};
