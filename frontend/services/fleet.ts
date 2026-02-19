import axiosClient from './axiosClient';
import { Vehicle, WashLog } from '../types';

const BASE_URL = '/Vehicles';

export type CreateVehicleDto = {
  plateNumber: string;
  makeModel: string;
  type: string;
  status: string;
  totalCapacityLiters?: number | null;
  compartments?: { capacityLiters: number; currentContent?: string | null }[];
  itpExpiry: string;
  rcaExpiry: string;
  lastWashTime?: string | null;
  mileageKm: number;
};

export type UpdateVehicleDto = CreateVehicleDto;

export type VehicleDocumentUpdateDto = {
  itpExpiry?: string | null;
  rcaExpiry?: string | null;
};

export type CreateWashLogDto = {
  performedBy: string;
  chemicals: string[];
  temperature: number;
  timestamp?: string;
};

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await axiosClient.get<Vehicle[]>(BASE_URL);
  return data;
};

export const fetchVehicleById = async (id: number): Promise<Vehicle> => {
  const { data } = await axiosClient.get<Vehicle>(`${BASE_URL}/${id}`);
  return data;
};

export const createVehicle = async (payload: CreateVehicleDto): Promise<Vehicle> => {
  const { data } = await axiosClient.post<Vehicle>(BASE_URL, payload);
  return data;
};

export const updateVehicle = async (id: number, payload: UpdateVehicleDto): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, payload);
};

export const deleteVehicle = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};

export const updateVehicleDocuments = async (id: number, payload: VehicleDocumentUpdateDto): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}/documents`, payload);
};

export const recordWash = async (id: number, payload: CreateWashLogDto): Promise<Vehicle> => {
  const { data } = await axiosClient.post<Vehicle>(`${BASE_URL}/${id}/wash-logs`, payload);
  return data;
};

export const fetchWashLogs = async (id: number): Promise<WashLog[]> => {
  const { data } = await axiosClient.get<WashLog[]>(`${BASE_URL}/${id}/wash-logs`);
  return data;
};
