import axiosClient from './axiosClient';
import { Product, ProductCategory } from '../types';

/**
 * Products Service - API calls for product management
 * Handles raw materials, ingredients, packaging, WIP, and finished goods
 */

// API DTO Types
interface ProductApiDto {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  weight_net_kg?: number;
  min_stock_threshold?: number;
  saga_ref_id?: string;
  shelf_life_days?: number;
  storage_temp_min?: number;
  storage_temp_max?: number;
  allergens?: string[];
}

/**
 * Map API DTO to frontend Product type
 */
const mapFromApi = (dto: ProductApiDto): Product => ({
  id: dto.id,
  sku: dto.sku,
  name: dto.name,
  category: dto.category as ProductCategory,
  uom: dto.uom,
  weightNetKg: dto.weight_net_kg,
  minStockThreshold: dto.min_stock_threshold,
  sagaRefId: dto.saga_ref_id,
  shelfLifeDays: dto.shelf_life_days,
  storageTempMin: dto.storage_temp_min,
  storageTempMax: dto.storage_temp_max,
  allergens: dto.allergens,
});

/**
 * Map frontend Product type to API DTO
 */
const mapToApi = (product: Partial<Product>): Partial<ProductApiDto> => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  category: product.category,
  uom: product.uom,
  weight_net_kg: product.weightNetKg,
  min_stock_threshold: product.minStockThreshold,
  saga_ref_id: product.sagaRefId,
  shelf_life_days: product.shelfLifeDays,
  storage_temp_min: product.storageTempMin,
  storage_temp_max: product.storageTempMax,
  allergens: product.allergens,
});

/**
 * Get all products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ProductApiDto[]>('/products');
  return response.data.map(mapFromApi);
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosClient.get<ProductApiDto>(`/products/${id}`);
  return mapFromApi(response.data);
};

/**
 * Get product by SKU
 */
export const getProductBySku = async (sku: string): Promise<Product> => {
  const response = await axiosClient.get<ProductApiDto>(`/products/sku/${sku}`);
  return mapFromApi(response.data);
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: ProductCategory): Promise<Product[]> => {
  const response = await axiosClient.get<ProductApiDto[]>('/products', {
    params: { category }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get products below minimum stock threshold
 */
export const getProductsBelowThreshold = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ProductApiDto[]>('/products/low-stock');
  return response.data.map(mapFromApi);
};

/**
 * Search products by name or SKU
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  const response = await axiosClient.get<ProductApiDto[]>('/products/search', {
    params: { q: query }
  });
  return response.data.map(mapFromApi);
};

/**
 * Create new product
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const dto = mapToApi(product);
  const response = await axiosClient.post<ProductApiDto>('/products', dto);
  return mapFromApi(response.data);
};

/**
 * Update existing product
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const dto = mapToApi(product);
  const response = await axiosClient.put<ProductApiDto>(`/products/${id}`, dto);
  return mapFromApi(response.data);
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosClient.delete(`/products/${id}`);
};

/**
 * Get finished goods (products ready for sale)
 */
export const getFinishedGoods = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ProductApiDto[]>('/products', {
    params: { category: ProductCategory.FINISHED }
  });
  return response.data.map(mapFromApi);
};

/**
 * Get raw materials
 */
export const getRawMaterials = async (): Promise<Product[]> => {
  const response = await axiosClient.get<ProductApiDto[]>('/products', {
    params: { category: ProductCategory.RAW_MILK }
  });
  return response.data.map(mapFromApi);
};

/**
 * Sync product with SAGA accounting system
 */
export const syncProductWithSaga = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosClient.post<{ success: boolean; message: string }>(`/products/${id}/sync-saga`);
  return response.data;
};
