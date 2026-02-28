import axiosClient from './axiosClient';

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roles: string[];
}

export interface CreateUserDto {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  roles: string[];
}

export interface UpdateUserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  isActive: boolean;
  roles: string[];
}

export const usersService = {
  async getAll(): Promise<UserDto[]> {
    const response = await axiosClient.get<UserDto[]>('/users');
    return response.data;
  },

  async getById(id: string): Promise<UserDto> {
    const response = await axiosClient.get<UserDto>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserDto): Promise<UserDto> {
    const response = await axiosClient.post<UserDto>('/users', data);
    return response.data;
  },

  async update(id: string, data: UpdateUserDto): Promise<void> {
    await axiosClient.put(`/users/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/users/${id}`);
  }
};
