import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  User, 
  Shield, 
  Mail, 
  Briefcase,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AppUser, UserRole } from '../types';

// Mock data for initial state
const INITIAL_USERS: AppUser[] = [
  { id: '1', name: 'Kovács János', email: 'janos.kovacs@bomilact.hu', role: UserRole.INTERNAL, department: 'Gyártás', status: 'ACTIVE', lastLogin: '2023-10-26 08:30' },
  { id: '2', name: 'Nagy Éva', email: 'eva.nagy@bomilact.hu', role: UserRole.INTERNAL, department: 'Pénzügy', status: 'ACTIVE', lastLogin: '2023-10-25 16:45' },
  { id: '3', name: 'Tóth Gábor', email: 'gabor.toth@logistics.hu', role: UserRole.DRIVER, department: 'Flotta', status: 'INACTIVE', lastLogin: '2023-10-20 09:15' },
  { id: '4', name: 'City ABC Kft.', email: 'rendeles@cityabc.hu', role: UserRole.PARTNER, department: 'Kiskereskedelem', status: 'ACTIVE', lastLogin: '2023-10-26 10:00' },
  { id: '5', name: 'Varga Péter', email: 'peter.varga@bomilact.hu', role: UserRole.INTERNAL, department: 'Adminisztráció', status: 'ACTIVE', lastLogin: '2023-10-26 07:45' },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<AppUser>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD Operations
  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEdit = (user: AppUser) => {
    setCurrentUser({ ...user });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentUser({
      name: '',
      email: '',
      role: UserRole.INTERNAL,
      department: '',
      status: 'ACTIVE',
      lastLogin: '-'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.name || !currentUser.email) return;

    if (isEditing && currentUser.id) {
      // Update
      setUsers(users.map(u => u.id === currentUser.id ? currentUser as AppUser : u));
    } else {
      // Create
      const newUser: AppUser = {
        ...currentUser as AppUser,
        id: Math.random().toString(36).substr(2, 9),
        lastLogin: 'Még nem lépett be'
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header & Toolbar */}
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
              placeholder="Keresés név vagy email alapján..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Új Felhasználó
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <th className="px-6 py-4">Név / Email</th>
                <th className="px-6 py-4">Szerepkör</th>
                <th className="px-6 py-4">Részleg</th>
                <th className="px-6 py-4">Státusz</th>
                <th className="px-6 py-4">Utolsó Belépés</th>
                <th className="px-6 py-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === UserRole.INTERNAL ? 'bg-blue-100 text-blue-800' : 
                          user.role === UserRole.DRIVER ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.department || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'ACTIVE' ? (
                        <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">
                          <CheckCircle size={12} className="mr-1" /> Aktív
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded w-fit">
                          <XCircle size={12} className="mr-1" /> Inaktív
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Szerkesztés"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Törlés"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nincs találat a keresési feltételeknek megfelelően.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                {isEditing ? <Edit2 size={18} className="mr-2 text-blue-600" /> : <Plus size={18} className="mr-2 text-blue-600" />}
                {isEditing ? 'Felhasználó Szerkesztése' : 'Új Felhasználó Létrehozása'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                  <User size={14} className="mr-2 text-slate-400" /> Név
                </label>
                <input 
                  type="text" 
                  required
                  value={currentUser.name || ''}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Teljes név"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                  <Mail size={14} className="mr-2 text-slate-400" /> Email Cím
                </label>
                <input 
                  type="email" 
                  required
                  value={currentUser.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pelda@bomilact.hu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                    <Shield size={14} className="mr-2 text-slate-400" /> Jogosultság
                  </label>
                  <select 
                    value={currentUser.role}
                    onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as UserRole})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={UserRole.INTERNAL}>INTERNAL (Belső)</option>
                    <option value={UserRole.DRIVER}>DRIVER (Sofőr)</option>
                    <option value={UserRole.PARTNER}>PARTNER (Bolt)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                     Státusz
                  </label>
                  <select 
                    value={currentUser.status}
                    onChange={(e) => setCurrentUser({...currentUser, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="ACTIVE">Aktív</option>
                    <option value="INACTIVE">Inaktív</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                  <Briefcase size={14} className="mr-2 text-slate-400" /> Részleg / Pozíció
                </label>
                <input 
                  type="text" 
                  value={currentUser.department || ''}
                  onChange={(e) => setCurrentUser({...currentUser, department: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. Gyártásvezető vagy Flotta"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Mégse
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Mentés
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