
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  FileSignature, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Droplet,
  MoreVertical,
  CheckCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Contract } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const MOCK_CONTRACTS: Contract[] = [
  { 
    id: 'cnt-1', 
    supplierId: 'sup1',
    supplierName: 'Kovács István E.V. (Gazda)', 
    contractNumber: 'CTR-2023/001',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    milkQuotaLiters: 1500,
    basePricePerLiter: 2.10,
    status: 'ACTIVE'
  },
  { 
    id: 'cnt-2', 
    supplierId: 'sup2',
    supplierName: 'Agro Lacto Coop (Szövetkezet)', 
    contractNumber: 'CTR-2022/088',
    startDate: '2022-01-01',
    endDate: '2024-12-31',
    milkQuotaLiters: 25000,
    basePricePerLiter: 2.35,
    status: 'ACTIVE'
  },
  { 
    id: 'cnt-3', 
    supplierId: 'sup3',
    supplierName: 'Gyergyó Tejgyűjtő Kft.', 
    contractNumber: 'CTR-2023/044',
    startDate: '2023-03-01',
    endDate: '2023-10-31', 
    milkQuotaLiters: 12000,
    basePricePerLiter: 2.15,
    status: 'ACTIVE'
  }
];

const ContractManagement: React.FC = () => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<Partial<Contract>>({});

  const stats = useMemo(() => {
    const totalVolume = contracts.reduce((acc, c) => acc + c.milkQuotaLiters, 0);
    const avgPrice = contracts.length > 0 ? (contracts.reduce((acc, c) => acc + c.basePricePerLiter, 0) / contracts.length).toFixed(2) : '0';
    const expiring = contracts.filter(c => {
      const days = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days < 30;
    }).length;
    return { totalVolume, avgPrice, expiring };
  }, [contracts]);

  const filteredContracts = contracts.filter(c => 
    c.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (contract: Contract) => {
    setCurrentContract({ ...contract });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setContracts(contracts.map(c => c.id === currentContract.id ? currentContract as Contract : c));
    setIsModalOpen(false);
  };

  const getContractStatusColor = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'text-red-600 bg-red-50 border-red-100';
    if (days < 30) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-green-600 bg-green-50 border-green-100';
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{t('cnt.title')}</h2>
                <p className="text-sm text-slate-500">{t('cnt.subtitle')}</p>
              </div>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition">
                 <RefreshCw size={18} className="mr-2" />
                 {t('cnt.batch_price_update')}
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                 <div className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase mb-1">
                   <Droplet size={14} /> {t('cnt.quota_usage')}
                 </div>
                 <div className="text-2xl font-black text-blue-900">{stats.totalVolume.toLocaleString()} L</div>
                 <div className="w-full bg-blue-200 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{width: '78%'}}></div>
                 </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                 <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase mb-1">
                   <DollarSign size={14} /> {t('cnt.price_avg')}
                 </div>
                 <div className="text-2xl font-black text-emerald-900">{stats.avgPrice} RON/L</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                 <div className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase mb-1">
                   <AlertTriangle size={14} /> {t('cnt.expiring_soon')}
                 </div>
                 <div className="text-2xl font-black text-red-900">{stats.expiring} db</div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. List & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
            <div className="relative flex-1">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder={t('sup.search_placeholder')} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
               />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition"><BarChart3 size={20} /></button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                     <th className="px-6 py-4">Szerződés / Beszállító</th>
                     <th className="px-6 py-4">{t('cnt.start_date')}</th>
                     <th className="px-6 py-4">{t('cnt.end_date')}</th>
                     <th className="px-6 py-4 text-right">{t('cnt.quota')}</th>
                     <th className="px-6 py-4 text-right">{t('cnt.base_price')}</th>
                     <th className="px-6 py-4 text-right">{t('sup.table_actions')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredContracts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                <FileSignature size={16} />
                             </div>
                             <div>
                                <div className="text-slate-900 font-bold">{c.contractNumber}</div>
                                <div className="text-[11px] text-slate-500">{c.supplierName}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-slate-600 font-mono text-xs">{c.startDate}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg border text-xs font-bold font-mono ${getContractStatusColor(c.endDate)}`}>
                             {c.endDate}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="font-bold text-slate-800">{c.milkQuotaLiters.toLocaleString()} L</div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="font-black text-blue-700">{c.basePricePerLiter.toFixed(2)} RON</div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleEdit(c)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition"
                          >
                             <Edit2 size={18} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* 3. Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center">
                    <FileSignature className="mr-3 text-blue-400" />
                    {t('cnt.edit_contract')}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={20}/></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Beszállító</label>
                    <div className="font-bold text-slate-800 text-lg">{currentContract.supplierName}</div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('sup.form_contract_no')}</label>
                       <input 
                         type="text" 
                         value={currentContract.contractNumber}
                         onChange={e => setCurrentContract({...currentContract, contractNumber: e.target.value})}
                         className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('cnt.base_price')} (RON/L)</label>
                       <input 
                         type="number" 
                         step="0.01"
                         value={currentContract.basePricePerLiter}
                         onChange={e => setCurrentContract({...currentContract, basePricePerLiter: parseFloat(e.target.value)})}
                         className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('cnt.quota')} (L/hó)</label>
                    <input 
                      type="number" 
                      value={currentContract.milkQuotaLiters}
                      onChange={e => setCurrentContract({...currentContract, milkQuotaLiters: parseInt(e.target.value)})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('cnt.start_date')}</label>
                       <input 
                         type="date" 
                         value={currentContract.startDate}
                         onChange={e => setCurrentContract({...currentContract, startDate: e.target.value})}
                         className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('cnt.end_date')}</label>
                       <input 
                         type="date" 
                         value={currentContract.endDate}
                         onChange={e => setCurrentContract({...currentContract, endDate: e.target.value})}
                         className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4 border-t">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition"
                    >
                       {t('sup.cancel_btn')}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center"
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

export default ContractManagement;
