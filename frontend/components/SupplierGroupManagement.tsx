
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Layers, 
  Search,
  Palette,
  Users,
  CheckCircle,
  UserPlus,
  ArrowRight,
  User,
  AlertCircle
} from 'lucide-react';
import { SupplierGroup, Supplier } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import * as supplierGroupsApi from '../services/supplierGroups';
import { fetchSuppliers } from '../services/suppliers';

// Tailwind color preset options for groups
const COLOR_PRESETS = [
  { name: 'Kék', class: 'bg-blue-100 text-blue-800' },
  { name: 'Indigo', class: 'bg-indigo-100 text-indigo-800' },
  { name: 'Smaragd', class: 'bg-emerald-100 text-emerald-800' },
  { name: 'Teal', class: 'bg-teal-100 text-teal-800' },
  { name: 'Narancs', class: 'bg-orange-100 text-orange-800' },
  { name: 'Lila', class: 'bg-purple-100 text-purple-800' },
  { name: 'Rózsaszín', class: 'bg-pink-100 text-pink-800' },
  { name: 'Slate', class: 'bg-slate-100 text-slate-800' },
];

const SupplierGroupManagement: React.FC = () => {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<SupplierGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<SupplierGroup>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ message: string; partnersCount?: number } | null>(null);
  
  // Selection state for member management
  const [memberSearch, setMemberSearch] = useState('');

  // Load groups and suppliers on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [groupsData, suppliersData] = await Promise.all([
        supplierGroupsApi.fetchSupplierGroups(),
        fetchSuppliers()
      ]);
      // Convert API DTOs to frontend types
      setGroups(groupsData.map(g => ({ id: g.id.toString(), name: g.name, color: g.color })));
      // Mock conversion for suppliers - you'll need to adjust this based on your actual API
      setSuppliers(suppliersData.map(s => ({
        id: s.id.toString(),
        name: s.name,
        cui: s.taxNumber || '',
        legalType: 'INDIVIDUAL' as const,
        exploitationCode: '',
        apiaCode: '',
        hasSubsidy8: false,
        bankName: '',
        bankBranch: '',
        iban: '',
        type: s.type === 1 ? 'FARMER' as const : 'COOPERATIVE' as const,
        groupId: s.supplierGroupId?.toString() || '',
        address: s.address || '',
        phone: s.phone || '',
        status: s.isActive ? 'ACTIVE' as const : 'INACTIVE' as const
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt az adatok betöltésekor');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  const handleAddNew = () => {
    setCurrentGroup({
      name: '',
      color: COLOR_PRESETS[0].class
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (group: SupplierGroup) => {
    setCurrentGroup({ ...group });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleManageMembers = (group: SupplierGroup) => {
    setCurrentGroup(group);
    setMemberSearch('');
    setIsMemberModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setCurrentGroup({ id });
    setDeleteError(null);
    setIsDeleteWarningOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentGroup.id) return;
    
    try {
      setLoading(true);
      await supplierGroupsApi.deleteSupplierGroup(parseInt(currentGroup.id));
      setGroups(groups.filter(g => g.id !== currentGroup.id));
      setIsDeleteWarningOpen(false);
      setDeleteError(null);
    } catch (err) {
      // Parse the error message to check if it's a "in use" error
      const errorMessage = err instanceof Error ? err.message : String(err);
      try {
        const errorData = JSON.parse(errorMessage);
        setDeleteError({
          message: errorData.message || 'A csoport nem törölhető, mert használatban van.',
          partnersCount: errorData.partnersCount
        });
      } catch {
        setDeleteError({
          message: 'A csoport nem törölhető, mert használatban van.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGroup.name) return;

    try {
      setLoading(true);
      if (isEditing && currentGroup.id) {
        await supplierGroupsApi.updateSupplierGroup(parseInt(currentGroup.id), {
          name: currentGroup.name,
          color: currentGroup.color || COLOR_PRESETS[0].class
        });
        setGroups(groups.map(g => g.id === currentGroup.id ? currentGroup as SupplierGroup : g));
      } else {
        const newGroup = await supplierGroupsApi.createSupplierGroup({
          name: currentGroup.name,
          color: currentGroup.color || COLOR_PRESETS[0].class
        });
        setGroups([...groups, { id: newGroup.id.toString(), name: newGroup.name, color: newGroup.color }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt a mentés során');
      console.error('Error saving group:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logic for assigning/removing suppliers
  const toggleMember = (supplierId: string, targetGroupId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        // If it's already in the group, remove it (empty string)
        // Otherwise set to targetGroupId (this handles moving from another group too)
        const newGroupId = s.groupId === targetGroupId ? '' : targetGroupId;
        return { ...s, groupId: newGroupId };
      }
      return s;
    }));
  };

  const currentGroupMembers = useMemo(() => {
    return suppliers.filter(s => s.groupId === currentGroup.id);
  }, [suppliers, currentGroup.id]);

  const availableSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.groupId !== currentGroup.id && 
      s.name.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [suppliers, currentGroup.id, memberSearch]);

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('sup.groups_title')}</h2>
          <p className="text-sm text-slate-500">{t('sup.groups_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Keresés..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center transition shadow-lg shadow-blue-600/20 whitespace-nowrap"
          >
            <Plus size={18} className="mr-2" />
            {t('sup.groups_new_btn')}
          </button>
        </div>
      </div>

      {/* List View (Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">{t('sup.groups_table_name')}</th>
                <th className="px-6 py-4">{t('sup.groups_table_color')}</th>
                <th className="px-6 py-4">{t('sup.groups_table_count')}</th>
                <th className="px-6 py-4">Tagok (Minta)</th>
                <th className="px-6 py-4 text-right">{t('sup.table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroups.map((group, index) => {
                const groupSuppliers = suppliers.filter(s => s.groupId === group.id);
                const count = groupSuppliers.length;
                return (
                  <tr key={group.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${group.color.split(' ')[0]}`}></div>
                        <div className="font-bold text-slate-800 text-base">{group.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${group.color}`}>
                        {group.color.split(' ')[1].replace('text-', '').split('-')[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center font-bold text-slate-700">
                        <Users size={14} className="mr-1.5 text-slate-400" />
                        {count} db
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {groupSuppliers.slice(0, 2).map(s => (
                          <span key={s.id} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                            {s.name}
                          </span>
                        ))}
                        {count > 2 && <span className="text-[10px] text-slate-400 px-1 font-bold">+{count - 2}</span>}
                        {count === 0 && <span className="text-[10px] text-slate-300 italic">Üres csoport</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 transition-opacity">
                        <button 
                          onClick={() => handleManageMembers(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                          title={t('sup.groups_manage_members')}
                        >
                          <UserPlus size={16} />
                          <span className="hidden lg:inline">{t('sup.groups_manage_members')}</span>
                        </button>
                        <button 
                          onClick={() => handleEdit(group)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(group.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredGroups.length === 0 && (
             <div className="p-12 text-center text-slate-400 italic">
               <Layers size={48} className="mx-auto mb-3 opacity-20" />
               Nincs a keresésnek megfelelő csoport.
             </div>
          )}
        </div>
      </div>

      {/* Member Management Modal */}
      {isMemberModalOpen && currentGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-lg flex items-center">
                    <UserPlus className="mr-3 text-blue-400" size={20} />
                    {t('sup.groups_manage_members')}
                  </h3>
                  <p className="text-xs text-slate-400 uppercase font-black">{currentGroup.name}</p>
               </div>
               <button onClick={() => setIsMemberModalOpen(false)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row gap-8 overflow-hidden h-full">
              
              {/* Left Column: Group Members */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center">
                    <Users size={14} className="mr-2 text-blue-500" />
                    {t('sup.groups_in_group')}
                  </h4>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                    {currentGroupMembers.length}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mb-3 italic">{t('sup.groups_remove_hint')}</div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                  {currentGroupMembers.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl group transition hover:border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 leading-none mb-1">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.cui}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleMember(s.id, currentGroup.id!)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {currentGroupMembers.length === 0 && (
                    <div className="text-center py-10 text-slate-300 italic text-sm">Üres csoport</div>
                  )}
                </div>
              </div>

              {/* Middle Divider */}
              <div className="hidden md:flex flex-col items-center justify-center">
                <div className="h-full w-px bg-slate-100"></div>
                <div className="my-4 text-slate-300"><ArrowRight size={24} /></div>
                <div className="h-full w-px bg-slate-100"></div>
              </div>

              {/* Right Column: Other Suppliers */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-4">
                  <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center mb-3">
                    <UserPlus size={14} className="mr-2 text-slate-400" />
                    {t('sup.groups_available')}
                  </h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Beszállító keresése..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mb-3 italic">{t('sup.groups_add_hint')}</div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                  {availableSuppliers.map(s => {
                    const otherGroup = groups.find(g => g.id === s.groupId);
                    return (
                      <button 
                        key={s.id}
                        onClick={() => toggleMember(s.id, currentGroup.id!)}
                        className="w-full text-left flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 leading-none mb-1">{s.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {otherGroup ? (
                                <span className={`font-black uppercase ${otherGroup.color.split(' ')[1]}`}>Tag: {otherGroup.name}</span>
                              ) : 'Nincs csoportban'}
                            </div>
                          </div>
                        </div>
                        <Plus size={16} className="text-slate-300 group-hover:text-blue-600" />
                      </button>
                    );
                  })}
                  {availableSuppliers.length === 0 && (
                    <div className="text-center py-10 text-slate-300 italic text-sm">Nincs több termelő</div>
                  )}
                </div>
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsMemberModalOpen(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition shadow-lg"
              >
                Kész
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800 flex items-center">
                 <Palette className="mr-3 text-blue-600" size={20} />
                 {isEditing ? 'Csoport Szerkesztése' : 'Új Csoport'}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-200 text-slate-500 p-1.5 rounded-lg transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('sup.groups_form_name')}</label>
                <input 
                  type="text" 
                  required
                  value={currentGroup.name} 
                  onChange={(e) => setCurrentGroup({...currentGroup, name: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium bg-slate-50 focus:bg-white transition-all"
                  placeholder="Pl: Gyergyó-vidék"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">{t('sup.groups_form_color')}</label>
                <div className="grid grid-cols-4 gap-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.class}
                      type="button"
                      onClick={() => setCurrentGroup({...currentGroup, color: preset.class})}
                      className={`
                        h-10 rounded-xl border-2 transition-all flex items-center justify-center
                        ${preset.class}
                        ${currentGroup.color === preset.class ? 'border-slate-800 ring-2 ring-slate-200 scale-110' : 'border-transparent hover:scale-105'}
                      `}
                      title={preset.name}
                    >
                      {currentGroup.color === preset.class && <CheckCircle size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Előnézet</p>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-tight ${currentGroup.color || 'bg-slate-100'}`}>
                  {currentGroup.name || 'MINTA NÉV'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition"
                 >
                   {t('sup.cancel_btn')}
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center"
                 >
                   <Save size={18} className="mr-2" />
                   {t('sup.save_btn')}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Warning Dialog */}
      {isDeleteWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
               <h3 className="font-bold text-lg text-red-800 flex items-center">
                 <AlertCircle className="mr-3 text-red-600" size={20} />
                 Csoport törlése
               </h3>
               <button 
                 onClick={() => {
                   setIsDeleteWarningOpen(false);
                   setDeleteError(null);
                 }} 
                 className="hover:bg-red-100 text-red-500 p-1.5 rounded-lg transition"
               >
                 <X size={20}/>
               </button>
            </div>
            
            <div className="p-6">
              {deleteError ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-bold text-red-800 mb-1">A csoport nem törölhető!</p>
                      <p className="text-sm text-red-700">{deleteError.message}</p>
                      {deleteError.partnersCount && (
                        <p className="text-sm text-red-700 mt-2">
                          Jelenleg <strong>{deleteError.partnersCount}</strong> beszállító tartozik ehhez a csoporthoz.
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    A csoport törléséhez először mozgasd át vagy töröld a beszállítókat, akik ebben a csoportban vannak.
                  </p>
                </div>
              ) : (
                <p className="text-slate-700">
                  Biztosan törölni szeretnéd ezt a csoportot? Ez a művelet nem vonható vissza.
                </p>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsDeleteWarningOpen(false);
                  setDeleteError(null);
                }}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition"
              >
                {deleteError ? 'Bezárás' : 'Mégse'}
              </button>
              {!deleteError && (
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Törlés...' : 'Törlés'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierGroupManagement;
