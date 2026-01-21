
import React, { useState, useMemo } from 'react';
import { 
  Microscope, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  TestTube, 
  Save, 
  X,
  Edit2,
  Trash2,
  Droplet,
  Beaker,
  Waves,
  Scale
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// --- Types ---

type SampleType = 'RAW_MILK' | 'WIP' | 'FINISHED_GOOD';
type TestStatus = 'PENDING' | 'COMPLETED';
type TestResult = 'PASS' | 'FAIL' | 'WARNING';

interface LabTest {
  id: string;
  sampleId: string; // e.g., "SMP-2023-001"
  date: string; // ISO DateTime
  sourceName: string; // Supplier Name or Batch ID
  type: SampleType;
  
  // Parameters
  fat?: number;
  protein?: number;
  ph?: number;
  density?: number; // Densitate (g/cm3)
  water?: number;   // Apa adaugata (%)
  antibiotic?: 'NEGATIVE' | 'POSITIVE';
  scc?: number; // Somatic Cell Count (thousands)
  cfu?: number; // Colony Forming Units (thousands)
  
  status: TestStatus;
  result: TestResult;
  inspector: string;
  notes?: string;
}

// --- Mock Data ---

const INITIAL_TESTS: LabTest[] = [
  {
    id: 't-1',
    sampleId: 'SMP-1027-01',
    date: '2023-10-27T08:10:00',
    sourceName: 'Agro Lacto Coop',
    type: 'RAW_MILK',
    fat: 3.85,
    protein: 3.30,
    ph: 6.65,
    density: 1.029,
    water: 0,
    antibiotic: 'NEGATIVE',
    scc: 250,
    cfu: 80,
    status: 'COMPLETED',
    result: 'PASS',
    inspector: 'Kovács Anna'
  },
  {
    id: 't-2',
    sampleId: 'SMP-1027-02',
    date: '2023-10-27T09:30:00',
    sourceName: 'L23-1027-01 (Cașcaval Rucăr)',
    type: 'WIP',
    fat: 45.20, 
    ph: 5.40,
    status: 'COMPLETED',
    result: 'PASS',
    inspector: 'Kovács Anna'
  },
  {
    id: 't-3',
    sampleId: 'SMP-1027-03',
    date: '2023-10-27T10:15:00',
    sourceName: 'Ismeretlen Beszállító',
    type: 'RAW_MILK',
    density: 1.022, // Too low
    water: 12.5,    // Fraud detected
    antibiotic: 'POSITIVE',
    status: 'COMPLETED',
    result: 'FAIL',
    inspector: 'Nagy Éva',
    notes: 'Azonnali elutasítás - Víz hozzáadása és Antibiotikum gyanú'
  }
];

const LabTests: React.FC = () => {
  const { t } = useLanguage();
  const [tests, setTests] = useState<LabTest[]>(INITIAL_TESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SampleType | 'ALL'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<Partial<LabTest>>({});
  const [isEditing, setIsEditing] = useState(false);

  // --- Calculations ---

  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      const matchesSearch = t.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.sourceName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || t.type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tests, searchTerm, filterType]);

  const stats = useMemo(() => {
    const total = tests.length;
    const pending = tests.filter(t => t.status === 'PENDING').length;
    const failed = tests.filter(t => t.result === 'FAIL').length;
    
    const rawMilkTests = tests.filter(t => t.type === 'RAW_MILK' && t.fat);
    const avgFat = rawMilkTests.length ? (rawMilkTests.reduce((acc, t) => acc + (t.fat || 0), 0) / rawMilkTests.length).toFixed(2) : '-';

    return { total, pending, failed, avgFat };
  }, [tests]);

  // --- Handlers ---

  const handleAddNew = () => {
    setCurrentTest({
      sampleId: `SMP-${new Date().getFullYear()}-${Math.floor(Math.random()*10000)}`,
      date: new Date().toISOString().slice(0, 16),
      type: 'RAW_MILK',
      status: 'PENDING',
      result: 'PASS',
      fat: 3.50,
      protein: 3.20,
      density: 1.029,
      water: 0,
      inspector: 'Aktív Laboráns'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (test: LabTest) => {
    setCurrentTest({ ...test });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a vizsgálatot?')) {
      setTests(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTest.sampleId || !currentTest.sourceName) return;

    // Auto Result Logic
    let autoResult: TestResult = 'PASS';
    if (currentTest.antibiotic === 'POSITIVE') autoResult = 'FAIL';
    else if ((currentTest.water || 0) > 0) autoResult = 'FAIL'; // Added water is always a fail
    else if (((currentTest.density || 0) < 1.028 || (currentTest.density || 0) > 1.034) && currentTest.type === 'RAW_MILK') autoResult = 'WARNING';
    else if ((currentTest.ph || 7) < 6.0 && currentTest.type === 'RAW_MILK') autoResult = 'FAIL'; 

    const testToSave = {
      ...currentTest,
      result: autoResult,
      id: currentTest.id || `t-${Date.now()}`
    } as LabTest;

    if (isEditing) {
      setTests(prev => prev.map(t => t.id === testToSave.id ? testToSave : t));
    } else {
      setTests([testToSave, ...tests]);
    }
    setIsModalOpen(false);
  };

  const getResultBadge = (result: TestResult) => {
    switch (result) {
      case 'PASS': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} className="mr-1"/> MEGFELELŐ</span>;
      case 'WARNING': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700"><AlertTriangle size={12} className="mr-1"/> FIGYELEM</span>;
      case 'FAIL': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 animate-pulse"><XCircle size={12} className="mr-1"/> SELEJT</span>;
    }
  };

  const getTypeLabel = (type: SampleType) => {
    switch (type) {
      case 'RAW_MILK': return 'Nyers Tej';
      case 'WIP': return 'Gyártásközi';
      case 'FINISHED_GOOD': return 'Késztermék';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Összes Minta</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total} db</h3>
           </div>
           <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><TestTube size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Folyamatban</p>
             <h3 className="text-2xl font-black text-amber-500 mt-1">{stats.pending} db</h3>
           </div>
           <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><Clock size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Nem Megfelelő</p>
             <h3 className="text-2xl font-black text-red-600 mt-1">{stats.failed} db</h3>
           </div>
           <div className="bg-red-50 text-red-600 p-2 rounded-lg"><XCircle size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Átlag Zsír (Nyers)</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.avgFat}%</h3>
           </div>
           <div className="bg-green-50 text-green-600 p-2 rounded-lg"><Droplet size={24} /></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>Összes</button>
            <button onClick={() => setFilterType('RAW_MILK')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'RAW_MILK' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}>Nyers Tej</button>
            <button onClick={() => setFilterType('WIP')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'WIP' ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-50 text-slate-600'}`}>Gyártásközi</button>
            <button onClick={() => setFilterType('FINISHED_GOOD')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'FINISHED_GOOD' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}>Késztermék</button>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Minta ID, Forrás..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition flex-shrink-0"
            >
              <Plus size={18} className="mr-1" />
              <span className="hidden sm:inline">Új Vizsgálat</span>
              <span className="sm:hidden">Új</span>
            </button>
         </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                     <th className="px-6 py-4">Minta / Dátum</th>
                     <th className="px-6 py-4">Forrás / Típus</th>
                     <th className="px-6 py-4">Minőségi Paraméterek</th>
                     <th className="px-6 py-4">Fizikai Paraméterek</th>
                     <th className="px-6 py-4">Antibiotikum / Bizt.</th>
                     <th className="px-6 py-4">Eredmény</th>
                     <th className="px-6 py-4 text-right">Műveletek</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredTests.length > 0 ? (
                    filteredTests.map(test => (
                      <tr key={test.id} className="hover:bg-slate-50 transition">
                         <td className="px-6 py-4">
                            <div className="font-mono font-bold text-slate-700">{test.sampleId}</div>
                            <div className="text-xs text-slate-500 flex items-center mt-1">
                               <Clock size={12} className="mr-1" />
                               {new Date(test.date).toLocaleString()}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{test.sourceName}</div>
                            <div className="text-xs text-slate-500 mt-1">{getTypeLabel(test.type)}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2 text-xs">
                               {test.fat !== undefined && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-bold">{t('lab.fat')}: {test.fat.toFixed(2)}</span>}
                               {test.protein !== undefined && <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-bold">{t('lab.protein')}: {test.protein.toFixed(2)}</span>}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-2 text-xs">
                               {test.density !== undefined && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium">{t('lab.density')}: {test.density.toFixed(3)}</span>}
                               {test.water !== undefined && <span className={`px-1.5 py-0.5 rounded border font-bold ${test.water > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{t('lab.water')}: {test.water}%</span>}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            {test.antibiotic && (
                               <div className={`text-xs font-bold mb-1 ${test.antibiotic === 'POSITIVE' ? 'text-red-600' : 'text-green-600'}`}>
                                  AB: {test.antibiotic === 'POSITIVE' ? 'POZITÍV' : 'NEGATÍV'}
                               </div>
                            )}
                            {test.scc !== undefined && (
                               <div className="text-xs text-slate-500">
                                  SCC: {test.scc}k
                               </div>
                            )}
                         </td>
                         <td className="px-6 py-4">
                            {getResultBadge(test.result)}
                            {test.status === 'PENDING' && <div className="text-[10px] text-amber-600 font-bold mt-1">FOLYAMATBAN</div>}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                               <button onClick={() => handleEdit(test)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 size={16}/></button>
                               <button onClick={() => handleDelete(test.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          Nincs megjeleníthető vizsgálat a kiválasztott szűrőkkel.
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
                     <Microscope className="mr-2 text-blue-400" />
                     {isEditing ? 'Vizsgálat Szerkesztése' : 'Új Laborvizsgálat'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
               </div>

               <form onSubmit={handleSave} className="p-6 space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('lab.sample_id')}</label>
                        <input 
                           type="text" 
                           value={currentTest.sampleId}
                           readOnly
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-mono text-sm focus:outline-none text-slate-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dátum</label>
                        <input 
                           type="datetime-local" 
                           required
                           value={currentTest.date}
                           onChange={(e) => setCurrentTest({...currentTest, date: e.target.value})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Típus</label>
                     <select 
                        value={currentTest.type}
                        onChange={(e) => setCurrentTest({...currentTest, type: e.target.value as SampleType})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                        <option value="RAW_MILK">Nyers Tej (Beérkező)</option>
                        <option value="WIP">Gyártásközi (WIP)</option>
                        <option value="FINISHED_GOOD">Késztermék</option>
                     </select>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">{t('lab.source')} (Beszállító / Batch)</label>
                     <input 
                        type="text" 
                        required
                        placeholder="Pl. Agro Lacto Coop vagy L23-..."
                        value={currentTest.sourceName}
                        onChange={(e) => setCurrentTest({...currentTest, sourceName: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                        <Beaker size={14} className="mr-1" /> {t('sup.form_agri_ids')} & {t('lab.result')}
                     </h4>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.fat')} (%)</label>
                           <input type="number" step="0.01" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-blue-700" 
                              value={currentTest.fat || ''} onChange={(e) => setCurrentTest({...currentTest, fat: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.protein')} (%)</label>
                           <input type="number" step="0.01" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-indigo-700" 
                              value={currentTest.protein || ''} onChange={(e) => setCurrentTest({...currentTest, protein: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.density')} (g/cm³)</label>
                           <input type="number" step="0.001" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-mono" 
                              value={currentTest.density || ''} onChange={(e) => setCurrentTest({...currentTest, density: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.water')} (%)</label>
                           <input type="number" step="0.1" className={`w-full border rounded px-2 py-1.5 text-sm font-bold ${(currentTest.water || 0) > 0 ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-300'}`} 
                              value={currentTest.water || ''} onChange={(e) => setCurrentTest({...currentTest, water: parseFloat(e.target.value)})} />
                        </div>
                     </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                        <AlertTriangle size={14} className="mr-1" /> Mikrobiológia & Ph
                     </h4>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-sm text-slate-700">Antibiotikum Teszt</span>
                           <div className="flex space-x-2">
                              <button type="button" onClick={() => setCurrentTest({...currentTest, antibiotic: 'NEGATIVE'})} 
                                 className={`px-3 py-1 rounded text-xs font-bold border ${currentTest.antibiotic === 'NEGATIVE' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-slate-300'}`}>NEGATÍV</button>
                              <button type="button" onClick={() => setCurrentTest({...currentTest, antibiotic: 'POSITIVE'})} 
                                 className={`px-3 py-1 rounded text-xs font-bold border ${currentTest.antibiotic === 'POSITIVE' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500 border-slate-300'}`}>POZITÍV</button>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">pH</label>
                              <input type="number" step="0.01" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" 
                                 value={currentTest.ph || ''} onChange={(e) => setCurrentTest({...currentTest, ph: parseFloat(e.target.value)})} />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">SCC (ezer/ml)</label>
                              <input type="number" placeholder="SCC" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" 
                                 value={currentTest.scc || ''} onChange={(e) => setCurrentTest({...currentTest, scc: parseFloat(e.target.value)})} />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">CFU (ezer/ml)</label>
                              <input type="number" placeholder="CFU" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" 
                                 value={currentTest.cfu || ''} onChange={(e) => setCurrentTest({...currentTest, cfu: parseFloat(e.target.value)})} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Státusz</label>
                        <select 
                           value={currentTest.status}
                           onChange={(e) => setCurrentTest({...currentTest, status: e.target.value as TestStatus})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                           <option value="PENDING">Folyamatban</option>
                           <option value="COMPLETED">Kész</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('lab.result')}</label>
                        <select 
                           value={currentTest.result}
                           onChange={(e) => setCurrentTest({...currentTest, result: e.target.value as TestResult})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                           <option value="PASS">Megfelelő</option>
                           <option value="WARNING">Figyelem</option>
                           <option value="FAIL">Selejt / Fraud</option>
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Megjegyzés</label>
                     <textarea 
                        rows={2}
                        value={currentTest.notes || ''}
                        onChange={(e) => setCurrentTest({...currentTest, notes: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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

export default LabTests;
