import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, X, Save, User, Shield, Mail, Briefcase,
  CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { usersService, UserDto, CreateUserDto, UpdateUserDto } from '../services/usersService';
import { rolesService, RoleDto } from '../services/rolesService';
import { usePermission } from '../hooks/usePermission';

const UserManagement: React.FC = () => {
  const { canCreate, canUpdate, canDelete } = usePermission('admin', 'admin_users');
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<CreateUserDto & { isActive: boolean }>>({
    userName: '', email: '', password: '', firstName: '', lastName: '', department: '', roles: [], isActive: true
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData] = await Promise.all([usersService.getAll(), rolesService.getAll()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredUsers = users.filter(u =>
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setForm({ userName: '', email: '', password: '', firstName: '', lastName: '', department: '', roles: [], isActive: true });
    setIsEditing(false);
    setEditingId('');
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserDto) => {
    setForm({
      userName: user.userName,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      department: user.department || '',
      roles: user.roles,
      isActive: user.isActive
    });
    setIsEditing(true);
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) return;
    try {
      await usersService.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        const dto: UpdateUserDto = {
          email: form.email || '',
          firstName: form.firstName,
          lastName: form.lastName,
          department: form.department,
          isActive: form.isActive ?? true,
          roles: form.roles || [],
        };
        await usersService.update(editingId, dto);
      } else {
        const dto: CreateUserDto = {
          userName: form.userName || form.email || '',
          email: form.email || '',
          password: form.password || '',
          firstName: form.firstName,
          lastName: form.lastName,
          department: form.department,
          roles: form.roles || [],
        };
        await usersService.create(dto);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleName: string) => {
    const current = form.roles || [];
    setForm({
      ...form,
      roles: current.includes(roleName)
        ? current.filter(r => r !== roleName)
        : [...current, roleName]
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Felhasználók Kezelése</h2>
          <p className="text-sm text-slate-500">Rendszerhozzáférések és jogosultságok karbantartása</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Keresés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
          <button onClick={loadData} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Frissítés">
            <RefreshCw size={18} />
          </button>
          {canCreate && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={18} /> Új Felhasználó
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <th className="px-6 py-4">Név / Email</th>
                  <th className="px-6 py-4">Szerepkörök</th>
                  <th className="px-6 py-4">Részleg</th>
                  <th className="px-6 py-4">Státusz</th>
                  <th className="px-6 py-4">Utolsó Belépés</th>
                  <th className="px-6 py-4 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 flex-shrink-0">
                          {(user.firstName || user.userName).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {user.firstName || user.lastName ? `${user.lastName} ${user.firstName}` : user.userName}
                          </div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {role}
                          </span>
                        ))}
                        {user.roles.length === 0 && <span className="text-xs text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.department || '—'}</td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">
                          <CheckCircle size={12} className="mr-1" /> Aktív
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded w-fit">
                          <XCircle size={12} className="mr-1" /> Inaktív
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('hu-HU') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(user)}
                          disabled={!canUpdate}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Szerkesztés"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={!canDelete}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Törlés"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Nincs találat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                {isEditing ? <Edit2 size={18} className="mr-2 text-blue-600" /> : <Plus size={18} className="mr-2 text-blue-600" />}
                {isEditing ? 'Felhasználó Szerkesztése' : 'Új Felhasználó'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-slate-400" /> Keresztnév
                  </label>
                  <input type="text" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Keresztnév" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vezetéknév</label>
                  <input type="text" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Vezetéknév" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> Email cím *
                </label>
                <input type="email" required value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="pelda@bomilact.hu" />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jelszó *</label>
                  <input type="password" required={!isEditing} value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Min. 8 karakter" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" /> Részleg
                </label>
                <input type="text" value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="pl. Gyártás, Pénzügy" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Shield size={13} className="text-slate-400" /> Szerepkörök
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        (form.roles || []).includes(role.name)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Státusz</label>
                  <select value={form.isActive ? 'true' : 'false'} onChange={e => setForm({...form, isActive: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="true">Aktív</option>
                    <option value="false">Inaktív</option>
                  </select>
                </div>
              )}

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

export default UserManagement;