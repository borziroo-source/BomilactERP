import axiosClient from './axiosClient';

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  userCount: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface PermissionDto {
  id: number;
  moduleId: string;
  subModuleId?: string;
  action: string;
  displayName: string;
  category: string;
}

export interface RolePermissionsDto {
  roleId: string;
  roleName: string;
  permissionIds: number[];
}

export const rolesService = {
  async getAll(): Promise<RoleDto[]> {
    const response = await axiosClient.get<RoleDto[]>('/roles');
    return response.data;
  },

  async create(data: CreateRoleDto): Promise<RoleDto> {
    const response = await axiosClient.post<RoleDto>('/roles', data);
    return response.data;
  },

  async update(id: string, data: CreateRoleDto): Promise<void> {
    await axiosClient.put(`/roles/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/roles/${id}`);
  }
};

export const permissionsService = {
  async getAll(): Promise<PermissionDto[]> {
    const response = await axiosClient.get<PermissionDto[]>('/permissions');
    return response.data;
  },

  async getRolePermissions(roleId: string): Promise<RolePermissionsDto> {
    const response = await axiosClient.get<RolePermissionsDto>(`/permissions/role/${roleId}`);
    return response.data;
  },

  async updateRolePermissions(roleId: string, permissionIds: number[]): Promise<void> {
    await axiosClient.put(`/permissions/role/${roleId}`, { permissionIds });
  }
};
