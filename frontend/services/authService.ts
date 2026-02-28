import axiosClient from './axiosClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface CurrentUser {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  isActive: boolean;
  roles: string[];
  permissions: UserPermission[];
}

export interface UserPermission {
  moduleId: string;
  subModuleId?: string;
  action: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await axiosClient.get<CurrentUser>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }
};
