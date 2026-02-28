import { useAuth } from '../contexts/AuthContext';

interface PermissionFlags {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export const usePermission = (moduleId: string, subModuleId?: string): PermissionFlags => {
  const { hasPermission } = useAuth();
  const sub = subModuleId ?? null;

  return {
    canView: hasPermission(moduleId, sub, 'view'),
    canCreate: hasPermission(moduleId, sub, 'create'),
    canUpdate: hasPermission(moduleId, sub, 'update'),
    canDelete: hasPermission(moduleId, sub, 'delete'),
    canExport: hasPermission(moduleId, sub, 'export'),
  };
};
