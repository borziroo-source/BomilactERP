
import React, { useState, useMemo } from 'react';
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
  Settings2
} from 'lucide-react';
import { SupplierGroup, Supplier } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

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

const INITIAL_GROUPS: SupplierGroup[] = [
  { id: 'gr1', name: 'Alcsík', color: 'bg-blue-100 text-blue-800' },
  { id: 'gr2', name: 'Felső-Csík', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'gr3', name: 'Gyergyó-szék', color: 'bg-teal-100 text-teal-800' },
  { id: 'gr4', name: 'Udvarhely-szék', color: 'bg-orange-100 text-orange-800' },
];

// Fix: Remove properties not defined in the Supplier interface (contractNumber, contractStartDate, contractEndDate, milkQuotaLiters, basePricePerLiter).
const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Kovács István E.V. (Gazda)', cui: '19870512-112233', legalType: 'INDIVIDUAL', exploitationCode: 'RO12', apiaCode: 'API-1', hasSubsidy8: true, bankName: 'OTP', bankBranch: 'Csík', iban: 'RO12', type: 'FARMER', groupId: 'gr1', address: 'Csíkszereda', phone: '0740', status: 'ACTIVE' },
  { id: 'sup2', name: 'Nagy Béla', cui: 'CUI2', legalType: 'INDIVIDUAL', exploitationCode: 'RO13', apiaCode: 'API-2', hasSubsidy8: false, bankName: 'BT', bankBranch: 'Csík', iban: 'RO13', type: 'FARMER', groupId: 'gr1', address: 'Csíkszereda', phone: '0741', status: 'ACTIVE' },
  { id: 'sup3', name: 'Székely Tej Kft.', cui: 'CUI3', legalType: 'COMPANY', exploitationCode: 'RO14', apiaCode: 'API-3', hasSubsidy8: true, bankName: 'BCR', bankBranch: 'Udvarhely', iban: 'RO14', type: 'COOPERATIVE', groupId: 'gr4', address: 'Székelyudvarhely', phone: '0742', status: 'ACTIVE' },
  { id: 'sup4', name: 'Zöld Mező Bt.', cui: 'CUI4', legalType: 'COMPANY', exploitationCode: 'RO15', apiaCode: 'API-4', hasSubsidy8: false, bankName: 'OTP', bankBranch: 'Gyergyó', iban: 'RO15', type: 'COLLECTION_POINT', groupId: '', address: 'Gyergyó', phone: '0743', status: 'ACTIVE' },
  { id: 'sup5', name: 'Varga Sándor', cui: 'CUI5', legalType: 'INDIVIDUAL', exploitationCode: 'RO16', apiaCode: 'API-5', hasSubsidy8: true, bankName: 'BT', bankBranch: 'Gyergyó', iban: 'RO16', type: 'FARMER', groupId: 'gr3', address: 'Gyergyó', phone: '0744', status: 'ACTIVE' },
];

const SupplierGroupManagement: React.FC = () => {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<SupplierGroup[]>(INITIAL_GROUPS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Partial<SupplierGroup>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Selection state for member management
  const [memberSearch, setMemberSearch] = useState('');

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

  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a csoportot?')) {
      setGroups(groups.filter(g => g.id !== id));
      // Reassign suppliers to no group
      setSuppliers(suppliers.map(s => s.groupId === id ? { ...s, groupId: '' } : s));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGroup.name) return;

    if (isEditing && currentGroup.id) {
      setGroups(groups.map(g => g.id === currentGroup.id ? currentGroup as SupplierGroup : g));
    } else {
      const newGroup: SupplierGroup = {
        ...currentGroup as SupplierGroup,
        id: `gr-${Math.floor(Math.random() * 10000)}`
      };
      setGroups([...groups, newGroup]);
    }
    setIsModalOpen(false);
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
    </div>
  );
};

export default SupplierGroupManagement;
