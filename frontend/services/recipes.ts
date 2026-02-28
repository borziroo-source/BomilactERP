import axiosClient from './axiosClient';

const BASE_URL = '/Recipes';

export type RecipeStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface RecipeItemDto {
  id: number;
  productId: number;
  componentName: string;
  componentSku?: string | null;
  quantity: number;
  unit: string;
  unitCost?: number | null;
  category?: string | null;
}

export interface RecipeApiDto {
  id: number;
  name: string;
  description?: string | null;
  version: string;
  status: RecipeStatus;
  outputProductId?: number | null;
  outputProductName?: string | null;
  outputProductSku?: string | null;
  outputQuantity: number;
  outputUom: string;
  instructions?: string | null;
  isActive: boolean;
  updatedAt?: string | null;
  items: RecipeItemDto[];
}

export interface RecipeItemInput {
  productId: number;
  quantity: number;
  unit: string;
  unitCost?: number | null;
  category?: string | null;
}

export interface RecipeInput {
  name: string;
  description?: string | null;
  version?: string;
  status?: RecipeStatus;
  outputProductId?: number | null;
  outputQuantity?: number;
  outputUom?: string;
  instructions?: string | null;
  isActive?: boolean;
  items: RecipeItemInput[];
}

export const fetchRecipes = async (params: {
  status?: RecipeStatus | 'ALL';
  search?: string;
} = {}): Promise<RecipeApiDto[]> => {
  const queryParams: Record<string, string | undefined> = {};
  if (params.status && params.status !== 'ALL') queryParams.status = params.status;
  if (params.search) queryParams.search = params.search;
  const { data } = await axiosClient.get<RecipeApiDto[]>(BASE_URL, { params: queryParams });
  return data;
};

export const fetchRecipeById = async (id: number): Promise<RecipeApiDto> => {
  const { data } = await axiosClient.get<RecipeApiDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createRecipe = async (payload: RecipeInput): Promise<RecipeApiDto> => {
  const { data } = await axiosClient.post<RecipeApiDto>(BASE_URL, payload);
  return data;
};

export const updateRecipe = async (id: number, payload: RecipeInput): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, payload);
};

export const deleteRecipe = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
