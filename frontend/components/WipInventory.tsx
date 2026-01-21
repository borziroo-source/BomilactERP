import React, { useState } from 'react';
import { 
  Factory, 
  ArrowRight, 
  Clock, 
  Thermometer, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  MoreVertical,
  Scale,
  Calendar,
  DollarSign,
  PackageCheck
} from 'lucide-react';

// --- Types ---

export type ProductionStage = 'COAGULATION' | 'PRESSING' | 'SALTING' | 'RIPENING' | 'READY_FOR_PACKAGING';

export interface WipBatch {
  id: string;
  batchId: string; // LOT Number
  productName: string;
  sku: string;
  stage: ProductionStage;
  quantity: number;
  uom: string;
  startDate: string; // ISO Date
  targetRipeningDays: number; // How many days it needs to mature
  currentAgeDays: number; // Calculated or stored
  location: string;
  accumulatedCost: number; // RON - For P&L tracking
  qualityStatus: 'OK' | 'CHECK_NEEDED' | 'ISSUE';
}

// --- Mock Data ---

const INITIAL_BATCHES: WipBatch[] = [
  {
    id: 'wip-1',
    batchId: 'L23-1025-01',
    productName: 'Cașcaval Rucăr',
    sku: 'WIP-CURD-RUC',
    stage: 'PRESSING',
    quantity: 450,
    uom: 'db',
    startDate: '2023-10-26T06:00:00',
    targetRipeningDays: 14,
    currentAgeDays: 0,
    location: 'Gyártósor A / Prés 2',
    accumulatedCost: 4500,
    qualityStatus: 'OK'
  },
  {
    id: 'wip-2',
    batchId: 'L23-1024-03',
    productName: 'Cașcaval Dalia',
    sku: 'WIP-CHS-SALT-DAL',
    stage: 'SALTING',
    quantity: 320,
    uom: 'db',
    startDate: '2023-10-25T14:00:00',
    targetRipeningDays: 21,
    currentAgeDays: 1,
    location: 'Sófürdő 1',
    accumulatedCost: 3800,
    qualityStatus: 'OK'
  },
  {
    id: 'wip-3',
    batchId: 'L23-1010-05',
    productName: 'Cașcaval Rucăr',
    sku: 'WIP-MAT-RUC',
    stage: 'RIPENING',
    quantity: 1200,
    uom: 'db',
    startDate: '2023-10-10T08:00:00',
    targetRipeningDays: 14,
    currentAgeDays: 16, // Overdue/Ready
    location: 'Érlelő 1 / Polc C',
    accumulatedCost: 15600,
    qualityStatus: 'OK'
  },
  {
    id: 'wip-4',
    batchId: 'L23-1015-02',
    productName: 'Trapista',
    sku: 'WIP-MAT-TRAP',
    stage: 'RIPENING',
    quantity: 800,
    uom: 'db',
    startDate: '2023-10-15T09:00:00',
    targetRipeningDays: 30,
    currentAgeDays: 11,
    location: 'Érlelő 2 / Polc A',
    accumulatedCost: 9200,
    qualityStatus: 'CHECK_NEEDED'
  },
  {
    id: 'wip-5',
    batchId: 'L23-1026-04',
    productName: 'Telemea Juh',
    sku: 'WIP-CURD-TEL',
    stage: 'COAGULATION',
    quantity: 1500,
    uom: 'kg',
    startDate: '2023-10-26T09:30:00',
    targetRipeningDays: 45,
    currentAgeDays: 0,
    location: 'Kád 3',
    accumulatedCost: 6000,
    qualityStatus: 'OK'
  },
];

const WipInventory: React.FC = () => {
  const [batches, setBatches] = useState<WipBatch[]>(INITIAL_BATCHES);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Helpers ---

  const getStageLabel = (stage: ProductionStage) => {
    switch (stage) {
      case 'COAGULATION': return 'Alvadás / Szűrés';
      case 'PRESSING': return 'Préselés';
      case 'SALTING': return 'Sózás';
      case 'RIPENING': return 'Érlelés';
      case 'READY_FOR_PACKAGING': return 'Csomagolásra Kész';
      default: return stage;
    }
  };

  const getStageColor = (stage: ProductionStage) => {
    switch (stage) {
      case 'COAGULATION': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PRESSING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'SALTING': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RIPENING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'READY_FOR_PACKAGING': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-100';
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percent = (current / target) * 100;
    if (percent >= 100) return 'bg-green-500';
    if (percent > 80) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  // --- Handlers ---

  const handleNextStage = (id: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== id) return b;
      
      let nextStage: ProductionStage = b.stage;
      if (b.stage === 'COAGULATION') nextStage = 'PRESSING';
      else if (b.stage === 'PRESSING') nextStage = 'SALTING';
      else if (b.stage === 'SALTING') nextStage = 'RIPENING';
      else if (b.stage === 'RIPENING') nextStage = 'READY_FOR_PACKAGING';
      
      if (nextStage !== b.stage) {
         // In a real app, this would trigger an API call and possibly update location
         return { ...b, stage: nextStage };
      }
      return b;
    }));
  };

  const handleFinish = (id: string) => {
    if(window.confirm("Biztosan késztermék raktárba mozgatod a tételt? Ezzel a LOT lezárul.")) {
        setBatches(prev => prev.filter(b => b.id !== id));
        // Logic to add to inv_finished would go here
    }
  };

  // --- Filtering ---
  
  const filteredBatches = batches.filter(b => {
    const matchesSearch = b.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.batchId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'ALL' ? true : 
                         filterStage === 'RIPENING' ? b.stage === 'RIPENING' :
                         filterStage === 'PROCESSING' ? ['COAGULATION', 'PRESSING', 'SALTING'].includes(b.stage) :
                         b.stage === 'READY_FOR_PACKAGING';
    return matchesSearch && matchesStage;
  });

  // --- Stats ---
  const totalItems = batches.reduce((acc, b) => acc + (b.uom === 'db' ? b.quantity : 0), 0); // Approx
  const totalValue = batches.reduce((acc, b) => acc + b.accumulatedCost, 0);
  const ripeningCount = batches.filter(b => b.stage === 'RIPENING').length;

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Aktív LOT-ok Értéke</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{totalValue.toLocaleString()} RON</h3>
             <p className="text-xs text-slate-400 mt-1">Halmozott gyártási költség</p>
           </div>
           <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
             <DollarSign size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Érlelő Kapacitás</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{ripeningCount} LOT</h3>
             <p className="text-xs text-purple-600 font-medium mt-1">Aktív érlelés alatt</p>
           </div>
           <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
             <Thermometer size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Napi Termelés</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{filteredBatches.length} Tétel</h3>
             <p className="text-xs text-green-600 font-medium mt-1">Folyamatban lévő gyártás</p>
           </div>
           <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
             <Factory size={24} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <button 
              onClick={() => setFilterStage('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterStage === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Összes
            </button>
            <button 
              onClick={() => setFilterStage('PROCESSING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterStage === 'PROCESSING' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Feldolgozás (Gyártás)
            </button>
            <button 
              onClick={() => setFilterStage('RIPENING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterStage === 'RIPENING' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Érlelés (Pince)
            </button>
         </div>

         <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="LOT szám vagy Termék..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBatches.map(batch => {
           const progressPercent = Math.min(100, (batch.currentAgeDays / batch.targetRipeningDays) * 100);
           const isRipe = batch.currentAgeDays >= batch.targetRipeningDays;
           
           return (
             <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                   
                   {/* Col 1: Identity */}
                   <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStageColor(batch.stage)}`}>
                            {getStageLabel(batch.stage)}
                         </span>
                         {batch.qualityStatus === 'CHECK_NEEDED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700 flex items-center">
                               <AlertTriangle size={10} className="mr-1" /> Minőségell.
                            </span>
                         )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">{batch.productName}</h4>
                      <div className="text-sm text-slate-500 font-mono flex items-center">
                         <span className="bg-slate-100 px-1.5 rounded mr-2">{batch.batchId}</span>
                         {new Date(batch.startDate).toLocaleDateString('hu-HU')}
                      </div>
                   </div>

                   {/* Col 2: Quantity & Location */}
                   <div className="flex-1 lg:border-l lg:border-slate-100 lg:pl-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <span className="text-slate-400 text-xs font-bold uppercase">Mennyiség</span>
                            <div className="font-bold text-slate-800 text-lg">
                               {batch.quantity.toLocaleString()} <span className="text-sm text-slate-500 font-normal">{batch.uom}</span>
                            </div>
                         </div>
                         <div>
                            <span className="text-slate-400 text-xs font-bold uppercase">Lokáció</span>
                            <div className="font-medium text-slate-700 text-sm flex items-center mt-0.5">
                               <ArrowRight size={12} className="mr-1 text-slate-400" /> {batch.location}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Col 3: Ripening Progress (Only relevant if Ripening) */}
                   <div className="flex-1 lg:border-l lg:border-slate-100 lg:pl-6">
                      <span className="text-slate-400 text-xs font-bold uppercase flex justify-between">
                         <span>Érlelési Idő</span>
                         <span className={isRipe ? 'text-green-600 font-bold' : 'text-slate-600'}>
                            {batch.currentAgeDays} / {batch.targetRipeningDays} nap
                         </span>
                      </span>
                      <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(batch.currentAgeDays, batch.targetRipeningDays)}`} 
                           style={{ width: `${progressPercent}%` }}
                         ></div>
                      </div>
                      {isRipe && batch.stage === 'RIPENING' && (
                         <div className="text-[10px] text-green-600 font-bold mt-1 flex items-center">
                            <CheckCircle size={10} className="mr-1" /> Érlelés Kész
                         </div>
                      )}
                   </div>

                   {/* Col 4: Actions */}
                   <div className="flex items-center space-x-2 lg:border-l lg:border-slate-100 lg:pl-6 pt-4 lg:pt-0">
                      {batch.stage !== 'READY_FOR_PACKAGING' ? (
                         <button 
                           onClick={() => handleNextStage(batch.id)}
                           className="flex-1 lg:flex-none px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-bold transition flex items-center justify-center whitespace-nowrap"
                         >
                            Tovább <ArrowRight size={16} className="ml-2" />
                         </button>
                      ) : (
                         <button 
                           onClick={() => handleFinish(batch.id)}
                           className="flex-1 lg:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition flex items-center justify-center whitespace-nowrap shadow-lg shadow-green-600/20"
                         >
                            <PackageCheck size={16} className="mr-2" /> Készrejelentés
                         </button>
                      )}
                      
                      <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg">
                         <MoreVertical size={18} />
                      </button>
                   </div>

                </div>
             </div>
           );
        })}

        {filteredBatches.length === 0 && (
           <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Factory size={48} className="mx-auto mb-3 opacity-20" />
              <p>Nincs megjeleníthető tétel a kiválasztott szűrőkkel.</p>
           </div>
        )}
      </div>

    </div>
  );
};

export default WipInventory;