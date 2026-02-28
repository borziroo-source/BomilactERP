import React, { useState, useEffect, useCallback } from 'react';
import { Save, Shield, CheckSquare, Square, AlertCircle, X, Check } from 'lucide-react';
import { rolesService, permissionsService, RoleDto, PermissionDto } from '../services/rolesService';
import { usePermission } from '../hooks/usePermission';

const ACTIONS = ['view', 'create', 'update', 'delete', 'export'];
const ACTION_LABELS: Record<string, string> = {
  view: 'Megtekint',
  create: 'Létrehoz',
  update: 'Módosít',
  delete: 'Töröl',
  export: 'Export',
};
const ACTION_COLORS: Record<string, string> = {
  view: 'text-blue-600',
  create: 'text-green-600',
  update: 'text-amber-600',
  delete: 'text-red-600',
  export: 'text-purple-600',
};

const PermissionMatrix: React.FC = () => {
  const { canUpdate } = usePermission('admin', 'admin_permissions');
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [grantedIds, setGrantedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    Promise.all([rolesService.getAll(), permissionsService.getAll()])
      .then(([r, p]) => {
        setRoles(r);
        setPermissions(p);
        if (r.length > 0) setSelectedRoleId(r[0].id);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const loadRolePermissions = useCallback(async (roleId: string) => {
    try {
      const data = await permissionsService.getRolePermissions(roleId);
      setGrantedIds(new Set(data.permissionIds));
      setIsDirty(false);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) loadRolePermissions(selectedRoleId);
  }, [selectedRoleId, loadRolePermissions]);

  const togglePermission = (id: number) => {
    if (!canUpdate) return;
    setGrantedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setIsDirty(true);
  };

  const toggleRow = (rowPermIds: number[]) => {
    if (!canUpdate) return;
    const allGranted = rowPermIds.every(id => grantedIds.has(id));
    setGrantedIds(prev => {
      const next = new Set(prev);
      rowPermIds.forEach(id => allGranted ? next.delete(id) : next.add(id));
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await permissionsService.updateRolePermissions(selectedRoleId, Array.from(grantedIds));
      setIsDirty(false);
      setSuccessMsg('Jogosultságok sikeresen mentve!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by subModuleId
  const grouped = permissions.reduce<Record<string, { category: string; subModuleId: string; perms: PermissionDto[] }>>(
    (acc, p) => {
      const key = `${p.moduleId}__${p.subModuleId || ''}`;
      if (!acc[key]) acc[key] = { category: p.category, subModuleId: p.subModuleId || p.moduleId, perms: [] };
      acc[key].perms.push(p);
      return acc;
    }, {}
  );

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Jogosultság Mátrix</h2>
            <p className="text-sm text-slate-500">Szerepkörönkénti modul és funkció hozzáférések beállítása</p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && canUpdate && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Save size={16} />
                {isSaving ? 'Mentés...' : 'Változások Mentése'}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* Role Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRoleId === role.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Shield size={14} />
                {role.name}
              </button>
            ))}
          </div>
        </div>

        {selectedRole && (
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Shield size={14} className="text-blue-500" />
              <span>Szerkesztett szerepkör: <strong className="text-slate-700">{selectedRole.name}</strong></span>
              {!canUpdate && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Csak megtekintés</span>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-3 py-2.5 text-slate-600 font-semibold text-xs uppercase w-64">Modul / Funkció</th>
                    {ACTIONS.map(action => (
                      <th key={action} className={`px-2 py-2.5 text-center text-xs font-semibold ${ACTION_COLORS[action]}`}>
                        {ACTION_LABELS[action]}
                      </th>
                    ))}
                    <th className="px-2 py-2.5 text-center text-xs text-slate-500 font-semibold">Mind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Object.entries(grouped).map(([key, { category, subModuleId, perms }]) => {
                    const rowPermIds = perms.map(p => p.id);
                    const allGranted = rowPermIds.every(id => grantedIds.has(id));
                    const someGranted = rowPermIds.some(id => grantedIds.has(id));

                    // Get perm for each action
                    const permByAction = ACTIONS.reduce<Record<string, PermissionDto | undefined>>((acc, a) => {
                      acc[a] = perms.find(p => p.action === a);
                      return acc;
                    }, {});

                    return (
                      <tr key={key} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2">
                          <div className="text-xs text-slate-400">{category}</div>
                          <div className="font-medium text-slate-700 text-sm">{subModuleId}</div>
                        </td>
                        {ACTIONS.map(action => {
                          const perm = permByAction[action];
                          if (!perm) return <td key={action} className="px-2 py-2 text-center"><span className="text-slate-200">—</span></td>;
                          const granted = grantedIds.has(perm.id);
                          return (
                            <td key={action} className="px-2 py-2 text-center">
                              <button
                                onClick={() => togglePermission(perm.id)}
                                disabled={!canUpdate}
                                title={`${ACTION_LABELS[action]}: ${granted ? 'Engedélyezett' : 'Tiltott'}`}
                                className={`p-1 rounded transition-colors ${canUpdate ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'}`}
                              >
                                {granted
                                  ? <CheckSquare size={18} className={ACTION_COLORS[action]} />
                                  : <Square size={18} className="text-slate-200" />
                                }
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() => toggleRow(rowPermIds)}
                            disabled={!canUpdate}
                            title="Összes be/ki"
                            className={`p-1 rounded transition-colors ${canUpdate ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'}`}
                          >
                            {allGranted
                              ? <CheckSquare size={18} className="text-slate-600" />
                              : someGranted
                                ? <CheckSquare size={18} className="text-slate-300" />
                                : <Square size={18} className="text-slate-200" />
                            }
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionMatrix;
