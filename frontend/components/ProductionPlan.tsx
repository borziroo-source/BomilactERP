import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Factory, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  ArrowRight,
  X,
  Save,
  Trash2,
  BarChart3,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- Types ---

export type ProductionStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface ProductionOrder {
  id: string;
  orderNumber: string; // e.g. PO-2023-001
  productName: string;
  sku: string;
  quantity: number;
  uom: string;
  startDate: string; // ISO Date Time
  endDate: string;   // ISO Date Time
  line: string;      // e.g. "Sajt Üzem 1"
  supervisor: string;
  status: ProductionStatus;
  progress: number; // 0-100%
  priority: 'NORMAL' | 'HIGH';
}

// --- Mock Data ---

const INITIAL_ORDERS: ProductionOrder[] = [
  {
    id: 'po-1',
    orderNumber: 'PO-2310-001',
    productName: 'Cașcaval Rucăr',
    sku: 'RUC-NAT-450',
    quantity: 1500,
    uom: 'db',
    startDate: '2023-10-27T06:00:00',
    endDate: '2023-10-27T14:00:00',
    line: 'Sajt Üzem A (Kád 1)',
    supervisor: 'Kovács János',
    status: 'IN_PROGRESS',
    progress: 65,
    priority: 'HIGH'
  },
  {
    id: 'po-2',
    orderNumber: 'PO-2310-002',
    productName: 'Telemea Tehén',
    sku: 'TEL-COW-400',
    quantity: 800,
    uom: 'db',
    startDate: '2023-10-27T08:00:00',
    endDate: '2023-10-27T12:00:00',
    line: 'Sajt Üzem B (Kád 3)',
    supervisor: 'Nagy Éva',
    status: 'IN_PROGRESS',
    progress: 40,
    priority: 'NORMAL'
  },
  {
    id: 'po-3',
    orderNumber: 'PO-2310-003',
    productName: 'Joghurt Natúr 150g',
    sku: 'YOG-NAT-150',
    quantity: 5000,
    uom: 'db',
    startDate: '2023-10-28T06:00:00',
    endDate: '2023-10-28T10:00:00',
    line: 'Joghurt Töltősor',
    supervisor: 'Kovács János',
    status: 'PLANNED',
    progress: 0,
    priority: 'NORMAL'
  },
  {
    id: 'po-4',
    orderNumber: 'PO-2310-004',
    productName: 'Sajt Trapista',
    sku: 'TRAP-500',
    quantity: 600,
    uom: 'db',
    startDate: '2023-10-29T07:00:00',
    endDate: '2023-10-29T15:00:00',
    line: 'Sajt Üzem A (Kád 2)',
    supervisor: 'Varga Péter',
    status: 'DRAFT',
    progress: 0,
    priority: 'NORMAL'
  },
  {
    id: 'po-5',
    orderNumber: 'PO-2310-005',
    productName: 'Tejföl 20%',
    sku: 'SC-20-850',
    quantity: 1200,
    uom: 'db',
    startDate: '2023-10-26T06:00:00',
    endDate: '2023-10-26T11:00:00',
    line: 'Joghurt Töltősor',
    supervisor: 'Nagy Éva',
    status: 'COMPLETED',
    progress: 100,
    priority: 'HIGH'
  }
];

// Production Lines Mock
const PRODUCTION_LINES = [
  'Sajt Üzem A (Kád 1)',
  'Sajt Üzem A (Kád 2)',
  'Sajt Üzem B (Kád 3)',
  'Joghurt Töltősor',
  'Csomagoló Sor 1'
];

const ProductionPlan: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductionStatus | 'ALL'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<ProductionOrder>>({});
  const [isEditing, setIsEditing] = useState(false);

  // --- Calculations ---

  const stats = useMemo(() => {
    const totalPlanned = orders.filter(o => o.status === 'PLANNED').length;
    const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length;
    const completedToday = orders.filter(o => o.status === 'COMPLETED' && o.endDate.startsWith('2023-10-26')).length; // Mock today
    
    // Chart Data: Orders by Line
    const lineData = orders.reduce((acc, curr) => {
       acc[curr.line] = (acc[curr.line] || 0) + 1;
       return acc;
    }, {} as Record<string, number>);
    
    const chartData = Object.keys(lineData).map(key => ({
       name: key.split('(')[0].trim(), // Shorten name
       value: lineData[key]
    }));

    return { totalPlanned, inProgress, completedToday, chartData };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [orders, searchTerm, statusFilter]);

  // --- Helpers ---

  const getStatusBadge = (status: ProductionStatus) => {
    switch (status) {
      case 'DRAFT': return <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">TERVEZET</span>;
      case 'PLANNED': return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">TERVEZETT</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">GYÁRTÁS ALATT</span>;
      case 'COMPLETED': return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">KÉSZ</span>;
      case 'DELAYED': return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">KÉSÉS</span>;
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} óra`;
  };

  // --- Handlers ---

  const handleAddNew = () => {
    setCurrentOrder({
      orderNumber: `PO-${new Date().getFullYear()}${new Date().getMonth()+1}-${Math.floor(Math.random()*1000)}`,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(new Date().getTime() + 4*60*60*1000).toISOString().slice(0, 16), // +4h default
      status: 'DRAFT',
      progress: 0,
      priority: 'NORMAL',
      line: PRODUCTION_LINES[0]
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (order: ProductionOrder) => {
    setCurrentOrder({ ...order });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a gyártási rendelést?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder.productName || !currentOrder.quantity) return;

    const orderToSave = {
      ...currentOrder,
      id: currentOrder.id || `po-${Date.now()}`
    } as ProductionOrder;

    if (isEditing) {
      setOrders(prev => prev.map(o => o.id === orderToSave.id ? orderToSave : o));
    } else {
      setOrders([...orders, orderToSave]);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: ProductionStatus) => {
    setOrders(prev => prev.map(o => {
       if (o.id === id) {
          return {
             ...o,
             status: newStatus,
             progress: newStatus === 'COMPLETED' ? 100 : (newStatus === 'PLANNED' ? 0 : o.progress)
          };
       }
       return o;
    }));
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase">Tervezett (Db)</p>
                 <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.totalPlanned}</h3>
               </div>
               <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Calendar size={20} /></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Várakozó rendelések</p>
         </div>

         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase">Folyamatban</p>
                 <h3 className="text-2xl font-black text-amber-500 mt-1">{stats.inProgress}</h3>
               </div>
               <div className="bg-amber-50 p-2 rounded-lg text-amber-500"><Factory size={20} /></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Aktív gyártósorok</p>
         </div>

         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase">Kész (Ma)</p>
                 <h3 className="text-2xl font-black text-green-600 mt-1">{stats.completedToday}</h3>
               </div>
               <div className="bg-green-50 p-2 rounded-lg text-green-500"><CheckCircle size={20} /></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Teljesített tervek</p>
         </div>

         <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col">
            <p className="text-xs text-slate-400 font-bold uppercase absolute top-2 left-3 z-10">Kapacitás eloszlás</p>
            <div className="flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                   <XAxis dataKey="name" hide />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px'}} />
                   <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#94a3b8'} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>Összes</button>
            <button onClick={() => setStatusFilter('PLANNED')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'PLANNED' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}>Tervezett</button>
            <button onClick={() => setStatusFilter('IN_PROGRESS')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-50 text-slate-600'}`}>Folyamatban</button>
            <button onClick={() => setStatusFilter('COMPLETED')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}>Kész</button>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Keresés..." 
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
              <span className="hidden sm:inline">Új Terv</span>
              <span className="sm:hidden">Új</span>
            </button>
         </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
         {filteredOrders.length > 0 ? (
           filteredOrders.map(order => (
             <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-all flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                
                {/* Status & ID */}
                <div className="lg:w-48 flex flex-col">
                   <div className="flex items-center space-x-2 mb-1">
                      {getStatusBadge(order.status)}
                      {order.priority === 'HIGH' && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex items-center"><AlertCircle size={10} className="mr-1"/> SÜRGŐS</span>}
                   </div>
                   <span className="text-xs text-slate-400 font-mono">{order.orderNumber}</span>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800 text-lg">{order.productName}</h4>
                   <div className="text-sm text-slate-500 flex items-center mt-1">
                      <span className="font-mono bg-slate-50 px-1 rounded mr-2 text-xs">{order.sku}</span>
                      <Factory size={12} className="mr-1" /> {order.line}
                   </div>
                </div>

                {/* Progress Bar (if active) */}
                <div className="w-full lg:w-48">
                   <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Haladás</span>
                      <span className="font-bold text-slate-700">{order.progress}%</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${order.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${order.progress}%` }}
                      ></div>
                   </div>
                   <div className="text-xs text-slate-400 mt-1 flex justify-between">
                      <span>{order.quantity.toLocaleString()} {order.uom}</span>
                      <span>{order.supervisor}</span>
                   </div>
                </div>

                {/* Timeline */}
                <div className="w-full lg:w-40 text-sm border-t lg:border-t-0 lg:border-l border-slate-100 pt-2 lg:pt-0 lg:pl-4">
                   <div className="flex items-center text-slate-700">
                      <Calendar size={14} className="mr-2 text-slate-400" />
                      {new Date(order.startDate).toLocaleDateString()}
                   </div>
                   <div className="flex items-center text-slate-500 mt-1">
                      <Clock size={14} className="mr-2 text-slate-400" />
                      {new Date(order.startDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                      {new Date(order.endDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                   </div>
                   <div className="text-xs text-slate-400 mt-1 pl-6">
                      Időtartam: {calculateDuration(order.startDate, order.endDate)}
                   </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-2 lg:pt-0">
                   {order.status === 'PLANNED' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition" 
                        title="Indítás"
                      >
                         <Play size={18} />
                      </button>
                   )}
                   {order.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition" 
                        title="Lezárás"
                      >
                         <CheckCircle size={18} />
                      </button>
                   )}
                   <button 
                     onClick={() => handleEdit(order)}
                     className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition" 
                     title="Szerkesztés"
                   >
                      <MoreVertical size={18} />
                   </button>
                   <button 
                     onClick={() => handleDelete(order.id)}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                     title="Törlés"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>

             </div>
           ))
         ) : (
           <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-20" />
              <p>Nincs megjeleníthető gyártási terv.</p>
           </div>
         )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                 <h3 className="font-bold flex items-center">
                    <Factory className="mr-2 text-blue-400" />
                    {isEditing ? 'Terv Szerkesztése' : 'Új Gyártási Terv'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rendelés Szám</label>
                    <input 
                      type="text" 
                      value={currentOrder.orderNumber}
                      onChange={(e) => setCurrentOrder({...currentOrder, orderNumber: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-mono text-sm focus:outline-none"
                      readOnly
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Termék</label>
                       <input 
                         type="text" 
                         required
                         placeholder="Pl. Cașcaval Rucăr"
                         value={currentOrder.productName}
                         onChange={(e) => setCurrentOrder({...currentOrder, productName: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                       <input 
                         type="text" 
                         placeholder="Opcionális"
                         value={currentOrder.sku}
                         onChange={(e) => setCurrentOrder({...currentOrder, sku: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Mennyiség</label>
                       <input 
                         type="number" 
                         required
                         value={currentOrder.quantity}
                         onChange={(e) => setCurrentOrder({...currentOrder, quantity: parseFloat(e.target.value)})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Mértékegység</label>
                       <select 
                         value={currentOrder.uom}
                         onChange={(e) => setCurrentOrder({...currentOrder, uom: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                       >
                          <option value="db">db</option>
                          <option value="kg">kg</option>
                          <option value="l">liter</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Kezdés</label>
                       <input 
                         type="datetime-local" 
                         required
                         value={currentOrder.startDate}
                         onChange={(e) => setCurrentOrder({...currentOrder, startDate: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Befejezés</label>
                       <input 
                         type="datetime-local" 
                         required
                         value={currentOrder.endDate}
                         onChange={(e) => setCurrentOrder({...currentOrder, endDate: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Gyártósor</label>
                       <select 
                         value={currentOrder.line}
                         onChange={(e) => setCurrentOrder({...currentOrder, line: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                       >
                          {PRODUCTION_LINES.map(line => (
                             <option key={line} value={line}>{line}</option>
                          ))}
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Felelős</label>
                       <input 
                         type="text" 
                         value={currentOrder.supervisor}
                         onChange={(e) => setCurrentOrder({...currentOrder, supervisor: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="Név"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Prioritás</label>
                       <select 
                         value={currentOrder.priority}
                         onChange={(e) => setCurrentOrder({...currentOrder, priority: e.target.value as any})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                       >
                          <option value="NORMAL">Normál</option>
                          <option value="HIGH">Sürgős (High)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Státusz</label>
                       <select 
                         value={currentOrder.status}
                         onChange={(e) => setCurrentOrder({...currentOrder, status: e.target.value as any})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                       >
                          <option value="DRAFT">Tervezet</option>
                          <option value="PLANNED">Tervezett</option>
                          <option value="IN_PROGRESS">Folyamatban</option>
                          <option value="COMPLETED">Kész</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3">
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

export default ProductionPlan;