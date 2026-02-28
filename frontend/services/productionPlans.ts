import axiosClient from './axiosClient';

const BASE_URL = '/ProductionPlans';

export type ProductionOrderStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';

export interface ProductionOrderDto {
  id: number;
  planNumber: string;
  productName: string;
  sku?: string | null;
  quantity: number;
  uom: string;
  startDate: string;
  endDate: string;
  line: string;
  supervisor: string;
  status: ProductionOrderStatus;
  progress: number;
  priority: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionOrderInput {
  planNumber: string;
  productName: string;
  sku?: string | null;
  quantity: number;
  uom: string;
  startDate: string;
  endDate: string;
  line: string;
  supervisor: string;
  status: ProductionOrderStatus;
  progress?: number;
  priority?: string;
  notes?: string | null;
}

export const fetchProductionOrders = async (params: {
  status?: ProductionOrderStatus | 'ALL';
  line?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<ProductionOrderDto[]> => {
  const queryParams: Record<string, string | undefined> = {};
  if (params.status && params.status !== 'ALL') queryParams.status = params.status;
  if (params.line) queryParams.line = params.line;
  if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
  if (params.dateTo) queryParams.dateTo = params.dateTo;
  const { data } = await axiosClient.get<ProductionOrderDto[]>(BASE_URL, { params: queryParams });
  return data;
};

export const fetchProductionOrderById = async (id: number): Promise<ProductionOrderDto> => {
  const { data } = await axiosClient.get<ProductionOrderDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createProductionOrder = async (payload: ProductionOrderInput): Promise<ProductionOrderDto> => {
  const { data } = await axiosClient.post<ProductionOrderDto>(BASE_URL, payload);
  return data;
};

export const updateProductionOrder = async (id: number, payload: ProductionOrderInput): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, payload);
};

export const deleteProductionOrder = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const updateOrderStatus = async (id: number, status: ProductionOrderStatus): Promise<void> => {
  await axiosClient.patch(`${BASE_URL}/${id}/status`, { status });
};
