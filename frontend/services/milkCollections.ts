import axiosClient from './axiosClient';
import { AntibioticTest, MilkCollectionStatus } from '../types';

const BASE_URL = '/MilkCollections';
const SUMMARY_URL = '/MilkCollectionSummaries';

export type MilkCollectionEntryDto = {
  id: number;
  timestamp: string;
  supplierId: number;
  supplierName: string;
  vehicleId?: number | null;
  vehiclePlate: string;
  quantityLiters: number;
  fatPercentage: number;
  proteinPercentage: number;
  temperature: number;
  ph: number;
  antibioticTest: AntibioticTest;
  sampleId: string;
  status: MilkCollectionStatus;
  inspector: string;
  notes?: string | null;
};

export type MilkCollectionEntryInput = {
  timestamp: string;
  supplierId: number;
  vehicleId?: number | null;
  vehiclePlate: string;
  quantityLiters: number;
  fatPercentage: number;
  proteinPercentage: number;
  temperature: number;
  ph: number;
  antibioticTest: AntibioticTest;
  sampleId: string;
  status: MilkCollectionStatus;
  inspector: string;
  notes?: string | null;
};

export type MilkCollectionSummaryDto = {
  id: number;
  month: string;
  supplierId: number;
  supplierName: string;
  collectionPointId: number;
  collectionPointName: string;
  totalLiters: number;
  avgFat: number;
  avgProtein: number;
  status: 'DRAFT' | 'FINALIZED';
};

export type SaveMonthlySummaryItem = {
  supplierId: number;
  totalLiters: number;
  avgFat: number;
  avgProtein: number;
  status: 'DRAFT' | 'FINALIZED';
};

export const fetchMilkCollections = async (date: string, searchTerm?: string): Promise<MilkCollectionEntryDto[]> => {
  const { data } = await axiosClient.get<MilkCollectionEntryDto[]>(BASE_URL, {
    params: { date, searchTerm },
  });
  return data;
};

export const fetchMilkCollectionById = async (id: number): Promise<MilkCollectionEntryDto> => {
  const { data } = await axiosClient.get<MilkCollectionEntryDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createMilkCollection = async (payload: MilkCollectionEntryInput): Promise<MilkCollectionEntryDto> => {
  const { data } = await axiosClient.post<MilkCollectionEntryDto>(BASE_URL, payload);
  return data;
};

export const updateMilkCollection = async (id: number, payload: MilkCollectionEntryInput): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, payload);
};

export const deleteMilkCollection = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const fetchMonthlySummaries = async (month: string, collectionPointId: number): Promise<MilkCollectionSummaryDto[]> => {
  const { data } = await axiosClient.get<MilkCollectionSummaryDto[]>(SUMMARY_URL, {
    params: { month, collectionPointId },
  });
  return data;
};

export const saveMonthlySummaries = async (month: string, collectionPointId: number, items: SaveMonthlySummaryItem[]): Promise<MilkCollectionSummaryDto[]> => {
  const { data } = await axiosClient.post<MilkCollectionSummaryDto[]>(`${SUMMARY_URL}/batch`, {
    month,
    collectionPointId,
    items,
  });
  return data;
};

export const finalizeMonthlySummaries = async (month: string, collectionPointId: number): Promise<void> => {
  await axiosClient.post(`${SUMMARY_URL}/finalize`, { month, collectionPointId });
};
