import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  Users, 
  Truck, 
  Factory, 
  DollarSign, 
  PieChart as PieIcon, 
  Calendar,
  AlertCircle,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// --- Mock Data ---

const MONTHLY_COST_DATA = [
  { name: 'Jan', raw: 120000, energy: 35000, labor: 45000, logistics: 22000 },
  { name: 'Feb', raw: 115000, energy: 38000, labor: 45000, logistics: 21000 },
  { name: 'Már', raw: 130000, energy: 32000, labor: 46000, logistics: 25000 },
  { name: 'Ápr', raw: 145000, energy: 30000, labor: 48000, logistics: 28000 },
  { name: 'Máj', raw: 140000, energy: 28000, labor: 48000, logistics: 26000 },
  { name: 'Jún', raw: 155000, energy: 33000, labor: 52000, logistics: 30000 },
];

const COST_BY_DEPARTMENT = [
  { name: 'Termelés', value: 65, color: '#3b82f6' },
  { name: 'Logisztika', value: 15, color: '#10b981' },
  { name: 'Admin', value: 10, color: '#f59e0b' },
  { name: 'Minőségügy', value: 10, color: '#8b5cf6' },
];

const CostAnalysis: React.FC = () => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('6M');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header with Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Költségelemzés & Kontrolling</h2>
          <p className="text-slate-500 font-medium">Üzemi kiadások és hatékonysági mutatók</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
           {['1M', '3M', '6M', '1Y'].map(range => (
             <button 
               key={range}
               onClick={() => setTimeRange(range)}
               className={`px-4 py-1.5 rounded-lg text-xs font-black transition ${timeRange === range ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <p className="text-xs text-slate-500 font-bold uppercase mb-1">Összes Üzemi Költség</p>
           <h3 className="text-2xl font-black text-slate-800">270.000 RON</h3>
           <div className="mt-2 flex items-center text-xs font-bold text-red-600 bg-red-50 w-fit px-2 py-1 rounded">
             <TrendingUp size={12} className="mr-1" /> +4.2% <span className="text-slate-400 ml-1 font-normal">vs. előző hó</span>
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <p className="text-xs text-slate-500 font-bold uppercase mb-1">Energia Hatékonyság</p>
           <h3 className="text-2xl font-black text-slate-800">3.12 RON / kg</h3>
           <div className="mt-2 flex items-center text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
             <TrendingDown size={12} className="mr-1" /> -2.1% <span className="text-slate-400 ml-1 font-normal">javuló trend</span>
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
           <p className="text-xs text-slate-500 font-bold uppercase mb-1">Bérköltség Arány</p>
           <h3 className="text-2xl font-black text-slate-800">19.2%</h3>
           <p className="text-xs text-slate-400 mt-2 font-medium">A teljes bevételhez képest</p>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-800 flex flex-col justify-between">
           <div className="flex items-center text-blue-400 font-black text-xs uppercase mb-2">
             <BrainCircuit size={14} className="mr-2" /> AI Optimalizáció
           </div>
           <p className="text-slate-300 text-xs leading-relaxed">
             A gázfogyasztás csökkenthető 8%-kal a pasztőrözési ciklusok átszervezésével.
           </p>
           <button className="mt-3 text-[10px] font-black bg-blue-600 text-white py-1.5 rounded uppercase tracking-wider hover:bg-blue-500 transition">
             Részletek
           </button>
        </div>
      </div>

      {/* Charts Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cost Structure Over Time */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center">
                 <BarChart3 size={20} className="mr-2 text-blue-500" />
                 Költségstruktúra Alakulása
              </h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase">
                 <span className="flex items-center text-blue-500"><div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div> Tej</span>
                 <span className="flex items-center text-amber-500"><div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div> Energia</span>
                 <span className="flex items-center text-purple-500"><div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div> Bér</span>
              </div>
           </div>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={MONTHLY_COST_DATA}>
                    <defs>
                       <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                       <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="raw" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRaw)" />
                    <Area type="monotone" dataKey="energy" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEnergy)" />
                    <Area type="monotone" dataKey="labor" stackId="1" stroke="#8b5cf6" fillOpacity={1} fill="#8b5cf6" fill-opacity="0.05" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <PieIcon size={20} className="mr-2 text-emerald-500" />
              Költséghelyek Bontása
           </h3>
           <div className="flex-1 h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={COST_BY_DEPARTMENT}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                       {COST_BY_DEPARTMENT.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-3 mt-4">
              {COST_BY_DEPARTMENT.map(dept => (
                <div key={dept.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: dept.color}}></div>
                      <span className="text-sm font-medium text-slate-600">{dept.name}</span>
                   </div>
                   <span className="text-sm font-black text-slate-800">{dept.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Specific Cost Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Logistics Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Truck size={18} className="text-blue-500" /> Logisztikai Hatékonyság
              </h3>
              <button className="text-xs font-black text-blue-600 hover:underline">Riport Megnyitása</button>
           </div>
           <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Üzemanyag / 100km</p>
                    <div className="text-xl font-black text-slate-800">22.4 L</div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Karbantartási Költség</p>
                    <div className="text-xl font-black text-slate-800">12.800 RON</div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-600">HR-10-BOM (Tanker)</div>
                    <div className="flex items-center gap-2">
                       <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{width: '75%'}}></div>
                       </div>
                       <span className="text-xs font-bold text-slate-400">Optimális</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-600">HR-99-TEJ (Hűtős)</div>
                    <div className="flex items-center gap-2">
                       <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{width: '92%'}}></div>
                       </div>
                       <span className="text-xs font-bold text-amber-600">Magas</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Energy & Waste Anomaly Log */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Zap size={18} className="text-amber-500" /> Költség-Anomáliák (AI)
              </h3>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase">3 Figyelmeztetés</span>
           </div>
           <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-slate-50">
              <div className="p-4 hover:bg-slate-50 transition flex gap-4">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg h-fit"><AlertCircle size={20} /></div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-800">Kiugró áramfogyasztás - Hűtőkamra 2</h4>
                    <p className="text-xs text-slate-500 mt-1">Az éjszakai fogyasztás 30%-kal haladta meg az átlagot. Lehetséges szigetelési hiba vagy nyitva maradt ajtó.</p>
                    <span className="text-[10px] text-slate-400 font-bold mt-2 block">MA 04:30</span>
                 </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex gap-4">
                 <div className="p-2 bg-amber-50 text-amber-600 rounded-lg h-fit"><TrendingUp size={20} /></div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-800">Vegyszerfelhasználás növekedés</h4>
                    <p className="text-xs text-slate-500 mt-1">A CIP tisztításhoz használt lúg mennyisége 12%-kal nőtt a termelési volumenhez képest.</p>
                    <span className="text-[10px] text-slate-400 font-bold mt-2 block">TEGNAP 16:15</span>
                 </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex gap-4">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit"><Users size={20} /></div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-800">Túlóra-riasztás (Csomagoló osztály)</h4>
                    <p className="text-xs text-slate-500 mt-1">A heti túlóraköltség elérte a havi keret 60%-át.</p>
                    <span className="text-[10px] text-slate-400 font-bold mt-2 block">TEGNAP 12:00</span>
                 </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default CostAnalysis;