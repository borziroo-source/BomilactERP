import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Thermometer, 
  Clock, 
  Play, 
  Pause, 
  FastForward, 
  AlertTriangle, 
  CheckCircle, 
  Beaker, 
  Factory, 
  Settings, 
  X, 
  Save,
  RotateCcw,
  MoreHorizontal
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import {
  fetchActiveBatches,
  updateBatchStep,
  logBatchParams,
  type ProductionBatchDto,
} from '../services/productionBatches';
import { usePermission } from '../hooks/usePermission';

// --- Types ---

export interface ProductionStep {
  name: string;
  durationMinutes: number;
  elapsedMinutes: number;
  type: 'HEATING' | 'MIXING' | 'RESTING' | 'COOLING' | 'CUTTING' | 'DRAINING';
}

export interface ActiveBatch {
  id: number;
  lineId: string;
  lineName: string;
  productName: string;
  batchId: string;
  quantity: number;
  uom: string;
  startTime: string;
  steps: ProductionStep[];
  currentStepIndex: number;
  status: 'RUNNING' | 'PAUSED' | 'ISSUE' | 'COMPLETED';
  currentTemp: number;
  targetTemp: number;
  currentPh: number;
  agitatorRpm: number;
  tempHistory: { time: string, value: number }[];
  alerts: string[];
}

const dtoToBatch = (dto: ProductionBatchDto): ActiveBatch => ({
  id: dto.id,
  lineId: dto.lineId,
  lineName: dto.lineName,
  productName: dto.productName,
  batchId: dto.batchNumber,
  quantity: dto.quantity,
  uom: dto.uom,
  startTime: dto.startTime,
  steps: dto.steps.map(s => ({
    name: s.name,
    durationMinutes: s.durationMinutes,
    elapsedMinutes: s.elapsedMinutes,
    type: (s.stepType as ActiveBatch['steps'][0]['type']) || 'RESTING',
  })),
  currentStepIndex: dto.currentStepIndex,
  status: dto.status as ActiveBatch['status'],
  currentTemp: dto.currentTemp ?? 0,
  targetTemp: dto.targetTemp ?? 0,
  currentPh: dto.currentPh ?? 0,
  agitatorRpm: dto.agitatorRpm ?? 0,
  tempHistory: [],
  alerts: dto.alerts.map(a => a.message),
});

const ActiveProduction: React.FC = () => {
  const [batches, setBatches] = useState<ActiveBatch[]>([]);
  const { canCreate, canUpdate } = usePermission('production', 'prod_active');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal State
  const [paramModalOpen, setParamModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [logParams, setLogParams] = useState({ temp: '', ph: '', note: '' });

  const loadBatches = useCallback(async () => {
    try {
      const data = await fetchActiveBatches();
      setBatches(data.map(dtoToBatch));
    } catch {
      // silently keep existing data on poll failure
    }
  }, []);

  useEffect(() => {
    loadBatches();
    const pollInterval = setInterval(loadBatches, 10000);
    return () => clearInterval(pollInterval);
  }, [loadBatches]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Helpers ---
  
  const getStepProgress = (batch: ActiveBatch) => {
    const currentStep = batch.steps[batch.currentStepIndex];
    if (!currentStep) return 0;
    return Math.min(100, (currentStep.elapsedMinutes / currentStep.durationMinutes) * 100);
  };

  const getTotalProgress = (batch: ActiveBatch) => {
    const totalDuration = batch.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    const completedDuration = batch.steps.slice(0, batch.currentStepIndex).reduce((acc, s) => acc + s.durationMinutes, 0) + batch.steps[batch.currentStepIndex].elapsedMinutes;
    return Math.min(100, (completedDuration / totalDuration) * 100);
  };

  const getStatusColor = (status: ActiveBatch['status']) => {
    switch(status) {
      case 'RUNNING': return 'bg-green-100 text-green-700 border-green-200';
      case 'PAUSED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ISSUE': return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const handleStepAction = async (batchId: number, action: 'NEXT' | 'PREV' | 'PAUSE') => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    if (action === 'PAUSE') {
      setBatches(prev => prev.map(b =>
        b.id === batchId ? { ...b, status: b.status === 'PAUSED' ? 'RUNNING' : 'PAUSED' } : b
      ));
      return;
    }

    const newIndex = action === 'NEXT'
      ? Math.min(batch.currentStepIndex + 1, batch.steps.length - 1)
      : Math.max(batch.currentStepIndex - 1, 0);

    try {
      const updated = await updateBatchStep(batchId, newIndex);
      setBatches(prev => prev.map(b => b.id === batchId ? dtoToBatch(updated) : b));
    } catch {
      alert('Lépésváltás sikertelen.');
    }
  };

  const openLogModal = (batchId: number) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setSelectedBatchId(batchId);
      setLogParams({ 
        temp: batch.currentTemp.toString(), 
        ph: batch.currentPh.toString(), 
        note: '' 
      });
      setParamModalOpen(true);
    }
  };

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    try {
      const updated = await logBatchParams(selectedBatchId, {
        currentTemp: parseFloat(logParams.temp),
        currentPh: parseFloat(logParams.ph),
      });
      setBatches(prev => prev.map(b => b.id === selectedBatchId ? dtoToBatch(updated) : b));
    } catch {
      alert('Paraméter rögzítés sikertelen.');
    }
    setParamModalOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
         <div>
            <h2 className="text-lg font-bold text-slate-800">Aktív Gyártások</h2>
            <p className="text-sm text-slate-500">Valós idejű gyártásfelügyelet és adatgyűjtés</p>
         </div>
         <div className="flex items-center space-x-6">
            <div className="text-right">
               <div className="text-xs text-slate-500 font-bold uppercase">Aktív Vonalak</div>
               <div className="text-xl font-black text-slate-800">{batches.filter(b => b.status !== 'COMPLETED').length} / 5</div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right">
               <div className="text-xs text-slate-500 font-bold uppercase">Kritikus Alert</div>
               <div className={`text-xl font-black ${batches.some(b => b.status === 'ISSUE') ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                  {batches.filter(b => b.status === 'ISSUE').length}
               </div>
            </div>
         </div>
      </div>

      {/* Production Lines Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {batches.map(batch => {
           const currentStep = batch.steps[batch.currentStepIndex];
           const stepProgress = getStepProgress(batch);
           const totalProgress = getTotalProgress(batch);
           const isIssue = batch.status === 'ISSUE';

           return (
             <div key={batch.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${isIssue ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-100'}`}>
                
                {/* Card Header */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-white border border-slate-200 text-slate-700`}>
                         <Factory size={20} />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800">{batch.lineName}</h3>
                         <div className="text-xs text-slate-500 font-mono">{batch.batchId}</div>
                      </div>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${getStatusColor(batch.status)}`}>
                      {batch.status === 'RUNNING' && <Activity size={14} className="mr-1 animate-pulse" />}
                      {batch.status === 'ISSUE' && <AlertTriangle size={14} className="mr-1" />}
                      {batch.status === 'PAUSED' && <Pause size={14} className="mr-1" />}
                      {batch.status}
                   </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                   
                   {/* Product & Quantity */}
                   <div className="flex justify-between items-end mb-6">
                      <div>
                         <span className="text-xs font-bold text-slate-400 uppercase">Termék</span>
                         <div className="text-xl font-bold text-blue-700">{batch.productName}</div>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-bold text-slate-400 uppercase">Mennyiség</span>
                         <div className="text-xl font-bold text-slate-700">{batch.quantity.toLocaleString()} {batch.uom}</div>
                      </div>
                   </div>

                   {/* Current Step Visualization */}
                   <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-bold text-slate-700 flex items-center">
                            <Play size={14} className="mr-2 text-blue-500" />
                            {currentStep.name}
                         </span>
                         <span className="text-xs font-mono text-slate-500">
                            {currentStep.elapsedMinutes} / {currentStep.durationMinutes} min
                         </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-1">
                         <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stepProgress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                         <span>Lépés {batch.currentStepIndex + 1} / {batch.steps.length}</span>
                         <span>Össz: {Math.round(totalProgress)}%</span>
                      </div>
                   </div>

                   {/* Alerts Box */}
                   {batch.alerts.length > 0 && (
                      <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-3">
                         {batch.alerts.map((alert, idx) => (
                            <div key={idx} className="flex items-start text-xs text-red-700 font-bold mb-1 last:mb-0">
                               <AlertTriangle size={12} className="mr-2 mt-0.5 flex-shrink-0" />
                               {alert}
                            </div>
                         ))}
                      </div>
                   )}

                   {/* Real-time Parameters */}
                   <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-center relative group">
                         <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Hőmérséklet</span>
                         <div className={`text-2xl font-black ${Math.abs(batch.currentTemp - batch.targetTemp) > 1 ? 'text-red-500' : 'text-slate-800'}`}>
                            {batch.currentTemp.toFixed(1)}°
                         </div>
                         <div className="text-[10px] text-slate-400">Cél: {batch.targetTemp}°</div>
                         <Thermometer size={16} className="absolute top-2 right-2 text-slate-300" />
                      </div>
                      
                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-center relative">
                         <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">pH Érték</span>
                         <div className="text-2xl font-black text-slate-800">
                            {batch.currentPh.toFixed(2)}
                         </div>
                         <div className="text-[10px] text-slate-400">Normál: 6.4-6.7</div>
                         <Beaker size={16} className="absolute top-2 right-2 text-slate-300" />
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-center relative">
                         <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Keverés (RPM)</span>
                         <div className="text-2xl font-black text-slate-800">
                            {batch.agitatorRpm}
                         </div>
                         <div className="text-[10px] text-slate-400">
                           {batch.agitatorRpm > 0 ? 'Aktív' : 'Áll'}
                         </div>
                         <Settings size={16} className={`absolute top-2 right-2 text-slate-300 ${batch.agitatorRpm > 0 ? 'animate-spin-slow' : ''}`} />
                      </div>
                   </div>
                   
                   {/* Mini Chart Area */}
                   <div className="h-24 w-full mb-6 opacity-80">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={batch.tempHistory}>
                            <Line type="monotone" dataKey="value" stroke="#94a3b8" strokeWidth={2} dot={false} />
                            <Tooltip contentStyle={{fontSize: '10px'}} />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>

                   {/* Controls */}
                   <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                      <button 
                        onClick={() => openLogModal(batch.id)}
                        disabled={!canCreate}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                         <Save size={16} className="mr-2" /> Paraméter
                      </button>
                      
                      <div className="w-px h-8 bg-slate-200 mx-1"></div>

                      <button 
                        onClick={() => handleStepAction(batch.id, 'PAUSE')}
                        disabled={!canUpdate}
                        className={`p-2 rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed ${batch.status === 'PAUSED' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        title={batch.status === 'PAUSED' ? 'Folytatás' : 'Szünet'}
                      >
                         {batch.status === 'PAUSED' ? <Play size={20} fill="currentColor" /> : <Pause size={20} />}
                      </button>
                      
                      <button 
                         onClick={() => handleStepAction(batch.id, 'NEXT')}
                         disabled={!canUpdate}
                         className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition flex items-center justify-center shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                         Lépés Kész <FastForward size={16} className="ml-2" />
                      </button>
                   </div>

                </div>
             </div>
           );
         })}
      </div>

      {/* Parameter Log Modal */}
      {paramModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
               <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center">
                     <Save className="mr-2 text-blue-400" />
                     Kézi Mérés Rögzítése
                  </h3>
                  <button onClick={() => setParamModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
               </div>

               <form onSubmit={handleSaveParams} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Mért Hőmérséklet (°C)</label>
                     <input 
                       type="number" 
                       step="0.1"
                       required
                       value={logParams.temp}
                       onChange={(e) => setLogParams({...logParams, temp: e.target.value})}
                       className="w-full border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Mért pH Érték</label>
                     <input 
                       type="number" 
                       step="0.01"
                       required
                       value={logParams.ph}
                       onChange={(e) => setLogParams({...logParams, ph: e.target.value})}
                       className="w-full border border-slate-300 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Megjegyzés (Opcionális)</label>
                     <textarea 
                       value={logParams.note}
                       onChange={(e) => setLogParams({...logParams, note: e.target.value})}
                       rows={2}
                       className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                     ></textarea>
                  </div>

                  <button type="submit" disabled={!canCreate} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed">
                     <CheckCircle size={18} className="mr-2" />
                     Rögzítés
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default ActiveProduction;