import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Shield, Users, Search, AlertCircle } from 'lucide-react';
import { rolesService, RoleDto, CreateRoleDto } from '../services/rolesService';
import { usePermission } from '../hooks/usePermission';

const BUILTIN_ROLES = ['Admin', 'Manager', 'Internal', 'Driver', 'Agent', 'Partner'];

const RoleManagement: React.FC = () => {
  const { canCreate, canUpdate, canDelete } = usePermission('admin', 'admin_roles');
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState<CreateRoleDto>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const data = await rolesService.getAll();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const handleAddNew = () => {
    setForm({ name: '', description: '' });
    setIsEditing(false);
    setEditingId('');
    setIsModalOpen(true);
  };

  const handleEdit = (role: RoleDto) => {
    setForm({ name: role.name, description: role.description || '' });
    setIsEditing(true);
    setEditingId(role.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a szerepkört?')) return;
    try {
      await rolesService.delete(id);
      await loadRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await rolesService.update(editingId, form);
      } else {
        await rolesService.create(form);
      }
      setIsModalOpen(false);
      await loadRoles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Szerepkörök Kezelése</h2>
          <p className="text-sm text-slate-500">Felhasználói szerepkörök és jogosultsági csoportok</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Keresés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
          {canCreate && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Új Szerepkör
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Betöltés...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map(role => (
              <div key={role.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{role.name}</h3>
                      {BUILTIN_ROLES.includes(role.name) && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Alap</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canUpdate && (
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Szerkesztés"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {canDelete && !BUILTIN_ROLES.includes(role.name) && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Törlés"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={12} />
                  <span>{role.userCount} felhasználó</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                {isEditing ? <Edit2 size={18} className="mr-2 text-blue-600" /> : <Plus size={18} className="mr-2 text-blue-600" />}
                {isEditing ? 'Szerepkör Szerkesztése' : 'Új Szerepkör'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Szerepkör neve</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="pl. Supervisor"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium">
                  Mégse
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Save size={16} /> {saving ? 'Mentés...' : 'Mentés'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
