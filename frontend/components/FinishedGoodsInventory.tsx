import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  Truck, 
  MoreVertical,
  ShoppingCart,
  ArrowUpRight,
  Clock,
  Trash2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// --- Types ---

type StockStatus = 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'EXPIRED';

interface FinishedGoodBatch {
  id: string;
  productName: string;
  sku: string;
  batchId: string; // LOT Number
  quantity: number;
  reservedQuantity: number;
  uom: string;
  productionDate: string;
  expiryDate: string;
  location: string;
  status: StockStatus;
  unitPrice?: number; // Estimated value
}

// --- Mock Data ---

const INITIAL_BATCHES: FinishedGoodBatch[] = [
  {
    id: 'fg-1',
    productName: 'Cașcaval Rucăr 450g',
    sku: 'RUC-NAT-450',
    batchId: 'L231001',
    quantity: 1200,
    reservedQuantity: 200,
    uom: 'db',
    productionDate: '2023-10-01',
    expiryDate: '2023-12-01', // OK
    location: 'Hűtő 1 / A-12',
    status: 'AVAILABLE',
    unitPrice: 18.5
  },
  {
    id: 'fg-2',
    productName: 'Cașcaval Rucăr 450g',
    sku: 'RUC-NAT-450',
    batchId: 'L230915',
    quantity: 45,
    reservedQuantity: 0,
    uom: 'db',
    productionDate: '2023-09-15',
    expiryDate: '2023-11-15', // Near expiry
    location: 'Hűtő 1 / A-10',
    status: 'AVAILABLE',
    unitPrice: 18.5
  },
  {
    id: 'fg-3',
    productName: 'Tejföl 12% 350g',
    sku: 'SC-12-350',
    batchId: 'L231020',
    quantity: 5000,
    reservedQuantity: 1500,
    uom: 'db',
    productionDate: '2023-10-20',
    expiryDate: '2023-11-20',
    location: 'Hűtő 2 / B-05',
    status: 'AVAILABLE',
    unitPrice: 4.2
  },
  {
    id: 'fg-4',
    productName: 'Tejföl 20% 850g',
    sku: 'SC-20-850',
    batchId: 'L231018',
    quantity: 800,
    reservedQuantity: 800,
    uom: 'db',
    productionDate: '2023-10-18',
    expiryDate: '2023-11-18',
    location: 'Hűtő 2 / B-06',
    status: 'RESERVED', // Fully reserved
    unitPrice: 9.5
  },
  {
    id: 'fg-5',
    productName: 'Mozzarella Golyó 125g',
    sku: 'MOZZ-BALL-125',
    batchId: 'L230901',
    quantity: 150,
    reservedQuantity: 0,
    uom: 'db',
    productionDate: '2023-09-01',
    expiryDate: '2023-10-15', // Expired
    location: 'Selejt Zóna',
    status: 'EXPIRED',
    unitPrice: 6.0
  },
  {
    id: 'fg-6',
    productName: 'Sajt Trapista 500g',
    sku: 'TRAP-500',
    batchId: 'L231010',
    quantity: 600,
    reservedQuantity: 0,
    uom: 'db',
    productionDate: '2023-10-10',
    expiryDate: '2023-12-10',
    location: 'Hűtő 1 / C-01',
    status: 'QUARANTINE', // Quality check needed
    unitPrice: 22.0
  },
  {
    id: 'fg-7',
    productName: 'Tej 1.5% 1L (Zacskós)',
    sku: 'MILK-15-1L',
    batchId: 'L231025',
    quantity: 2000,
    reservedQuantity: 0,
    uom: 'db',
    productionDate: '2023-10-25',
    expiryDate: '2023-10-30', // Very short shelf life
    location: 'Hűtő 3 / D-01',
    status: 'AVAILABLE',
    unitPrice: 3.5
  }
];

const FinishedGoodsInventory: React.FC = () => {
  const [batches, setBatches] = useState<FinishedGoodBatch[]>(INITIAL_BATCHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');

  // --- Calculations ---

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesSearch = b.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.batchId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()); // FEFO Sort
  }, [batches, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalValue = batches.reduce((acc, b) => acc + (b.quantity * (b.unitPrice || 0)), 0);
    const expiringSoon = batches.filter(b => {
      const days = Math.ceil((new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 15 && b.status === 'AVAILABLE';
    }).length;
    const expired = batches.filter(b => b.status === 'EXPIRED').length;
    
    // Status distribution for Chart
    const statusCount = batches.reduce((acc, b) => {
       acc[b.status] = (acc[b.status] || 0) + 1;
       return acc;
    }, {} as Record<string, number>);
    
    const chartData = [
       { name: 'Elérhető', value: statusCount['AVAILABLE'] || 0, color: '#22c55e' },
       { name: 'Foglalt', value: statusCount['RESERVED'] || 0, color: '#3b82f6' },
       { name: 'Karantén', value: statusCount['QUARANTINE'] || 0, color: '#f59e0b' },
       { name: 'Lejárt', value: statusCount['EXPIRED'] || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return { totalValue, expiringSoon, expired, chartData };
  }, [batches]);

  // --- Helpers ---

  const getDaysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleStatusChange = (id: string, newStatus: StockStatus) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan selejtezni szeretnéd ezt a tételt? Ez a művelet nem vonható vissza.')) {
        setBatches(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Készlet Érték</p>
               <h3 className="text-xl font-black text-slate-800 mt-1">{stats.totalValue.toLocaleString()} RON</h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
               <Package size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Hamarosan Lejár</p>
               <h3 className="text-xl font-black text-amber-600 mt-1">{stats.expiringSoon} Tétel</h3>
               <p className="text-xs text-slate-400">15 napon belül</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
               <Clock size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 font-bold uppercase">Lejárt / Selejt</p>
               <h3 className="text-xl font-black text-red-600 mt-1">{stats.expired} Tétel</h3>
            </div>
            <div className="bg-red-50 text-red-600 p-2 rounded-lg">
               <AlertTriangle size={20} />
            </div>
         </div>
         
         {/* Mini Chart */}
         <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 h-24 flex items-center justify-center relative">
             <div className="w-24 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={stats.chartData} 
                      dataKey="value" 
                      innerRadius={25} 
                      outerRadius={35} 
                      paddingAngle={5}
                      stroke="none"
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="text-xs font-bold text-slate-400">Státusz</div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <button 
               onClick={() => setStatusFilter('ALL')}
               className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
               Összes
            </button>
            <button 
               onClick={() => setStatusFilter('AVAILABLE')}
               className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
               Elérhető
            </button>
            <button 
               onClick={() => setStatusFilter('RESERVED')}
               className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'RESERVED' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
               Foglalt
            </button>
            <button 
               onClick={() => setStatusFilter('QUARANTINE')}
               className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'QUARANTINE' ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
               Karantén
            </button>
            <button 
               onClick={() => setStatusFilter('EXPIRED')}
               className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
               Lejárt
            </button>
         </div>

         <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Termék, LOT, SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                     <th className="px-6 py-4">Termék / LOT</th>
                     <th className="px-6 py-4">Lejárat (FEFO)</th>
                     <th className="px-6 py-4">Lokáció</th>
                     <th className="px-6 py-4 text-right">Mennyiség</th>
                     <th className="px-6 py-4">Státusz</th>
                     <th className="px-6 py-4 text-right">Műveletek</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map(batch => {
                       const daysLeft = getDaysUntilExpiry(batch.expiryDate);
                       const isExpired = daysLeft < 0;
                       const isWarning = !isExpired && daysLeft <= 15;

                       return (
                         <tr key={batch.id} className={`hover:bg-slate-50 transition ${batch.status === 'EXPIRED' ? 'bg-red-50/30' : ''}`}>
                            <td className="px-6 py-4">
                               <div className="font-bold text-slate-800">{batch.productName}</div>
                               <div className="text-xs text-slate-500 flex items-center mt-1">
                                  <span className="font-mono bg-slate-100 px-1.5 rounded mr-2">{batch.batchId}</span>
                                  <span className="text-slate-400">{batch.sku}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center">
                                  <Calendar size={14} className={`mr-2 ${isExpired ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-400'}`} />
                                  <div>
                                     <div className={`font-medium ${isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-700'}`}>
                                        {batch.expiryDate}
                                     </div>
                                     <div className="text-xs text-slate-400">
                                        {isExpired ? 'LEJÁRT!' : `${daysLeft} nap hátra`}
                                     </div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                               {batch.location}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="font-bold text-slate-800 text-base">{batch.quantity.toLocaleString()} {batch.uom}</div>
                               {batch.reservedQuantity > 0 && (
                                  <div className="text-xs text-blue-500 font-medium">Foglalt: {batch.reservedQuantity}</div>
                               )}
                            </td>
                            <td className="px-6 py-4">
                               {batch.status === 'AVAILABLE' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1"/> Elérhető</span>}
                               {batch.status === 'RESERVED' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800"><ShoppingCart size={12} className="mr-1"/> Foglalt</span>}
                               {batch.status === 'QUARANTINE' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800"><Ban size={12} className="mr-1"/> Zárolt</span>}
                               {batch.status === 'EXPIRED' && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800"><AlertTriangle size={12} className="mr-1"/> Lejárt</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end space-x-2">
                                  {batch.status === 'AVAILABLE' && (
                                     <button 
                                       onClick={() => handleStatusChange(batch.id, 'QUARANTINE')}
                                       className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition"
                                       title="Zárolás (Karantén)"
                                     >
                                        <Ban size={16} />
                                     </button>
                                  )}
                                  {batch.status === 'QUARANTINE' && (
                                     <button 
                                       onClick={() => handleStatusChange(batch.id, 'AVAILABLE')}
                                       className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition"
                                       title="Felszabadítás"
                                     >
                                        <CheckCircle size={16} />
                                     </button>
                                  )}
                                  <button 
                                     className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
                                     title="Átmozgatás / Kiadás"
                                  >
                                     <ArrowUpRight size={16} />
                                  </button>
                                  <button 
                                     onClick={() => handleDelete(batch.id)}
                                     className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                                     title="Selejtezés"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       );
                    })
                  ) : (
                    <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          Nincs megjeleníthető tétel a kiválasztott szűrőkkel.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default FinishedGoodsInventory;