
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Calendar, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  FileText, 
  Download,
  Filter,
  X,
  Save,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  fetchProductionLogs,
  createProductionLog,
  type ProductionLogDto,
  type ProductionLogInput,
} from '../services/productionLogs';

// --- Types ---

type HaccpStatus = 'OK' | 'WARNING' | 'CRITICAL';

interface HaccpLogEntry {
  id: number;
  timestamp: string;
  batchId: string;
  productName: string;
  step: string;
  temperature: number;
  ph: number;
  operator: string;
  status: HaccpStatus;
  notes?: string;
}

const CCP_STEPS = [
  'CCP1 - Pasztőrözés',
  'CCP2 - Hűtés',
  'CCP3 - Fémdetektálás',
  'Fermentálás',
  'Alvasztás',
  'Préselés',
  'Sózás',
  'Csomagolás'
];

const dtoToEntry = (dto: ProductionLogDto): HaccpLogEntry => ({
  id: dto.id,
  timestamp: dto.timestamp,
  batchId: dto.batchNumber,
  productName: dto.productName,
  step: dto.step,
  temperature: dto.temperature ?? 0,
  ph: dto.ph ?? 0,
  operator: dto.operator,
  status: dto.status as HaccpStatus,
  notes: dto.notes ?? undefined,
});

const HaccpLogs: React.FC = () => {
  const [logs, setLogs] = useState<HaccpLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<HaccpLogEntry>>({
    timestamp: new Date().toISOString().slice(0, 16),
    temperature: 0,
    ph: 0,
    status: 'OK',
    step: CCP_STEPS[0]
  });

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchProductionLogs({ dateFrom: dateFilter, dateTo: dateFilter });
      setLogs(data.map(dtoToEntry));
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // --- Calculations ---

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.batchId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.operator.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const critical = filteredLogs.filter(l => l.status === 'CRITICAL').length;
    const warning = filteredLogs.filter(l => l.status === 'WARNING').length;
    
    const chartData = [...filteredLogs]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(l => ({
        time: new Date(l.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        temp: l.temperature,
        ph: l.ph,
        status: l.status
      }));

    return { total, critical, warning, chartData };
  }, [filteredLogs]);

  // --- Handlers ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.batchId || !newEntry.productName) return;

    const payload: ProductionLogInput = {
      batchNumber: newEntry.batchId!,
      productName: newEntry.productName!,
      step: newEntry.step || 'Egyéb',
      temperature: newEntry.temperature ?? 0,
      ph: newEntry.ph ?? 0,
      operator: newEntry.operator || 'Aktív Felhasználó',
      notes: newEntry.notes,
      timestamp: newEntry.timestamp || new Date().toISOString(),
    };

    try {
      await createProductionLog(payload);
      await loadLogs();
    } catch {
      alert('Mentés sikertelen.');
    }
    setIsModalOpen(false);
    setNewEntry({
      timestamp: new Date().toISOString().slice(0, 16),
      temperature: 0,
      ph: 0,
      status: 'OK',
      step: CCP_STEPS[0]
    });
  };

  const getStatusBadge = (status: HaccpStatus) => {
    switch (status) {
      case 'OK': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={12} className="mr-1"/> MEGFELELŐ</span>;
      case 'WARNING': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle size={12} className="mr-1"/> FIGYELMEZTETÉS</span>;
      case 'CRITICAL': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse"><XCircle size={12} className="mr-1"/> KRITIKUS</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Napi Mérések</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total} db</h3>
           </div>
           <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
             <ClipboardCheck size={24} />
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Kritikus (CCP)</p>
             <h3 className={`text-2xl font-black mt-1 ${stats.critical > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.critical} db</h3>
             <p className="text-xs text-slate-400">Azonnali beavatkozás</p>
           </div>
           <div className="bg-red-50 text-red-600 p-2 rounded-lg">
             <AlertTriangle size={24} />
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Megfelelőség</p>
             <h3 className="text-2xl font-black text-green-600 mt-1">
                {stats.total > 0 ? Math.round(((stats.total - stats.critical) / stats.total) * 100) : 100}%
             </h3>
             <p className="text-xs text-slate-400">HACCP Compliance</p>
           </div>
           <div className="bg-green-50 text-green-600 p-2 rounded-lg">
             <Activity size={24} />
           </div>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 transition cursor-pointer p-4 rounded-xl shadow-lg shadow-blue-600/20 text-white flex flex-col justify-center items-center"
        >
           <Plus size={32} className="mb-1" />
           <span className="font-bold text-sm">Új Mérés Rögzítése</span>
        </div>
      </div>

      {/* Chart & Toolbar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center">
                 <Thermometer className="mr-2 text-slate-400" size={18} />
                 Hőmérséklet Trend (Napi)
              </h3>
              <div className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded">
                 {dateFilter}
              </div>
           </div>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      labelStyle={{fontWeight: 'bold', color: '#475569'}}
                    />
                    <ReferenceLine y={72} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Min 72°C', fill: '#ef4444', fontSize: 10 }} />
                    <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Right: Filters & Export */}
        <div className="space-y-4">
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                 <Filter size={18} className="mr-2 text-slate-400" /> Szűrés & Export
              </h3>
              
              <div className="space-y-3">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dátum</label>
                    <div className="relative">
                       <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="date" 
                         value={dateFilter}
                         onChange={(e) => setDateFilter(e.target.value)}
                         className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keresés (Batch/Termék)</label>
                    <div className="relative">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Pl. L23-..."
                         className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                 </div>

                 <button className="w-full mt-4 flex items-center justify-center bg-slate-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-700 transition">
                    <Download size={16} className="mr-2" />
                    Napló Exportálása (PDF)
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                     <th className="px-6 py-4">Időpont</th>
                     <th className="px-6 py-4">Termék / Batch</th>
                     <th className="px-6 py-4">Technológiai Lépés</th>
                     <th className="px-6 py-4">Mért Értékek</th>
                     <th className="px-6 py-4">Státusz</th>
                     <th className="px-6 py-4">Operátor</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Betöltés...</td></tr>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                         <td className="px-6 py-4">
                            <div className="flex items-center font-medium text-slate-700">
                               <Clock size={14} className="mr-2 text-slate-400" />
                               {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{log.productName}</div>
                            <div className="text-xs text-slate-500 font-mono">{log.batchId}</div>
                         </td>
                         <td className="px-6 py-4 text-slate-600 font-medium">
                            {log.step}
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex space-x-3">
                               <span className={`font-mono font-bold ${log.temperature > 72 || log.temperature < 4 ? 'text-slate-800' : 'text-slate-600'}`}>
                                 {log.temperature.toFixed(1)}°C
                               </span>
                               <span className="text-slate-300">|</span>
                               <span className="font-mono text-slate-600">pH {log.ph.toFixed(2)}</span>
                            </div>
                            {log.notes && (
                               <div className="text-xs text-slate-400 mt-1 italic max-w-[200px] truncate">
                                  "{log.notes}"
                               </div>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            {getStatusBadge(log.status)}
                         </td>
                         <td className="px-6 py-4 text-slate-600 text-xs">
                            {log.operator}
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          Nincs megjeleníthető bejegyzés ezen a napon.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
               <div className="bg-slate-800 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                  <h3 className="font-bold flex items-center">
                     <FileText className="mr-2 text-blue-400" />
                     Új HACCP Bejegyzés
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
               </div>

               <form onSubmit={handleSave} className="p-6 space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dátum / Idő</label>
                        <input 
                           type="datetime-local" 
                           required
                           value={newEntry.timestamp}
                           onChange={(e) => setNewEntry({...newEntry, timestamp: e.target.value})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">LOT Szám</label>
                        <input 
                           type="text" 
                           required
                           placeholder="L23-..."
                           value={newEntry.batchId}
                           onChange={(e) => setNewEntry({...newEntry, batchId: e.target.value})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Termék</label>
                     <input 
                        type="text" 
                        required
                        placeholder="Pl. Cașcaval Rucăr"
                        value={newEntry.productName}
                        onChange={(e) => setNewEntry({...newEntry, productName: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Technológiai Lépés (CCP)</label>
                     <select 
                        value={newEntry.step}
                        onChange={(e) => setNewEntry({...newEntry, step: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                        {CCP_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hőmérséklet (°C)</label>
                        <input 
                           type="number" 
                           step="0.1"
                           required
                           value={newEntry.temperature}
                           onChange={(e) => setNewEntry({...newEntry, temperature: parseFloat(e.target.value)})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">pH Érték</label>
                        <input 
                           type="number" 
                           step="0.01"
                           value={newEntry.ph}
                           onChange={(e) => setNewEntry({...newEntry, ph: parseFloat(e.target.value)})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Megjegyzés</label>
                     <textarea 
                        rows={2}
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Pl. Hőmérséklet rendben..."
                     ></textarea>
                  </div>

                  <div className="pt-2 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition">Mégse</button>
                     <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/30 transition flex justify-center items-center">
                        <Save size={18} className="mr-2" /> Mentés
                     </button>
                  </div>

               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default HaccpLogs;
