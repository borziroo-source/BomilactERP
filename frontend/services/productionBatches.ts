import axiosClient from './axiosClient';

const BASE_URL = '/ProductionBatches';

export type BatchStatus = 'RUNNING' | 'PAUSED' | 'ISSUE' | 'COMPLETED';

export interface BatchStepDto {
  id: number;
  name: string;
  durationMinutes: number;
  elapsedMinutes: number;
  stepType: string;
  sortOrder: number;
}

export interface BatchAlertDto {
  id: number;
  alertType: string;
  message: string;
  createdAt: string;
}

export interface ProductionBatchDto {
  id: number;
  lineId: string;
  lineName: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  uom: string;
  startTime: string;
  currentStepIndex: number;
  status: BatchStatus;
  currentTemp?: number | null;
  targetTemp?: number | null;
  currentPh?: number | null;
  agitatorRpm?: number | null;
  createdAt: string;
  updatedAt: string;
  steps: BatchStepDto[];
  alerts: BatchAlertDto[];
}

export interface CreateBatchInput {
  lineId: string;
  lineName: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  uom: string;
  targetTemp?: number | null;
  steps: { name: string; durationMinutes: number; stepType: string; sortOrder: number }[];
}

export interface BatchParamsInput {
  currentTemp?: number | null;
  targetTemp?: number | null;
  currentPh?: number | null;
  agitatorRpm?: number | null;
}

export const fetchActiveBatches = async (): Promise<ProductionBatchDto[]> => {
  const { data } = await axiosClient.get<ProductionBatchDto[]>(BASE_URL);
  return data;
};

export const fetchBatchById = async (id: number): Promise<ProductionBatchDto> => {
  const { data } = await axiosClient.get<ProductionBatchDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createBatch = async (payload: CreateBatchInput): Promise<ProductionBatchDto> => {
  const { data } = await axiosClient.post<ProductionBatchDto>(BASE_URL, payload);
  return data;
};

export const updateBatchStep = async (id: number, stepIndex: number): Promise<ProductionBatchDto> => {
  const { data } = await axiosClient.patch<ProductionBatchDto>(`${BASE_URL}/${id}/step`, { stepIndex });
  return data;
};

export const logBatchParams = async (id: number, params: BatchParamsInput): Promise<ProductionBatchDto> => {
  const { data } = await axiosClient.put<ProductionBatchDto>(`${BASE_URL}/${id}/params`, params);
  return data;
};

export const deleteBatch = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
