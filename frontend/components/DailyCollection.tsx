
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Droplet, 
  Thermometer, 
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Filter,
  FileText,
  Download,
  Building,
  User,
  LayoutList,
  Layers,
  Table as TableIcon,
  ChevronDown,
  Beaker,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Supplier, MonthlyCollectionSummary } from '../types';

interface CollectionEntry {
  id: string;
  timestamp: string; 
  supplierId: string;
  supplierName: string;
  vehiclePlate: string;
  quantityLiters: number;
  fatPercentage: number;
  proteinPercentage: number;
  temperature: number;
  ph: number;
  antibioticTest: 'NEGATIVE' | 'POSITIVE';
  sampleId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  inspector: string;
}

// Mock Beszállítók
const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Csarnok - Csíkszentdomokos', type: 'COLLECTION_POINT', cui: 'C1', address: 'Domokos', phone: '1', legalType: 'COMPANY', apiaCode: '', exploitationCode: '', hasSubsidy8: false, bankName: '', bankBranch: '', iban: '', status: 'ACTIVE' },
  { id: 'g1', name: 'Kovács István (Gazda)', type: 'FARMER', parentSupplierId: 's1', cui: 'G1', address: 'Domokos', phone: '1', legalType: 'INDIVIDUAL', apiaCode: '', exploitationCode: '', hasSubsidy8: false, bankName: '', bankBranch: '', iban: '', status: 'ACTIVE' },
  { id: 'g2', name: 'Péter Anna (Gazda)', type: 'FARMER', cui: 'G2', address: 'Madaras', phone: '1', legalType: 'INDIVIDUAL', apiaCode: '', exploitationCode: '', hasSubsidy8: false, bankName: '', bankBranch: '', iban: '', status: 'ACTIVE' },
  { id: 'sc1', name: 'Agro Lacto Coop', type: 'COOPERATIVE', cui: 'CUI-ALC', address: 'Gyergyó', phone: '1', legalType: 'COMPANY', apiaCode: '', exploitationCode: '', hasSubsidy8: false, bankName: '', bankBranch: '', iban: '', status: 'ACTIVE' },
];

const MOCK_VEHICLES = ['HR-10-BOM', 'HR-99-TEJ', 'HR-05-BOM'];

const INITIAL_COLLECTIONS: CollectionEntry[] = [
  { 
    id: 'col-1', 
    timestamp: '2023-10-26T06:30:00', 
    supplierId: 'sc1',
    supplierName: 'Agro Lacto Coop', 
    vehiclePlate: 'HR-10-BOM', 
    quantityLiters: 4500, 
    fatPercentage: 3.82, 
    proteinPercentage: 3.25, 
    temperature: 3.5, 
    ph: 6.65, 
    antibioticTest: 'NEGATIVE', 
    sampleId: 'SMP-8821',
    status: 'APPROVED', 
    inspector: 'Kovács János' 
  },
];

const DailyCollection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [collections, setCollections] = useState<CollectionEntry[]>(INITIAL_COLLECTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPointId, setSelectedPointId] = useState<string>('');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIntake, setNewIntake] = useState<Partial<CollectionEntry>>({
    supplierId: '',
    vehiclePlate: MOCK_VEHICLES[0],
    quantityLiters: 0,
    fatPercentage: 3.5,
    proteinPercentage: 3.2,
    temperature: 4.0,
    ph: 6.6,
    antibioticTest: 'NEGATIVE',
    sampleId: `SMP-${Math.floor(1000 + Math.random() * 9000)}`
  });

  // Havi összesítők state (Borderou)
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyCollectionSummary[]>([]);

  // --- DERIVED DATA ---
  const dailyEntries = useMemo(() => {
    return collections.filter(c => 
      c.timestamp.startsWith(filterDate) &&
      (c.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.sampleId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [collections, filterDate, searchTerm]);

  const collectionPoints = useMemo(() => MOCK_SUPPLIERS.filter(s => s.type === 'COLLECTION_POINT'), []);
  
  const farmersInPoint = useMemo(() => {
    if (!selectedPointId) return [];
    return MOCK_SUPPLIERS.filter(s => s.parentSupplierId === selectedPointId);
  }, [selectedPointId]);

  const dailyStats = useMemo(() => {
    const total = dailyEntries.reduce((acc, curr) => acc + curr.quantityLiters, 0);
    const avgFat = dailyEntries.length > 0 
      ? (dailyEntries.reduce((acc, curr) => acc + curr.fatPercentage, 0) / dailyEntries.length).toFixed(2)
      : '0.00';
    return { total, avgFat, count: dailyEntries.length };
  }, [dailyEntries]);

  // --- HANDLERS ---
  const handleSaveIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = MOCK_SUPPLIERS.find(s => s.id === newIntake.supplierId);
    
    if (!supplier || !newIntake.quantityLiters) {
      alert("Kérjük válasszon beszállítót és adjon meg mennyiséget!");
      return;
    }

    const entry: CollectionEntry = {
      ...newIntake as CollectionEntry,
      id: `col-${Date.now()}`,
      timestamp: `${filterDate}T${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}:00`,
      supplierName: supplier.name,
      status: 'APPROVED',
      inspector: 'Aktív Felhasználó'
    };

    setCollections([entry, ...collections]);
    setIsAddModalOpen(false);
    // Reset form
    setNewIntake({
      supplierId: '',
      vehiclePlate: MOCK_VEHICLES[0],
      quantityLiters: 0,
      fatPercentage: 3.5,
      proteinPercentage: 3.2,
      temperature: 4.0,
      ph: 6.6,
      antibioticTest: 'NEGATIVE',
      sampleId: `SMP-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const handleMonthlyValueChange = (farmerId: string, field: keyof MonthlyCollectionSummary, value: string) => {
    const val = parseFloat(value) || 0;
    setMonthlySummaries(prev => {
      const existingIdx = prev.findIndex(s => s.supplierId === farmerId && s.month === filterMonth);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], [field]: val };
        return updated;
      } else {
        const newItem: MonthlyCollectionSummary = {
          id: `ms-${Date.now()}-${farmerId}`,
          month: filterMonth,
          supplierId: farmerId,
          collectionPointId: selectedPointId,
          totalLiters: field === 'totalLiters' ? val : 0,
          avgFat: field === 'avgFat' ? val : 3.5,
          avgProtein: field === 'avgProtein' ? val : 3.2,
          status: 'DRAFT'
        };
        return [...prev, newItem];
      }
    });
  };

  const getMonthlyData = (farmerId: string) => {
    return monthlySummaries.find(s => s.supplierId === farmerId && s.month === filterMonth) || { totalLiters: 0, avgFat: 3.5, avgProtein: 3.2 };
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER & VIEW SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               <Droplet size={24} />
            </div>
            <div>
               <h2 className="text-lg font-bold text-slate-800">Tejátvétel & Naplózás</h2>
               <p className="text-sm text-slate-500">Napi közvetlen és havi gyűjtőponti elszámolás</p>
            </div>
         </div>
         
         <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('DAILY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutList size={16} /> Napi Részletes
            </button>
            <button 
              onClick={() => setViewMode('MONTHLY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'MONTHLY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <TableIcon size={16} /> Csarnok Havi (Borderou)
            </button>
         </div>
      </div>

      {/* DAILY VIEW CONTENT */}
      {viewMode === 'DAILY' && (
        <div className="space-y-6 animate-slide-left">
           
           {/* Stats Summary Bar */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">Mai össz. mennyiség</p>
                    <h3 className="text-xl font-black text-blue-600">{dailyStats.total.toLocaleString()} L</h3>
                 </div>
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Droplet size={20} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">Napi átlag zsír</p>
                    <h3 className="text-xl font-black text-slate-800">{dailyStats.avgFat}%</h3>
                 </div>
                 <div className="p-2 bg-amber-50 rounded-lg text-amber-500"><Beaker size={20} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">Átvételek száma</p>
                    <h3 className="text-xl font-black text-slate-800">{dailyStats.count} db</h3>
                 </div>
                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Layers size={20} /></div>
              </div>
           </div>

           {/* Filters & Actions */}
           <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex gap-3 flex-1 min-w-[300px]">
                <div className="relative">
                   <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)} 
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                   />
                </div>
                <div className="relative flex-1 max-w-xs">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Beszállító vagy Minta ID..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                   />
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-95"
              >
                 <Plus size={18} /> Új Átvétel Rögzítése
              </button>
           </div>

           {/* Results Table */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                         <th className="px-6 py-4">Idő / Minta</th>
                         <th className="px-6 py-4">Beszállító</th>
                         <th className="px-6 py-4 text-center">Labor Paraméterek</th>
                         <th className="px-6 py-4 text-right">Mennyiség (L)</th>
                         <th className="px-6 py-4 text-right">Műveletek</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {dailyEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 transition group">
                           <td className="px-6 py-4">
                              <div className="text-slate-800 font-bold">{entry.timestamp.split('T')[1].substring(0, 5)}</div>
                              <div className="text-[10px] font-mono text-blue-500 font-bold uppercase">{entry.sampleId}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 leading-none mb-1">{entry.supplierName}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                 <Truck size={10}/> {entry.vehiclePlate}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex justify-center gap-4 text-xs">
                                 <div className="text-center">
                                    <span className="text-[10px] text-slate-400 block uppercase">Zsír</span>
                                    <span className="font-bold text-slate-700">{entry.fatPercentage}%</span>
                                 </div>
                                 <div className="text-center">
                                    <span className="text-[10px] text-slate-400 block uppercase">pH</span>
                                    <span className="font-bold text-slate-700">{entry.ph}</span>
                                 </div>
                                 <div className="text-center">
                                    <span className="text-[10px] text-slate-400 block uppercase">Hőfok</span>
                                    <span className={`font-bold ${entry.temperature > 8 ? 'text-red-600' : 'text-slate-700'}`}>{entry.temperature}°C</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="text-lg font-black text-blue-600">{entry.quantityLiters.toLocaleString()}</div>
                              <div className="text-[10px] text-green-600 font-black uppercase flex items-center justify-end gap-1">
                                 <CheckCircle size={10}/> Elfogadva
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 text-slate-400 hover:text-blue-600 transition"><Edit2 size={16}/></button>
                                 <button className="p-2 text-slate-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                      {dailyEntries.length === 0 && (
                        <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                              Erre a napra még nincs rögzített átvétel.
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* ADD INTAKE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-slate-800 p-5 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-inner"><Plus size={20} /></div>
                    <div>
                       <h3 className="font-bold text-lg leading-none mb-1">Új Tejátvétel Rögzítése</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{filterDate} • {newIntake.sampleId}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={24}/></button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveIntake} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                 
                 {/* SECTION 1: Logistics */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center border-b border-blue-50 pb-2">
                       <Truck size={14} className="mr-2" /> Származás & Logisztika
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Beszállító *</label>
                          <select 
                            required
                            value={newIntake.supplierId}
                            onChange={(e) => setNewIntake({...newIntake, supplierId: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                             <option value="">Válasszon...</option>
                             {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Szállító Jármű</label>
                          <select 
                            value={newIntake.vehiclePlate}
                            onChange={(e) => setNewIntake({...newIntake, vehiclePlate: e.target.value})}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                             {MOCK_VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>

                 {/* SECTION 2: Quantity & Lab */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center border-b border-emerald-50 pb-2">
                       <Beaker size={14} className="mr-2" /> Mennyiség & Laborparaméterek
                    </h4>
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                       <label className="block text-center text-[10px] font-black text-slate-400 uppercase mb-2">Mért Mennyiség (Liter) *</label>
                       <div className="relative max-w-[240px] mx-auto">
                          <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
                          <input 
                            type="number" 
                            required
                            value={newIntake.quantityLiters || ''}
                            onChange={(e) => setNewIntake({...newIntake, quantityLiters: parseFloat(e.target.value)})}
                            placeholder="0"
                            className="w-full text-center py-4 bg-white border border-slate-200 rounded-2xl text-4xl font-black text-slate-800 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm transition-all"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Zsír (%)</label>
                          <input type="number" step="0.01" value={newIntake.fatPercentage} onChange={e => setNewIntake({...newIntake, fatPercentage: parseFloat(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Fehérje (%)</label>
                          <input type="number" step="0.01" value={newIntake.proteinPercentage} onChange={e => setNewIntake({...newIntake, proteinPercentage: parseFloat(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Hőfok (°C)</label>
                          <input type="number" step="0.1" value={newIntake.temperature} onChange={e => setNewIntake({...newIntake, temperature: parseFloat(e.target.value)})} className={`w-full border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-blue-500 outline-none ${newIntake.temperature! > 8 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-800'}`} />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">pH Érték</label>
                          <input type="number" step="0.01" value={newIntake.ph} onChange={e => setNewIntake({...newIntake, ph: parseFloat(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                    </div>
                 </div>

                 {/* SECTION 3: Safety (HACCP) */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center border-b border-red-50 pb-2">
                       <CheckCircle size={14} className="mr-2" /> Élelmiszerbiztonsági Validáció
                    </h4>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                       <div className="flex-1 bg-slate-900 rounded-2xl p-4 flex items-center justify-between border border-slate-700">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${newIntake.antibioticTest === 'NEGATIVE' ? 'bg-green-500' : 'bg-red-500'} text-white transition-colors`}>
                                <Beaker size={20} />
                             </div>
                             <div>
                                <span className="text-xs text-slate-400 font-bold block">Antibiotikum Teszt</span>
                                <span className="text-sm text-white font-black">{newIntake.antibioticTest === 'NEGATIVE' ? 'NEGATÍV (ÁTVEHETŐ)' : 'POZITÍV (SELEJT!)'}</span>
                             </div>
                          </div>
                          <div 
                             onClick={() => setNewIntake({...newIntake, antibioticTest: newIntake.antibioticTest === 'NEGATIVE' ? 'POSITIVE' : 'NEGATIVE'})}
                             className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${newIntake.antibioticTest === 'NEGATIVE' ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                             <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${newIntake.antibioticTest === 'POSITIVE' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </div>
                       </div>
                    </div>

                    {newIntake.temperature! > 8 && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 animate-pulse">
                         <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                         <div>
                            <h5 className="text-sm font-black text-amber-800 uppercase">Figyelem: Kritikus Hőmérséklet!</h5>
                            <p className="text-xs text-amber-700 mt-1">A beérkező tej hőmérséklete meghaladja a HACCP határértéket (8°C). Az átvétel után azonnali hűtés és jegyzőkönyvezés szükséges!</p>
                         </div>
                      </div>
                    )}
                 </div>
              </form>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-5 border-t border-slate-100 flex gap-4 shrink-0">
                 <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl transition hover:bg-slate-100">Mégse</button>
                 <button 
                  onClick={handleSaveIntake}
                  disabled={newIntake.antibioticTest === 'POSITIVE'}
                  className={`flex-1 py-3 font-black text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2
                    ${newIntake.antibioticTest === 'POSITIVE' ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95'}
                  `}
                 >
                    <Save size={20} /> Átvétel Rögzítése
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MONTHLY VIEW CONTENT (The "Csarnok" Logic) */}
      {viewMode === 'MONTHLY' && (
        <div className="space-y-6 animate-slide-left">
           <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                 <h3 className="text-xl font-bold flex items-center gap-2">
                    <Building size={24} /> Csarnok Elszámolás (Borderou)
                 </h3>
                 <p className="text-blue-100 text-sm mt-1">Havi összesített tejmennyiségek rögzítése gyűjtőpontonként.</p>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-48">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
                    <input 
                      type="month" 
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-blue-700/50 border border-blue-400 rounded-xl text-sm font-bold focus:ring-2 focus:ring-white outline-none"
                    />
                 </div>
                 <select 
                   value={selectedPointId}
                   onChange={(e) => setSelectedPointId(e.target.value)}
                   className="flex-1 md:w-64 px-4 py-2.5 bg-blue-700 border border-blue-400 rounded-xl text-sm font-bold focus:ring-2 focus:ring-white outline-none"
                 >
                    <option value="">Válasszon csarnokot...</option>
                    {collectionPoints.map(cp => (
                       <option key={cp.id} value={cp.id}>{cp.name}</option>
                    ))}
                 </select>
              </div>
           </div>

           {selectedPointId ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                 <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                       <h4 className="font-bold text-slate-800">Tagok Listája - {collectionPoints.find(p => p.id === selectedPointId)?.name}</h4>
                       <p className="text-xs text-slate-400 uppercase font-black tracking-wider mt-1">{filterMonth} időszak</p>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2">
                       <CheckCircle size={18} /> Összesítő Véglegesítése
                    </button>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead>
                          <tr className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b">
                             <th className="px-6 py-4">Gazda Neve</th>
                             <th className="px-6 py-4">Azonosító (CUI)</th>
                             <th className="px-6 py-4 text-center">Havi Mennyiség (L)</th>
                             <th className="px-6 py-4 text-center">Átlag Zsír %</th>
                             <th className="px-6 py-4 text-center">Átlag Fehérje %</th>
                             <th className="px-6 py-4 text-right">Művelet</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {farmersInPoint.map(farmer => {
                             const data = getMonthlyData(farmer.id);
                             return (
                               <tr key={farmer.id} className="hover:bg-blue-50/30 transition group">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                           <User size={16} />
                                        </div>
                                        <span className="font-bold text-slate-700">{farmer.name}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{farmer.cui}</td>
                                  <td className="px-6 py-4">
                                     <input 
                                       type="number"
                                       value={data.totalLiters || ''}
                                       onChange={(e) => handleMonthlyValueChange(farmer.id, 'totalLiters', e.target.value)}
                                       className="w-24 mx-auto block text-center px-2 py-1.5 border border-slate-200 rounded-lg font-black text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                       placeholder="0"
                                     />
                                  </td>
                                  <td className="px-6 py-4">
                                     <input 
                                       type="number"
                                       step="0.1"
                                       value={data.avgFat}
                                       onChange={(e) => handleMonthlyValueChange(farmer.id, 'avgFat', e.target.value)}
                                       className="w-20 mx-auto block text-center px-2 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                     />
                                  </td>
                                  <td className="px-6 py-4">
                                     <input 
                                       type="number"
                                       step="0.1"
                                       value={data.avgProtein}
                                       onChange={(e) => handleMonthlyValueChange(farmer.id, 'avgProtein', e.target.value)}
                                       className="w-20 mx-auto block text-center px-2 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                     />
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                        <FileText size={18} />
                                     </button>
                                  </td>
                               </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
                 
                 <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex gap-8">
                       <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase">Csarnok összesen</p>
                          <p className="text-xl font-black text-slate-800">
                             {farmersInPoint.reduce((acc, f) => acc + (getMonthlyData(f.id).totalLiters || 0), 0).toLocaleString()} L
                          </p>
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase">Beszállító gazdák</p>
                          <p className="text-xl font-black text-slate-800">{farmersInPoint.length} fő</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">Ideiglenes Mentés</button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
                 <Building size={64} className="mx-auto text-slate-200 mb-4" />
                 <h4 className="text-lg font-bold text-slate-500">Válasszon egy csarnokot a havi adatok rögzítéséhez</h4>
                 <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2">A kiválasztás után kilistázzuk az adott gyűjtőponthoz tartozó gazdákat a havi borderou rögzítéséhez.</p>
              </div>
           )}
        </div>
      )}

    </div>
  );
};

export default DailyCollection;
