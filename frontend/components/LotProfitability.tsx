import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search, 
  Filter, 
  PieChart as PieIcon, 
  BarChart3, 
  ArrowRight, 
  AlertCircle,
  BrainCircuit,
  Package,
  ShoppingCart,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

// --- Types ---

interface LotProfitData {
  id: string;
  lotNumber: string;
  productName: string;
  quantityProduced: number;
  uom: string;
  revenue: number;
  costs: {
    rawMilk: number;
    auxiliary: number;
    packaging: number;
    laborEnergy: number;
    waste: number;
  };
  margin: number;
  marginPercent: number;
  status: 'COMPLETED' | 'IN_STOCK' | 'SOLD_OUT';
}

// --- Mock Data ---

const MOCK_LOTS: LotProfitData[] = [
  {
    id: '1',
    lotNumber: 'L23-1020-RUC',
    productName: 'Cașcaval Rucăr 450g',
    quantityProduced: 1200,
    uom: 'db',
    revenue: 22200,
    costs: {
      rawMilk: 11500,
      auxiliary: 1200,
      packaging: 1500,
      laborEnergy: 3500,
      waste: 800
    },
    margin: 3700,
    marginPercent: 16.6,
    status: 'SOLD_OUT'
  },
  {
    id: '2',
    lotNumber: 'L23-1022-DAL',
    productName: 'Cașcaval Dalia 450g',
    quantityProduced: 800,
    uom: 'db',
    revenue: 14000,
    costs: {
      rawMilk: 7800,
      auxiliary: 950,
      packaging: 1100,
      laborEnergy: 2200,
      waste: 300
    },
    margin: 1650,
    marginPercent: 11.7,
    status: 'IN_STOCK'
  },
  {
    id: '3',
    lotNumber: 'L23-1025-YOG',
    productName: 'Joghurt Natúr 150g',
    quantityProduced: 5000,
    uom: 'db',
    revenue: 10500,
    costs: {
      rawMilk: 4800,
      auxiliary: 500,
      packaging: 2000,
      laborEnergy: 1200,
      waste: 150
    },
    margin: 1850,
    marginPercent: 17.6,
    status: 'IN_STOCK'
  },
  {
    id: '4',
    lotNumber: 'L23-0930-TRAP',
    productName: 'Sajt Trapista 500g',
    quantityProduced: 600,
    uom: 'db',
    revenue: 13200,
    costs: {
      rawMilk: 8500,
      auxiliary: 1100,
      packaging: 900,
      laborEnergy: 1800,
      waste: 1400 // High waste impact
    },
    margin: -500,
    marginPercent: -3.7,
    status: 'SOLD_OUT'
  }
];

const LotProfitability: React.FC = () => {
  const { t } = useLanguage();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(MOCK_LOTS[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLot = useMemo(() => MOCK_LOTS.find(l => l.id === selectedLotId), [selectedLotId]);

  const filteredLots = MOCK_LOTS.filter(l => 
    l.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const costData = selectedLot ? [
    { name: t('fin.raw_milk_cost'), value: selectedLot.costs.rawMilk, color: '#3b82f6' },
    { name: t('fin.aux_cost'), value: selectedLot.costs.auxiliary, color: '#f59e0b' },
    { name: t('fin.pkg_cost'), value: selectedLot.costs.packaging, color: '#8b5cf6' },
    { name: t('fin.labor_cost'), value: selectedLot.costs.laborEnergy, color: '#10b981' },
    { name: t('fin.waste_impact'), value: selectedLot.costs.waste, color: '#ef4444' },
  ] : [];

  // Fix: Explicitly cast Object.values results to number[] to avoid 'unknown' type errors during arithmetic operations
  const totalCostValue = selectedLot ? (Object.values(selectedLot.costs) as number[]).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-xs text-slate-500 font-bold uppercase">{t('fin.gross_margin')} (Avg)</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">14.2%</h3>
           </div>
           <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={24} />
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Kritikus Tételek</p>
              <h3 className="text-2xl font-black text-red-600 mt-1">1 LOT</h3>
           </div>
           <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle size={24} />
           </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Legjobb Árrés</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">17.6%</h3>
           </div>
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Layers size={24} />
           </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl shadow-lg flex flex-col justify-center">
           <button className="flex items-center justify-center gap-2 text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition">
              <BrainCircuit size={18} />
              {t('fin.ai_analyze')}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: LOT List */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
           <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                 <Package size={18} className="mr-2 text-slate-400" />
                 Befejezett Sarzsok
              </h3>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="LOT keresés..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredLots.map(lot => (
                <div 
                  key={lot.id} 
                  onClick={() => setSelectedLotId(lot.id)}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedLotId === lot.id ? 'bg-blue-50/50 border-l-4 border-blue-600 shadow-sm' : ''}`}
                >
                   <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400">{lot.lotNumber}</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${lot.marginPercent > 15 ? 'bg-green-100 text-green-700' : lot.marginPercent > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                         {lot.marginPercent}%
                      </span>
                   </div>
                   <h4 className="font-bold text-slate-800 text-sm truncate">{lot.productName}</h4>
                   <div className="flex justify-between mt-2 text-xs">
                      <span className="text-slate-500">{lot.quantityProduced} {lot.uom}</span>
                      <span className="font-bold text-slate-700">{lot.revenue.toLocaleString()} RON</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Detailed Analysis */}
        <div className="w-full lg:w-2/3 space-y-6">
           {selectedLot ? (
             <>
               <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <div>
                        <h3 className="text-2xl font-black text-slate-800">{selectedLot.lotNumber}</h3>
                        <p className="text-slate-500 font-medium">{selectedLot.productName}</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="text-right">
                           <div className="text-xs text-slate-400 font-bold uppercase">{t('fin.revenue')}</div>
                           <div className="text-xl font-black text-slate-800">{selectedLot.revenue.toLocaleString()} RON</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-400 font-bold uppercase">{t('fin.gross_margin')}</div>
                           <div className={`text-xl font-black ${selectedLot.margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedLot.margin.toLocaleString()} RON
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-100 pt-6">
                     {/* Cost Structure Pie */}
                     <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                data={costData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                 {costData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <RechartsTooltip />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <span className="text-xs text-slate-400 font-bold uppercase">{t('fin.total_cost')}</span>
                           <span className="text-lg font-black text-slate-800">{totalCostValue.toLocaleString()}</span>
                        </div>
                     </div>

                     {/* Breakdown List */}
                     <div className="space-y-4">
                        {costData.map((cost, idx) => (
                           <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cost.color }}></div>
                                 <span className="text-sm font-medium text-slate-600">{cost.name}</span>
                              </div>
                              <div className="text-right">
                                 <div className="text-sm font-bold text-slate-800">{cost.value.toLocaleString()} RON</div>
                                 <div className="text-[10px] text-slate-400 font-bold">{Math.round((cost.value / totalCostValue) * 100)}%</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Comparison or Insight Bar */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                     <BarChart3 size={18} className="mr-2 text-blue-500" />
                     {t('fin.production_cost')} vs. Standard
                  </h4>
                  <div className="h-48">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                           { name: 'Aktuális', cost: totalCostValue / selectedLot.quantityProduced, color: '#3b82f6' },
                           { name: 'Standard (BOM)', cost: 14.2, color: '#94a3b8' }
                        ]}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                           <YAxis hide />
                           <RechartsTooltip />
                           <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                              <Cell fill="#3b82f6" />
                              <Cell fill="#e2e8f0" />
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
                     <BrainCircuit className="text-blue-600 mr-3 mt-1 shrink-0" size={20} />
                     <div>
                        <p className="text-sm text-blue-800 font-bold">Bomilact Core Insight:</p>
                        <p className="text-xs text-blue-700 mt-1">
                           {selectedLot.marginPercent < 0 
                             ? "Ennél a sarzsnál az önköltség 25%-kal magasabb a standardnál. Ennek fő oka a kiemelkedően magas selejtarány (Selejt hatása: 11%). Vizsgáld felül a technológiai paramétereket a HACCP naplóban."
                             : "Ez a sarzs 4%-kal magasabb árrést generált a tej árszínvonalának csökkenése miatt. A piaci trendek alapján a következő ciklusban is hasonló profitabilitás várható."
                           }
                        </p>
                     </div>
                  </div>
               </div>
             </>
           ) : (
             <div className="h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <BarChart3 size={48} className="mb-4 opacity-20" />
                <p>Válassz ki egy sarzsot a listából az elemzéshez.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default LotProfitability;
