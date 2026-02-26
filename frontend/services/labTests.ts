import axiosClient from './axiosClient';

const BASE_URL = '/LabTests';

export type SampleType = 'RAW_MILK' | 'WIP' | 'FINISHED_GOOD';
export type LabTestStatus = 'PENDING' | 'COMPLETED';
export type LabTestResult = 'PASS' | 'FAIL' | 'WARNING';
export type AntibioticResult = 'NEGATIVE' | 'POSITIVE';

export interface LabTestDto {
  id: number;
  sampleId: string;
  date: string;
  sourceName: string;
  type: SampleType;
  fat?: number | null;
  protein?: number | null;
  ph?: number | null;
  density?: number | null;
  water?: number | null;
  antibiotic?: AntibioticResult | null;
  scc?: number | null;
  cfu?: number | null;
  status: LabTestStatus;
  result: LabTestResult;
  inspector: string;
  notes?: string | null;
}

export interface LabTestInput {
  sampleId: string;
  date: string;
  sourceName: string;
  type: SampleType;
  fat?: number | null;
  protein?: number | null;
  ph?: number | null;
  density?: number | null;
  water?: number | null;
  antibiotic?: AntibioticResult | null;
  scc?: number | null;
  cfu?: number | null;
  status: LabTestStatus;
  inspector: string;
  notes?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LabTestFilterParams {
  searchTerm?: string;
  type?: SampleType | 'ALL';
  status?: LabTestStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export const fetchLabTests = async (params: LabTestFilterParams = {}): Promise<PagedResult<LabTestDto>> => {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.searchTerm) queryParams.searchTerm = params.searchTerm;
  if (params.type && params.type !== 'ALL') queryParams.type = params.type;
  if (params.status && params.status !== 'ALL') queryParams.status = params.status;
  if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
  if (params.dateTo) queryParams.dateTo = params.dateTo;

  const { data } = await axiosClient.get<PagedResult<LabTestDto>>(BASE_URL, { params: queryParams });
  return data;
};

export const fetchLabTestById = async (id: number): Promise<LabTestDto> => {
  const { data } = await axiosClient.get<LabTestDto>(`${BASE_URL}/${id}`);
  return data;
};

export const createLabTest = async (payload: LabTestInput): Promise<LabTestDto> => {
  const { data } = await axiosClient.post<LabTestDto>(BASE_URL, payload);
  return data;
};

export const updateLabTest = async (id: number, payload: LabTestInput): Promise<void> => {
  await axiosClient.put(`${BASE_URL}/${id}`, payload);
};

export const deleteLabTest = async (id: number): Promise<void> => {
  await axiosClient.delete(`${BASE_URL}/${id}`);
};
