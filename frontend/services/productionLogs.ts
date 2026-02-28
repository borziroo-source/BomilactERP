import axiosClient from './axiosClient';

const BASE_URL = '/ProductionLogs';

export type LogStatus = 'OK' | 'WARNING' | 'CRITICAL';

export interface ProductionLogDto {
  id: number;
  timestamp: string;
  batchNumber: string;
  productName: string;
  step: string;
  temperature?: number | null;
  ph?: number | null;
  operator: string;
  status: LogStatus;
  notes?: string | null;
  createdAt: string;
}

export interface ProductionLogInput {
  batchNumber: string;
  productName: string;
  step: string;
  temperature?: number | null;
  ph?: number | null;
  operator: string;
  notes?: string | null;
  timestamp?: string;
}

export const fetchProductionLogs = async (params: {
  batchNumber?: string;
  productName?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: LogStatus | 'ALL';
} = {}): Promise<ProductionLogDto[]> => {
  const queryParams: Record<string, string | undefined> = {};
  if (params.batchNumber) queryParams.batchNumber = params.batchNumber;
  if (params.productName) queryParams.productName = params.productName;
  if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
  if (params.dateTo) queryParams.dateTo = params.dateTo;
  if (params.status && params.status !== 'ALL') queryParams.status = params.status;
  const { data } = await axiosClient.get<ProductionLogDto[]>(BASE_URL, { params: queryParams });
  return data;
};

export const createProductionLog = async (payload: ProductionLogInput): Promise<ProductionLogDto> => {
  const { data } = await axiosClient.post<ProductionLogDto>(BASE_URL, payload);
  return data;
};

export const deleteProductionLog = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
