
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Microscope, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TestTube, 
  Save, 
  X,
  Edit2,
  Trash2,
  Droplet,
  Beaker,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  fetchLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  LabTestDto,
  LabTestInput,
  SampleType,
  LabTestStatus,
  LabTestResult,
  AntibioticResult,
} from '../services/labTests';
import { usePermission } from '../hooks/usePermission';

// --- Types ---
type TestResult = LabTestResult;

const PAGE_SIZE = 20;

const LabTests: React.FC = () => {
  const { t } = useLanguage();

  // List state
  const [tests, setTests] = useState<LabTestDto[]>([]);
  const { canCreate, canUpdate, canDelete } = usePermission('qa', 'qa_lab');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SampleType | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<Partial<LabTestInput & { id?: number; sampleId: string }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Data Loading ---

  const loadTests = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchLabTests({
        searchTerm: searchTerm || undefined,
        type: filterType !== 'ALL' ? filterType : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setTests(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Hiba az adatok betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterType, dateFrom, dateTo]);

  useEffect(() => {
    loadTests(1);
  }, [loadTests]);

  // --- Stats (computed from current page data) ---
  const stats = useMemo(() => {
    const pending = tests.filter(t => t.status === 'PENDING').length;
    const failed = tests.filter(t => t.result === 'FAIL').length;
    const rawMilkTests = tests.filter(t => t.type === 'RAW_MILK' && t.fat != null);
    const avgFat = rawMilkTests.length
      ? (rawMilkTests.reduce((acc, t) => acc + (t.fat ?? 0), 0) / rawMilkTests.length).toFixed(2)
      : '-';
    return { total: totalCount, pending, failed, avgFat };
  }, [tests, totalCount]);

  // --- Handlers ---

  const handleAddNew = () => {
    setCurrentTest({
      sampleId: `SMP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toISOString().slice(0, 16),
      type: 'RAW_MILK',
      status: 'PENDING',
      fat: 3.50,
      protein: 3.20,
      density: 1.029,
      water: 0,
      inspector: 'Aktív Laboráns',
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (test: LabTestDto) => {
    setCurrentTest({
      id: test.id,
      sampleId: test.sampleId,
      date: test.date.slice(0, 16),
      sourceName: test.sourceName,
      type: test.type,
      fat: test.fat ?? undefined,
      protein: test.protein ?? undefined,
      ph: test.ph ?? undefined,
      density: test.density ?? undefined,
      water: test.water ?? undefined,
      antibiotic: test.antibiotic ?? undefined,
      scc: test.scc ?? undefined,
      cfu: test.cfu ?? undefined,
      status: test.status,
      inspector: test.inspector,
      notes: test.notes ?? undefined,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a vizsgálatot?')) return;
    try {
      await deleteLabTest(id);
      await loadTests(currentPage);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Hiba a törléskor.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTest.sampleId || !currentTest.sourceName) return;
    setIsSaving(true);
    try {
      const payload: LabTestInput = {
        sampleId: currentTest.sampleId!,
        date: currentTest.date!,
        sourceName: currentTest.sourceName!,
        type: (currentTest.type as SampleType) ?? 'RAW_MILK',
        fat: currentTest.fat ?? null,
        protein: currentTest.protein ?? null,
        ph: currentTest.ph ?? null,
        density: currentTest.density ?? null,
        water: currentTest.water ?? null,
        antibiotic: (currentTest.antibiotic as AntibioticResult) ?? null,
        scc: currentTest.scc ?? null,
        cfu: currentTest.cfu ?? null,
        status: (currentTest.status as LabTestStatus) ?? 'PENDING',
        inspector: currentTest.inspector!,
        notes: currentTest.notes ?? null,
      };

      if (isEditing && currentTest.id) {
        await updateLabTest(currentTest.id, payload);
      } else {
        await createLabTest(payload);
      }
      setIsModalOpen(false);
      await loadTests(isEditing ? currentPage : 1);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Hiba a mentéskor.');
    } finally {
      setIsSaving(false);
    }
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
      <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-3">
        {/* Type filter + Search + Add button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>Összes</button>
            <button onClick={() => setFilterType('RAW_MILK')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'RAW_MILK' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}>Nyers Tej</button>
            <button onClick={() => setFilterType('WIP')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'WIP' ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-50 text-slate-600'}`}>Gyártásközi</button>
            <button onClick={() => setFilterType('FINISHED_GOOD')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'FINISHED_GOOD' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}>Késztermék</button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
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
              disabled={!canCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={18} className="mr-1" />
              <span className="hidden sm:inline">Új Vizsgálat</span>
              <span className="sm:hidden">Új</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center text-xs text-slate-500 font-bold uppercase mr-1 shrink-0">
            <Calendar size={13} className="mr-1.5" /> Dátum szűrő:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-3 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                placeholder="Tól"
              />
            </div>
            <span className="text-slate-400 text-sm">–</span>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-3 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                placeholder="Ig"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-slate-500 hover:text-red-500 transition flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-50"
              >
                <X size={13} /> Töröl
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          Betöltés...
                        </div>
                      </td>
                    </tr>
                  ) : tests.length > 0 ? (
                    tests.map(test => (
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
                               {test.fat != null && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-bold">{t('lab.fat')}: {test.fat.toFixed(2)}</span>}
                               {test.protein != null && <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-bold">{t('lab.protein')}: {test.protein.toFixed(2)}</span>}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-2 text-xs">
                               {test.density != null && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-medium">{t('lab.density')}: {test.density.toFixed(3)}</span>}
                               {test.water != null && <span className={`px-1.5 py-0.5 rounded border font-bold ${test.water > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{t('lab.water')}: {test.water}%</span>}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            {test.antibiotic && (
                               <div className={`text-xs font-bold mb-1 ${test.antibiotic === 'POSITIVE' ? 'text-red-600' : 'text-green-600'}`}>
                                  AB: {test.antibiotic === 'POSITIVE' ? 'POZITÍV' : 'NEGATÍV'}
                               </div>
                            )}
                            {test.scc != null && (
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
                               <button onClick={() => handleEdit(test)} disabled={!canUpdate} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"><Edit2 size={16}/></button>
                               <button onClick={() => handleDelete(test.id)} disabled={!canDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={16}/></button>
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

         {/* Pagination */}
         {totalPages > 1 && (
           <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
             <p className="text-sm text-slate-500">
               <span className="font-bold text-slate-700">{totalCount}</span> vizsgálatból{' '}
               <span className="font-bold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> látható
             </p>
             <div className="flex items-center gap-2">
               <button
                 onClick={() => loadTests(currentPage - 1)}
                 disabled={currentPage <= 1 || isLoading}
                 className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
               >
                 <ChevronLeft size={16} />
               </button>
               <span className="text-sm font-bold text-slate-700">{currentPage} / {totalPages}</span>
               <button
                 onClick={() => loadTests(currentPage + 1)}
                 disabled={currentPage >= totalPages || isLoading}
                 className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
               >
                 <ChevronRight size={16} />
               </button>
             </div>
           </div>
         )}
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
                        value={currentTest.sourceName ?? ''}
                        onChange={(e) => setCurrentTest({...currentTest, sourceName: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                        <Beaker size={14} className="mr-1" /> Minőségi Paraméterek
                     </h4>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.fat')} (%)</label>
                           <input type="number" step="0.01" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-blue-700" 
                              value={currentTest.fat ?? ''} onChange={(e) => setCurrentTest({...currentTest, fat: e.target.value ? parseFloat(e.target.value) : undefined})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.protein')} (%)</label>
                           <input type="number" step="0.01" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-indigo-700" 
                              value={currentTest.protein ?? ''} onChange={(e) => setCurrentTest({...currentTest, protein: e.target.value ? parseFloat(e.target.value) : undefined})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.density')} (g/cm³)</label>
                           <input type="number" step="0.001" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm font-mono" 
                              value={currentTest.density ?? ''} onChange={(e) => setCurrentTest({...currentTest, density: e.target.value ? parseFloat(e.target.value) : undefined})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700 mb-1">{t('lab.water')} (%)</label>
                           <input type="number" step="0.1" className={`w-full border rounded px-2 py-1.5 text-sm font-bold ${(currentTest.water ?? 0) > 0 ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-300'}`} 
                              value={currentTest.water ?? ''} onChange={(e) => setCurrentTest({...currentTest, water: e.target.value ? parseFloat(e.target.value) : undefined})} />
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
                                 value={currentTest.ph ?? ''} onChange={(e) => setCurrentTest({...currentTest, ph: e.target.value ? parseFloat(e.target.value) : undefined})} />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">SCC (ezer/ml)</label>
                              <input type="number" placeholder="SCC" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" 
                                 value={currentTest.scc ?? ''} onChange={(e) => setCurrentTest({...currentTest, scc: e.target.value ? parseFloat(e.target.value) : undefined})} />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">CFU (ezer/ml)</label>
                              <input type="number" placeholder="CFU" className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm" 
                                 value={currentTest.cfu ?? ''} onChange={(e) => setCurrentTest({...currentTest, cfu: e.target.value ? parseFloat(e.target.value) : undefined})} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Státusz</label>
                        <select 
                           value={currentTest.status}
                           onChange={(e) => setCurrentTest({...currentTest, status: e.target.value as LabTestStatus})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                           <option value="PENDING">Folyamatban</option>
                           <option value="COMPLETED">Kész</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Laboráns</label>
                        <input 
                           type="text"
                           required
                           value={currentTest.inspector ?? ''}
                           onChange={(e) => setCurrentTest({...currentTest, inspector: e.target.value})}
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Megjegyzés</label>
                     <textarea 
                        rows={2}
                        value={currentTest.notes ?? ''}
                        onChange={(e) => setCurrentTest({...currentTest, notes: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                     ></textarea>
                  </div>

                  <div className="pt-2 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition">Mégse</button>
                     <button type="submit" disabled={isSaving || !(isEditing ? canUpdate : canCreate)} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/30 transition flex justify-center items-center disabled:opacity-60">
                        {isSaving
                          ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          : <Save size={18} className="mr-2" />
                        }
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

export default LabTests;
