import React, { useState } from 'react';
import { 
  RefreshCw, 
  Database, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Settings2, 
  History, 
  ArrowRight,
  FileJson,
  FileSpreadsheet,
  Link,
  ShieldCheck,
  BrainCircuit,
  Search,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// --- Mock Mapping Data ---
const INITIAL_MAPPING = [
  { erpField: 'partner_name', sagaField: 'Denumire', type: 'String', status: 'MATCHED' },
  { erpField: 'partner_cui', sagaField: 'Cod_Fiscal', type: 'String', status: 'MATCHED' },
  { erpField: 'invoice_number', sagaField: 'Numar', type: 'String', status: 'MATCHED' },
  { erpField: 'invoice_date', sagaField: 'Data', type: 'Date', status: 'MATCHED' },
  { erpField: 'total_net', sagaField: 'Valoare', type: 'Number', status: 'MATCHED' },
  { erpField: 'product_id', sagaField: 'Cod_Articol', type: 'String', status: 'MISMATCH' }, // Example of mapping issue
];

const SYNC_LOGS = [
  { id: 1, type: 'EXPORT', entity: 'Számlák', date: '2023-10-27 10:15', status: 'SUCCESS', count: 42 },
  { id: 2, type: 'IMPORT', entity: 'Partnerek', date: '2023-10-27 08:30', status: 'SUCCESS', count: 5 },
  { id: 3, type: 'EXPORT', entity: 'Készletek', date: '2023-10-26 18:00', status: 'ERROR', count: 0, error: 'SAGA API Timeout' },
];

const SagaIntegration: React.FC = () => {
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'SYNC' | 'MAPPING' | 'LOGS'>('SYNC');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Szinkronizáció befejezve. 12 új számla exportálva.");
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <Database size={28} className="mr-2 text-blue-600" />
            {t('menu.fin_saga')}
          </h2>
          <p className="text-slate-500 font-medium">Bomilact ERP ↔ SAGA Software Konnektor</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('SYNC')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'SYNC' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
           >
             Műveletek
           </button>
           <button 
             onClick={() => setActiveTab('MAPPING')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'MAPPING' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
           >
             Mapping
           </button>
           <button 
             onClick={() => setActiveTab('LOGS')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'LOGS' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
           >
             Napló
           </button>
        </div>
      </div>

      {activeTab === 'SYNC' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Connection Stats */}
           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t('saga.last_sync')}</p>
                       <h3 className="text-xl font-black text-slate-800">2023-10-27 10:15</h3>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                       <ShieldCheck size={20} />
                    </div>
                 </div>
                 <div className="mt-6 flex items-center text-sm font-bold text-green-600">
                    <CheckCircle size={16} className="mr-1.5" /> Kapcsolat aktív
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t('saga.pending_exports')}</p>
                       <h3 className="text-3xl font-black text-blue-600">12 bizonylat</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <FileJson size={20} />
                    </div>
                 </div>
                 <button 
                   onClick={handleSync}
                   disabled={isSyncing}
                   className={`mt-4 w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center transition shadow-lg shadow-blue-600/20 ${isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                 >
                    <RefreshCw size={18} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Szinkronizálás...' : t('saga.sync_now')}
                 </button>
              </div>

              {/* Action Cards */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <Upload size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800">{t('saga.import_partners')}</h4>
                          <p className="text-xs text-slate-500 font-medium">Partnerek és árlisták frissítése SAGA-ból</p>
                       </div>
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Download size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800">{t('saga.export_invoices')}</h4>
                          <p className="text-xs text-slate-500 font-medium">Napi értékesítési adatok küldése</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* AI Helper Sidebar */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
              <div>
                 <div className="flex items-center text-blue-400 font-black text-xs uppercase mb-4">
                    <BrainCircuit size={16} className="mr-2" /> Bomilact Core V2 AI
                 </div>
                 <h4 className="text-lg font-bold mb-2 leading-tight">Integrációs Figyelő</h4>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    Észleltem 3 partnert a SAGA importban, akiknél az Adószám nem egyezik az ERP adatbázissal. 
                    Javaslom a manuális felülvizsgálatot a Mapping menüben.
                 </p>
              </div>
              <div className="mt-8 space-y-3">
                 <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-xs font-bold text-slate-300">Szinkron Hibaarány</span>
                    <span className="text-xs font-black text-green-400">0.8%</span>
                 </div>
                 <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-500 transition">
                    Javaslatok Alkalmazása
                 </button>
              </div>
           </div>

        </div>
      )}

      {activeTab === 'MAPPING' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-slide-left">
           <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                 <Settings2 size={20} className="mr-2 text-blue-500" />
                 {t('saga.mapping_config')}
              </h3>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Keresés mezők között..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none w-48"
                 />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                       <th className="px-6 py-3">ERP Mező (Forrás)</th>
                       <th className="px-6 py-3">Összeköttetés</th>
                       <th className="px-6 py-3">SAGA Header (Cél)</th>
                       <th className="px-6 py-3">Típus</th>
                       <th className="px-6 py-3">Állapot</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {INITIAL_MAPPING.map((map, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                         <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-slate-700">{map.erpField}</span>
                         </td>
                         <td className="px-6 py-4">
                            <Link size={14} className="text-blue-400 mx-auto" />
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center">
                               <input 
                                 type="text" 
                                 defaultValue={map.sagaField} 
                                 className="px-2 py-1 border border-slate-200 rounded text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none w-32" 
                               />
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs font-bold text-slate-500">{map.type}</span>
                         </td>
                         <td className="px-6 py-4">
                            {map.status === 'MATCHED' ? (
                               <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Aktív</span>
                            ) : (
                               <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center w-fit">
                                  <AlertCircle size={10} className="mr-1"/> Eltérés
                               </span>
                            )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition">Leképezés Mentése</button>
           </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-slide-left">
           <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center">
                 <History size={20} className="mr-2 text-slate-400" />
                 Integrációs Napló (Audit)
              </h3>
              <button className="text-xs font-black text-blue-600 flex items-center hover:underline">
                 <Download size={14} className="mr-1" /> Log letöltése (.txt)
              </button>
           </div>
           <div className="divide-y divide-slate-50">
              {SYNC_LOGS.map(log => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-slate-50/50 transition">
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                         {log.type === 'EXPORT' ? <Download size={18} /> : <Upload size={18} />}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{log.type}: {log.entity}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {log.status}
                            </span>
                         </div>
                         <div className="text-xs text-slate-400 font-medium">{log.date} • {log.error || `${log.count} rekord érintett`}</div>
                      </div>
                   </div>
                   <button className="p-2 text-slate-400 hover:text-slate-600 rounded">
                      <ArrowRight size={18} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

    </div>
  );
};

export default SagaIntegration;