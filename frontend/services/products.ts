import axiosClient from './axiosClient';
import { ProductCategory } from '../types';

const BASE_URL = '/Products';

export interface ProductApiDto {
  id: number;
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  uom: string;
  category: string;
  weightNetKg?: number | null;
  minStockThreshold?: number | null;
  sagaRefId?: string | null;
  shelfLifeDays?: number | null;
  storageTempMin?: number | null;
  storageTempMax?: number | null;
  isActive: boolean;
}

export interface ProductInput {
  name: string;
  description?: string | null;
  sku: string;
  price?: number;
  uom: string;
  category: string;
  weightNetKg?: number | null;
  minStockThreshold?: number | null;
  sagaRefId?: string | null;
  shelfLifeDays?: number | null;
  storageTempMin?: number | null;
  storageTempMax?: number | null;
  isActive?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductQueryParams {
  searchTerm?: string;
  category?: ProductCategory | string;
  page?: number;
  pageSize?: number;
}

export const fetchProducts = async (params: ProductQueryParams = {}): Promise<PagedResult<ProductApiDto>> => {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
  if (params.category) queryParams.category = params.category;
  const { data } = await axiosClient.get<PagedResult<ProductApiDto>>(BASE_URL, { params: queryParams });
  return data;
};

export const fetchProductById = async (id: number): Promise<ProductApiDto> => {
  const { data } = await axiosClient.get<ProductApiDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createProduct = async (payload: ProductInput): Promise<ProductApiDto> => {
  const { data } = await axiosClient.post<ProductApiDto>(BASE_URL, payload);
  return data;
};

export const updateProduct = async (id: number, payload: ProductInput): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, payload);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
