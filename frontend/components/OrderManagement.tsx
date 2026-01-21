
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Truck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar, 
  Save, 
  X, 
  Edit2, 
  Trash2,
  TrendingUp,
  Package,
  AlertCircle
} from 'lucide-react';

// --- Types ---

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'SHIPPED' | 'INVOICED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string; // e.g. ORD-2023-1001
  partnerId: string;
  partnerName: string;
  date: string; // ISO Date
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalNet: number;
  totalVat: number;
  totalGross: number;
  currency: string;
}

// --- Mock Data ---

const MOCK_PARTNERS = [
  { id: 'p-001', name: 'Merkúr Supermarket Kft.', address: 'Hargita u. 10.', term: 30 },
  { id: 'p-002', name: 'Sarki Kisbolt', address: 'Kossuth L. 5.', term: 7 },
  { id: 'p-003', name: 'Hotel Transilvania', address: 'Fő tér 1.', term: 15 },
  { id: 'p-004', name: 'Agro-West Disztribúció', address: 'Raktár u. 44.', term: 45 },
];

const MOCK_PRODUCTS = [
  { id: 'f1', sku: 'RUC-SMK-450', name: 'Cașcaval Rucăr Füstölt 450g', price: 18.50 },
  { id: 'f2', sku: 'RUC-NAT-450', name: 'Cașcaval Rucăr Natúr 450g', price: 18.00 },
  { id: 'f3', sku: 'DAL-NAT-450', name: 'Cașcaval Dalia 450g', price: 17.50 },
  { id: 'f4', sku: 'TRAP-500', name: 'Sajt Trapista 500g', price: 22.00 },
  { id: 'f9', sku: 'SC-12-350', name: 'Tejföl 12% 350g', price: 4.20 },
  { id: 'f10', sku: 'SC-20-350', name: 'Tejföl 20% 350g', price: 5.50 },
  { id: 'f16', sku: 'BUT-82-200', name: 'Vaj 82% 200g', price: 12.00 },
];

const INITIAL_ORDERS: SalesOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2310-001',
    partnerId: 'p-001',
    partnerName: 'Merkúr Supermarket Kft.',
    date: '2023-10-26T09:00:00',
    deliveryDate: '2023-10-28',
    status: 'CONFIRMED',
    items: [
      { id: 'i1', productId: 'f2', sku: 'RUC-NAT-450', productName: 'Cașcaval Rucăr Natúr 450g', quantity: 50, unitPrice: 18.00, total: 900 },
      { id: 'i2', productId: 'f9', sku: 'SC-12-350', productName: 'Tejföl 12% 350g', quantity: 200, unitPrice: 4.20, total: 840 },
    ],
    totalNet: 1740,
    totalVat: 156.6,
    totalGross: 1896.6,
    currency: 'RON'
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2310-002',
    partnerId: 'p-002',
    partnerName: 'Sarki Kisbolt',
    date: '2023-10-26T10:30:00',
    deliveryDate: '2023-10-27',
    status: 'SHIPPED',
    items: [
      { id: 'i3', productId: 'f4', sku: 'TRAP-500', productName: 'Sajt Trapista 500g', quantity: 10, unitPrice: 22.00, total: 220 },
    ],
    totalNet: 220,
    totalVat: 19.8,
    totalGross: 239.8,
    currency: 'RON'
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2310-003',
    partnerId: 'p-003',
    partnerName: 'Hotel Transilvania',
    date: '2023-10-27T08:15:00',
    deliveryDate: '2023-10-29',
    status: 'DRAFT',
    items: [
      { id: 'i4', productId: 'f16', sku: 'BUT-82-200', productName: 'Vaj 82% 200g', quantity: 20, unitPrice: 12.00, total: 240 },
    ],
    totalNet: 240,
    totalVat: 21.6,
    totalGross: 261.6,
    currency: 'RON'
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2310-004',
    partnerId: 'p-001',
    partnerName: 'Merkúr Supermarket Kft.',
    date: '2023-10-25T14:00:00',
    deliveryDate: '2023-10-26',
    status: 'INVOICED',
    items: [
      { id: 'i5', productId: 'f3', sku: 'DAL-NAT-450', productName: 'Cașcaval Dalia 450g', quantity: 100, unitPrice: 17.50, total: 1750 },
    ],
    totalNet: 1750,
    totalVat: 157.5,
    totalGross: 1907.5,
    currency: 'RON'
  }
];

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<SalesOrder>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor temporary item state
  const [newItemProductId, setNewItemProductId] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  // --- Calculations ---

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const active = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'DRAFT').length;
    const todayRevenue = orders
      .filter(o => o.date.startsWith(new Date().toISOString().slice(0, 10)))
      .reduce((acc, o) => acc + o.totalNet, 0);
    const toShip = orders.filter(o => o.status === 'CONFIRMED').length;

    return { active, todayRevenue, toShip };
  }, [orders]);

  // --- Helpers ---

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DRAFT': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">TERVEZET</span>;
      case 'CONFIRMED': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">MEGRENDELVE</span>;
      case 'SHIPPED': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">KISZÁLLÍTVA</span>;
      case 'INVOICED': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">SZÁMLÁZVA</span>;
      case 'CANCELLED': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">TÖRÖLVE</span>;
    }
  };

  const calculateTotals = (items: OrderItem[]) => {
    const totalNet = items.reduce((acc, item) => acc + item.total, 0);
    const totalVat = totalNet * 0.09; // 9% food VAT
    const totalGross = totalNet + totalVat;
    return { totalNet, totalVat, totalGross };
  };

  // --- Handlers ---

  const handleAddNew = () => {
    setCurrentOrder({
      orderNumber: `ORD-${new Date().getFullYear()}${new Date().getMonth()+1}-${Math.floor(Math.random()*10000)}`,
      date: new Date().toISOString().slice(0, 16),
      deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // +1 day
      status: 'DRAFT',
      items: [],
      totalNet: 0,
      totalVat: 0,
      totalGross: 0,
      currency: 'RON'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (order: SalesOrder) => {
    setCurrentOrder(JSON.parse(JSON.stringify(order))); // Deep copy
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentOrder.partnerId || !currentOrder.items) return;

    const totals = calculateTotals(currentOrder.items);
    const orderToSave: SalesOrder = {
      ...currentOrder as SalesOrder,
      id: currentOrder.id || `ord-${Date.now()}`,
      ...totals
    };

    if (isEditing) {
      setOrders(prev => prev.map(o => o.id === orderToSave.id ? orderToSave : o));
    } else {
      setOrders([orderToSave, ...orders]);
    }
    setIsModalOpen(false);
  };

  const handleAddItem = () => {
    if (!newItemProductId || newItemQty <= 0) return;
    const product = MOCK_PRODUCTS.find(p => p.id === newItemProductId);
    if (!product) return;

    const newItem: OrderItem = {
      id: `oi-${Date.now()}`,
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      quantity: newItemQty,
      unitPrice: product.price,
      total: newItemQty * product.price
    };

    const updatedItems = [...(currentOrder.items || []), newItem];
    const totals = calculateTotals(updatedItems);

    setCurrentOrder({ 
      ...currentOrder, 
      items: updatedItems,
      ...totals
    });
    
    setNewItemProductId('');
    setNewItemQty(1);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = (currentOrder.items || []).filter(i => i.id !== itemId);
    const totals = calculateTotals(updatedItems);
    setCurrentOrder({ ...currentOrder, items: updatedItems, ...totals });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd a rendelést?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Aktív Rendelések</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.active}</h3>
             <p className="text-xs text-slate-400 mt-1">Nem lezárt tételek</p>
           </div>
           <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
             <ShoppingCart size={24} />
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Napi Bevétel (RON)</p>
             <h3 className="text-2xl font-black text-green-600 mt-1">{stats.todayRevenue.toLocaleString()}</h3>
             <p className="text-xs text-slate-400 mt-1">Mai dátumú rendelések</p>
           </div>
           <div className="bg-green-50 text-green-600 p-3 rounded-xl">
             <TrendingUp size={24} />
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Kiszállításra Vár</p>
             <h3 className="text-2xl font-black text-purple-600 mt-1">{stats.toShip}</h3>
             <p className="text-xs text-slate-400 mt-1">Jóváhagyott rendelések</p>
           </div>
           <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
             <Truck size={24} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>Összes</button>
            <button onClick={() => setStatusFilter('DRAFT')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'DRAFT' ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-50 text-slate-600'}`}>Tervezet</button>
            <button onClick={() => setStatusFilter('CONFIRMED')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}>Feldolgozás</button>
            <button onClick={() => setStatusFilter('SHIPPED')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-50 text-slate-600'}`}>Szállítás</button>
            <button onClick={() => setStatusFilter('INVOICED')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${statusFilter === 'INVOICED' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}>Számlázva</button>
         </div>

         <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Partner, Rendelés szám..." 
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
              <span className="hidden sm:inline">Új Rendelés</span>
              <span className="sm:hidden">Új</span>
            </button>
         </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                     <th className="px-6 py-4">Rendelés # / Dátum</th>
                     <th className="px-6 py-4">Partner</th>
                     <th className="px-6 py-4">Státusz / Szállítás</th>
                     <th className="px-6 py-4 text-center">Tételek</th>
                     <th className="px-6 py-4 text-right">Érték (Nettó)</th>
                     <th className="px-6 py-4 text-right">Műveletek</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                         <td className="px-6 py-4">
                            <div className="font-mono font-bold text-slate-700">{order.orderNumber}</div>
                            <div className="text-xs text-slate-500 flex items-center mt-1">
                               <Calendar size={12} className="mr-1" />
                               {new Date(order.date).toLocaleDateString()}
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{order.partnerName}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="mb-1">{getStatusBadge(order.status)}</div>
                            <div className="text-xs text-slate-500 flex items-center">
                               <Truck size={12} className="mr-1" /> {new Date(order.deliveryDate).toLocaleDateString()}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                               {order.items.length} db
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right font-bold text-slate-700">
                            {order.totalNet.toLocaleString()} RON
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                               <button onClick={() => handleEdit(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Edit2 size={16}/></button>
                               <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          Nincs megjeleníthető rendelés.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
               {/* Modal Header */}
               <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
                  <h3 className="font-bold flex items-center text-lg">
                     <ShoppingCart className="mr-3 text-blue-400" />
                     {isEditing ? `Rendelés Szerkesztése: ${currentOrder.orderNumber}` : 'Új Rendelés'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={20}/></button>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-6">
                  
                  {/* Top Form Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                     <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="block text-sm font-bold text-slate-700 mb-1">Partner</label>
                           <select 
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                              value={currentOrder.partnerId}
                              onChange={(e) => {
                                 const partner = MOCK_PARTNERS.find(p => p.id === e.target.value);
                                 setCurrentOrder({...currentOrder, partnerId: e.target.value, partnerName: partner?.name});
                              }}
                           >
                              <option value="">Válassz partnert...</option>
                              {MOCK_PARTNERS.map(p => (
                                 <option key={p.id} value={p.id}>{p.name} ({p.address})</option>
                              ))}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Rendelés Dátuma</label>
                           <input 
                              type="datetime-local" 
                              value={currentOrder.date}
                              onChange={(e) => setCurrentOrder({...currentOrder, date: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Kiszállítás Dátuma</label>
                           <input 
                              type="date" 
                              value={currentOrder.deliveryDate}
                              onChange={(e) => setCurrentOrder({...currentOrder, deliveryDate: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Státusz</label>
                        <select 
                           className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                           value={currentOrder.status}
                           onChange={(e) => setCurrentOrder({...currentOrder, status: e.target.value as OrderStatus})}
                        >
                           <option value="DRAFT">Tervezet</option>
                           <option value="CONFIRMED">Véglegesítve</option>
                           <option value="SHIPPED">Kiszállítva</option>
                           <option value="INVOICED">Számlázva</option>
                           <option value="CANCELLED">Törölve</option>
                        </select>
                        <div className="text-xs text-slate-500 flex items-start">
                           <AlertCircle size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                           Csak a véglegesített rendelések kerülnek a gyártási tervbe.
                        </div>
                     </div>
                  </div>

                  {/* Line Items Section */}
                  <div className="border-t border-slate-200 pt-4">
                     <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase flex items-center">
                        <Package size={16} className="mr-2" /> Tételek
                     </h4>
                     
                     {/* Add Item Bar */}
                     <div className="flex flex-col md:flex-row gap-2 mb-4 bg-slate-100 p-2 rounded-lg">
                        <select 
                           className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                           value={newItemProductId}
                           onChange={(e) => setNewItemProductId(e.target.value)}
                        >
                           <option value="">Termék kiválasztása...</option>
                           {MOCK_PRODUCTS.map(p => (
                              <option key={p.id} value={p.id}>{p.name} - {p.price} RON</option>
                           ))}
                        </select>
                        <input 
                           type="number" 
                           min="1"
                           className="w-24 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                           placeholder="Db"
                           value={newItemQty}
                           onChange={(e) => setNewItemQty(parseInt(e.target.value))}
                        />
                        <button 
                           onClick={handleAddItem}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold transition"
                        >
                           Hozzáad
                        </button>
                     </div>

                     {/* Items Table */}
                     <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-sm">
                           <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                              <tr>
                                 <th className="px-4 py-3 text-left">Termék</th>
                                 <th className="px-4 py-3 text-right">Mennyiség</th>
                                 <th className="px-4 py-3 text-right">Egységár</th>
                                 <th className="px-4 py-3 text-right">Összesen</th>
                                 <th className="px-4 py-3 w-10"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {currentOrder.items && currentOrder.items.length > 0 ? (
                                 currentOrder.items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                       <td className="px-4 py-2">
                                          <div className="font-medium text-slate-800">{item.productName}</div>
                                          <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                                       </td>
                                       <td className="px-4 py-2 text-right font-bold text-slate-700">{item.quantity}</td>
                                       <td className="px-4 py-2 text-right text-slate-600">{item.unitPrice.toFixed(2)}</td>
                                       <td className="px-4 py-2 text-right font-bold text-blue-600">{item.total.toFixed(2)}</td>
                                       <td className="px-4 py-2 text-right">
                                          <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 transition">
                                             <X size={16} />
                                          </button>
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Nincs tétel hozzáadva.</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>

                     {/* Totals */}
                     <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                           <div className="flex justify-between text-sm text-slate-600">
                              <span>Nettó Összesen:</span>
                              <span className="font-bold">{currentOrder.totalNet?.toFixed(2)} RON</span>
                           </div>
                           <div className="flex justify-between text-sm text-slate-600">
                              <span>ÁFA (9%):</span>
                              <span className="font-bold">{currentOrder.totalVat?.toFixed(2)} RON</span>
                           </div>
                           <div className="flex justify-between text-lg text-slate-800 border-t border-slate-300 pt-2 font-black">
                              <span>Bruttó Végösszeg:</span>
                              <span>{currentOrder.totalGross?.toFixed(2)} RON</span>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>

               {/* Modal Footer */}
               <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end space-x-3 shrink-0">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-bold transition">
                     Mégse
                  </button>
                  <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition flex items-center">
                     <Save size={18} className="mr-2" />
                     Rendelés Mentése
                  </button>
               </div>

            </div>
         </div>
      )}

    </div>
  );
};

export default OrderManagement;
