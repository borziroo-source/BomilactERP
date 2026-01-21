import React, { useState } from 'react';
import { 
  Droplet, 
  Thermometer, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  Activity,
  History,
  MoreVertical,
  Beaker
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Types ---

type TankStatus = 'EMPTY' | 'FILLING' | 'STORAGE' | 'EMPTYING' | 'CLEANING' | 'MAINTENANCE';
type MilkType = 'COW' | 'SHEEP' | 'GOAT';

interface Tank {
  id: string;
  name: string;
  capacity: number;
  currentLevel: number;
  temperature: number;
  status: TankStatus;
  lastWash: string; // ISO timestamp
  content?: {
    type: MilkType;
    fat: number;
    protein: number;
    ph: number;
    receivedAt: string; // Age tracking
  };
  alerts?: string[];
}

// --- Mock Data ---

const MOCK_TANKS: Tank[] = [
  {
    id: 'T-01',
    name: 'Nyers Tej Siló 1',
    capacity: 20000,
    currentLevel: 14500,
    temperature: 3.2,
    status: 'STORAGE',
    lastWash: '2023-10-25T18:00:00',
    content: {
      type: 'COW',
      fat: 3.8,
      protein: 3.3,
      ph: 6.6,
      receivedAt: '2023-10-26T08:00:00'
    }
  },
  {
    id: 'T-02',
    name: 'Nyers Tej Siló 2',
    capacity: 20000,
    currentLevel: 2000,
    temperature: 3.8,
    status: 'FILLING',
    lastWash: '2023-10-24T10:00:00',
    content: {
      type: 'COW',
      fat: 3.7,
      protein: 3.2,
      ph: 6.7,
      receivedAt: '2023-10-26T10:30:00'
    }
  },
  {
    id: 'T-03',
    name: 'Juh Tej Puffer',
    capacity: 5000,
    currentLevel: 0,
    temperature: 22.0,
    status: 'CLEANING',
    lastWash: '2023-10-26T09:00:00', // Just washed
  },
  {
    id: 'T-04',
    name: 'Standardizáló',
    capacity: 10000,
    currentLevel: 8500,
    temperature: 4.5, // Slightly high
    status: 'EMPTYING',
    lastWash: '2023-10-25T14:00:00',
    content: {
      type: 'COW',
      fat: 1.5, // Skimmed/Standardized
      protein: 3.3,
      ph: 6.6,
      receivedAt: '2023-10-26T06:00:00'
    },
    alerts: ['Hőmérséklet emelkedés észlelhető']
  }
];

const TEMP_HISTORY_DATA = [
  { time: '00:00', t1: 3.1, t2: 3.2, t4: 4.0 },
  { time: '02:00', t1: 3.1, t2: 3.3, t4: 4.1 },
  { time: '04:00', t1: 3.2, t2: 3.5, t4: 4.2 },
  { time: '06:00', t1: 3.2, t2: 3.6, t4: 4.3 },
  { time: '08:00', t1: 3.3, t2: 3.8, t4: 4.4 },
  { time: '10:00', t1: 3.2, t2: 3.8, t4: 4.5 },
];

const RawMaterialInventory: React.FC = () => {
  const [tanks, setTanks] = useState<Tank[]>(MOCK_TANKS);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);

  // --- Calculations ---
  const totalCapacity = tanks.reduce((acc, t) => acc + t.capacity, 0);
  const totalVolume = tanks.reduce((acc, t) => acc + t.currentLevel, 0);
  const utilization = Math.round((totalVolume / totalCapacity) * 100);

  // --- Helpers ---
  const getFillPercentage = (tank: Tank) => (tank.currentLevel / tank.capacity) * 100;
  
  const getStatusColor = (status: TankStatus) => {
    switch (status) {
      case 'STORAGE': return 'bg-green-500';
      case 'FILLING': return 'bg-blue-500';
      case 'EMPTYING': return 'bg-amber-500';
      case 'CLEANING': return 'bg-purple-500';
      case 'MAINTENANCE': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  const getStatusLabel = (status: TankStatus) => {
    switch (status) {
      case 'STORAGE': return 'Tárolás';
      case 'FILLING': return 'Töltés';
      case 'EMPTYING': return 'Ürítés';
      case 'CLEANING': return 'Mosás (CIP)';
      case 'MAINTENANCE': return 'Karbantartás';
      default: return 'Üres';
    }
  };

  const getMilkTypeLabel = (type?: MilkType) => {
     if (!type) return '-';
     if (type === 'COW') return 'Tehén';
     if (type === 'SHEEP') return 'Juh';
     return 'Kecske';
  };

  const handleAction = (tankId: string, action: string) => {
    alert(`${action} parancs elküldve a ${tankId} tartály vezérlőnek.`);
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Összes Készlet</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{totalVolume.toLocaleString()} L</h3>
             <p className="text-xs text-green-600 font-medium mt-1">Kihasználtság: {utilization}%</p>
           </div>
           <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
             <Droplet size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Átlag Hőmérséklet</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">3.6 °C</h3>
             <p className="text-xs text-slate-400 mt-1">Ideális tartomány: 2-4 °C</p>
           </div>
           <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
             <Thermometer size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Aktív CIP Mosás</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">1 Tartály</h3>
             <p className="text-xs text-purple-600 font-medium mt-1">Juh Tej Puffer</p>
           </div>
           <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
             <RefreshCw size={24} />
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* TANKS GRID */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
           {tanks.map(tank => {
             const percent = getFillPercentage(tank);
             const isWarning = tank.temperature > 4 && tank.currentLevel > 0;
             const isWashExpired = new Date().getTime() - new Date(tank.lastWash).getTime() > 48 * 60 * 60 * 1000; // 48h limit

             return (
               <div 
                 key={tank.id} 
                 onClick={() => setSelectedTank(tank)}
                 className={`
                    relative bg-white rounded-2xl shadow-sm border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md group
                    ${selectedTank?.id === tank.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100 hover:border-blue-200'}
                 `}
               >
                 {/* Visual Liquid Level */}
                 <div className="absolute bottom-0 left-0 w-full bg-blue-50 transition-all duration-1000 ease-in-out" style={{ height: `${percent}%` }}>
                    <div className="absolute top-0 left-0 w-full h-px bg-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 </div>

                 {/* Cleaning Status Overlay */}
                 {tank.status === 'CLEANING' && (
                    <div className="absolute inset-0 bg-purple-50/80 flex flex-col items-center justify-center z-10 backdrop-blur-[1px]">
                       <RefreshCw className="text-purple-600 animate-spin mb-2" size={32} />
                       <span className="font-bold text-purple-800 uppercase tracking-widest text-sm">Mosás</span>
                    </div>
                 )}

                 {/* Content Layer */}
                 <div className="relative z-20 p-5 h-full flex flex-col justify-between min-h-[280px]">
                    
                    {/* Tank Header */}
                    <div className="flex justify-between items-start">
                       <div>
                          <span className="text-xs font-bold text-slate-400 block mb-1">{tank.id}</span>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight w-3/4">{tank.name}</h4>
                       </div>
                       <div className={`w-3 h-3 rounded-full ${getStatusColor(tank.status)} shadow-sm animate-pulse`}></div>
                    </div>

                    {/* Alerts */}
                    {(isWarning || tank.alerts) && (
                       <div className="bg-red-100/90 text-red-800 text-xs p-2 rounded-lg font-bold flex items-center mt-2 backdrop-blur-sm">
                          <AlertTriangle size={12} className="mr-1" />
                          {tank.alerts ? tank.alerts[0] : 'Magas Hőfok!'}
                       </div>
                    )}
                    {isWashExpired && tank.status !== 'CLEANING' && (
                       <div className="bg-amber-100/90 text-amber-800 text-xs p-2 rounded-lg font-bold flex items-center mt-2 backdrop-blur-sm">
                          <History size={12} className="mr-1" />
                          Mosás esedékes!
                       </div>
                    )}

                    {/* Tank Stats */}
                    <div className="space-y-3 mt-auto">
                       <div className="flex justify-between items-end border-b border-slate-200/50 pb-2">
                          <span className="text-slate-500 text-xs font-bold uppercase">Mennyiség</span>
                          <div className="text-right">
                             <span className="block text-2xl font-black text-slate-800">{tank.currentLevel.toLocaleString()}</span>
                             <span className="text-xs text-slate-500 font-medium">/ {tank.capacity.toLocaleString()} Liter</span>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2">
                          <div>
                             <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Hőfok</span>
                             <div className={`flex items-center font-bold ${isWarning ? 'text-red-600' : 'text-slate-700'}`}>
                                <Thermometer size={14} className="mr-1" />
                                {tank.temperature.toFixed(1)} °C
                             </div>
                          </div>
                          <div>
                             <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Típus</span>
                             <div className="flex items-center font-bold text-slate-700">
                                <Activity size={14} className="mr-1" />
                                {getMilkTypeLabel(tank.content?.type)}
                             </div>
                          </div>
                       </div>
                    </div>

                 </div>
               </div>
             );
           })}
        </div>

        {/* SIDEBAR DETAILS */}
        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
           {selectedTank ? (
             <>
               <div className="p-5 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-lg text-slate-800">{selectedTank.name}</h3>
                     <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getStatusColor(selectedTank.status)}`}>
                        {getStatusLabel(selectedTank.status)}
                     </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedTank.id} • Last CIP: {new Date(selectedTank.lastWash).toLocaleDateString()}</p>
               </div>

               <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => handleAction(selectedTank.id, 'START_CIP')}
                       className="flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 transition"
                     >
                       <RefreshCw size={16} className="mr-2" /> Indít: CIP
                     </button>
                     <button 
                       onClick={() => handleAction(selectedTank.id, 'TRANSFER')}
                       className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                     >
                       <ArrowRight size={16} className="mr-2" /> Átfejtés
                     </button>
                  </div>

                  {/* Chemistry */}
                  {selectedTank.content && (
                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                          <Beaker size={14} className="mr-1"/> Labor Paraméterek
                       </h4>
                       <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                          <div className="flex justify-between items-center">
                             <span className="text-sm text-slate-600">Zsír tartalom</span>
                             <span className="font-bold text-slate-800">{selectedTank.content.fat}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-yellow-400 h-full" style={{ width: `${(selectedTank.content.fat / 6) * 100}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                             <span className="text-sm text-slate-600">Fehérje</span>
                             <span className="font-bold text-slate-800">{selectedTank.content.protein}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-blue-400 h-full" style={{ width: `${(selectedTank.content.protein / 6) * 100}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                             <span className="text-sm text-slate-600">pH Érték</span>
                             <span className="font-bold text-slate-800">{selectedTank.content.ph}</span>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Temp Chart */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                        <Activity size={14} className="mr-1"/> Hőmérséklet Trend (24h)
                    </h4>
                    <div className="h-40 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TEMP_HISTORY_DATA}>
                          <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 6]} hide />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="t1" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Batch Info */}
                  <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                        <History size={14} className="mr-1"/> Betárolás Előzmények
                     </h4>
                     <ul className="space-y-3 text-sm">
                        <li className="flex justify-between items-center">
                           <span className="text-slate-600">MA 08:30 • HR-10-BOM</span>
                           <span className="font-bold text-slate-800">+4,500 L</span>
                        </li>
                        <li className="flex justify-between items-center">
                           <span className="text-slate-600">MA 07:15 • HR-99-TEJ</span>
                           <span className="font-bold text-slate-800">+3,200 L</span>
                        </li>
                     </ul>
                  </div>

               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                   <Droplet size={32} className="text-slate-300" />
                </div>
                <p>Válassz ki egy tartályt a részletes adatok megtekintéséhez.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default RawMaterialInventory;