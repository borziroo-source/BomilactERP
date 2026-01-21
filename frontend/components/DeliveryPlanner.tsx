
import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Package, 
  Plus, 
  ArrowRight, 
  X, 
  MoreVertical, 
  CheckCircle, 
  Search, 
  FileText, 
  Printer,
  Navigation,
  User,
  Scale
} from 'lucide-react';

// --- Types ---

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  partnerName: string;
  city: string;
  address: string;
  weightKg: number; // For capacity calculation
  deliveryDate: string;
  status: 'PENDING' | 'ASSIGNED' | 'DELIVERED';
}

interface DeliveryStop {
  id: string;
  sequence: number;
  order: DeliveryOrder;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface DeliveryRoute {
  id: string;
  name: string;
  date: string;
  vehiclePlate: string;
  driverName: string;
  maxCapacityKg: number;
  currentLoadKg: number;
  status: 'PLANNING' | 'READY' | 'IN_TRANSIT' | 'COMPLETED';
  stops: DeliveryStop[];
}

// --- Mock Data ---

const PENDING_ORDERS: DeliveryOrder[] = [
  { id: 'o1', orderNumber: 'ORD-2310-001', partnerName: 'Merkúr Supermarket', city: 'Csíkszereda', address: 'Hargita u. 10.', weightKg: 450, deliveryDate: '2023-10-27', status: 'PENDING' },
  { id: 'o2', orderNumber: 'ORD-2310-002', partnerName: 'Sarki Kisbolt', city: 'Székelyudvarhely', address: 'Kossuth L. 5.', weightKg: 85, deliveryDate: '2023-10-27', status: 'PENDING' },
  { id: 'o3', orderNumber: 'ORD-2310-005', partnerName: 'Hotel Transilvania', city: 'Gyergyószentmiklós', address: 'Fő tér 1.', weightKg: 120, deliveryDate: '2023-10-27', status: 'PENDING' },
  { id: 'o4', orderNumber: 'ORD-2310-008', partnerName: 'Harmopan Pékség', city: 'Csíkszereda', address: 'Testvériség 22.', weightKg: 200, deliveryDate: '2023-10-27', status: 'PENDING' },
  { id: 'o5', orderNumber: 'ORD-2310-010', partnerName: 'Gastro Pan Kft.', city: 'Székelykeresztúr', address: 'Ipari park 4.', weightKg: 1200, deliveryDate: '2023-10-28', status: 'PENDING' }, // Future date
];

const INITIAL_ROUTES: DeliveryRoute[] = [
  {
    id: 'r-101',
    name: 'Csíki-medence Körút',
    date: '2023-10-27',
    vehiclePlate: 'HR-99-TEJ',
    driverName: 'Kiss Zoltán',
    maxCapacityKg: 3500,
    currentLoadKg: 0,
    status: 'PLANNING',
    stops: []
  },
  {
    id: 'r-102',
    name: 'Udvarhelyi Futár',
    date: '2023-10-27',
    vehiclePlate: 'HR-05-BOM',
    driverName: 'Tóth Gábor',
    maxCapacityKg: 800, // Small van
    currentLoadKg: 0,
    status: 'PLANNING',
    stops: []
  }
];

const DeliveryPlanner: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('2023-10-27');
  const [pendingOrders, setPendingOrders] = useState<DeliveryOrder[]>(PENDING_ORDERS);
  const [routes, setRoutes] = useState<DeliveryRoute[]>(INITIAL_ROUTES);
  const [activeRouteId, setActiveRouteId] = useState<string>(INITIAL_ROUTES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  // New Route Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRouteData, setNewRouteData] = useState({ name: '', plate: '', driver: '', capacity: 3500 });

  // --- Derived State ---
  const activeRoute = routes.find(r => r.id === activeRouteId);
  
  const filteredPending = pendingOrders.filter(o => 
    o.deliveryDate === dateFilter && 
    o.status === 'PENDING' &&
    (o.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Handlers ---

  const handleAssignOrder = (order: DeliveryOrder) => {
    if (!activeRoute) return;
    if (activeRoute.currentLoadKg + order.weightKg > activeRoute.maxCapacityKg) {
      alert("Hiba: A jármű kapacitása nem elegendő ehhez a rendeléshez!");
      return;
    }

    // Move from Pending to Route
    setPendingOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'ASSIGNED' } : o));
    
    setRoutes(prev => prev.map(r => {
      if (r.id === activeRouteId) {
        const newStop: DeliveryStop = {
          id: `stop-${Date.now()}`,
          sequence: r.stops.length + 1,
          order: { ...order, status: 'ASSIGNED' },
          status: 'PENDING'
        };
        return {
          ...r,
          stops: [...r.stops, newStop],
          currentLoadKg: r.currentLoadKg + order.weightKg
        };
      }
      return r;
    }));
  };

  const handleRemoveStop = (stopId: string, orderId: string, weight: number) => {
    // Move back to Pending
    setPendingOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PENDING' } : o));

    setRoutes(prev => prev.map(r => {
      if (r.id === activeRouteId) {
        return {
          ...r,
          stops: r.stops.filter(s => s.id !== stopId),
          currentLoadKg: r.currentLoadKg - weight
        };
      }
      return r;
    }));
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: DeliveryRoute = {
      id: `r-${Date.now()}`,
      name: newRouteData.name,
      date: dateFilter,
      vehiclePlate: newRouteData.plate,
      driverName: newRouteData.driver,
      maxCapacityKg: newRouteData.capacity,
      currentLoadKg: 0,
      status: 'PLANNING',
      stops: []
    };
    setRoutes([...routes, newRoute]);
    setActiveRouteId(newRoute.id);
    setIsModalOpen(false);
  };

  const getCapacityColor = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent > 90) return 'bg-red-500';
    if (percent > 75) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const getStatusBadge = (status: DeliveryRoute['status']) => {
    switch (status) {
      case 'PLANNING': return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase border border-slate-200">Tervezés</span>;
      case 'READY': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase border border-blue-200">Indításra Kész</span>;
      case 'IN_TRANSIT': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase border border-amber-200 animate-pulse">Úton</span>;
      case 'COMPLETED': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase border border-green-200">Teljesítve</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Kiszállítási Tervező</h2>
          <p className="text-sm text-slate-500">Rendelések járatba szervezése és fuvarlevél készítés</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            Új Járat Indítása
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: Pending Orders */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
           <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                 <Package size={18} className="mr-2 text-slate-500" />
                 Várakozó Rendelések
                 <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{filteredPending.length}</span>
              </h3>
              <div className="mt-3 relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Partner vagy Város..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
              {filteredPending.length > 0 ? (
                filteredPending.map(order => (
                  <div key={order.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition group">
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="font-bold text-slate-800">{order.partnerName}</div>
                           <div className="text-xs text-slate-500 flex items-center mt-1">
                              <MapPin size={10} className="mr-1" /> {order.city}, {order.address}
                           </div>
                        </div>
                        <button 
                          onClick={() => handleAssignOrder(order)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition"
                          title="Hozzáadás a kiválasztott járathoz"
                        >
                           <ArrowRight size={16} />
                        </button>
                     </div>
                     <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                        <span className="text-xs font-mono text-slate-400">{order.orderNumber}</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center">
                           <Scale size={10} className="mr-1" /> {order.weightKg} kg
                        </span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                   Nincs megjeleníthető rendelés a kiválasztott napra.
                </div>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: Routes Management */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
           
           {/* Route Selector Tabs */}
           <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
              {routes.map(route => (
                 <button
                   key={route.id}
                   onClick={() => setActiveRouteId(route.id)}
                   className={`
                     min-w-[200px] p-3 rounded-xl border-2 text-left transition-all
                     ${activeRouteId === route.id ? 'bg-white border-blue-500 shadow-md' : 'bg-white border-slate-100 hover:border-blue-200 text-slate-500'}
                   `}
                 >
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-sm truncate pr-2">{route.name}</span>
                       <Truck size={14} />
                    </div>
                    <div className="flex justify-between text-xs">
                       <span>{route.vehiclePlate}</span>
                       <span className={route.currentLoadKg > route.maxCapacityKg ? 'text-red-500 font-bold' : ''}>
                          {Math.round((route.currentLoadKg / route.maxCapacityKg) * 100)}%
                       </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                       <div className={`h-full ${getCapacityColor(route.currentLoadKg, route.maxCapacityKg)}`} style={{width: `${Math.min(100, (route.currentLoadKg / route.maxCapacityKg) * 100)}%`}}></div>
                    </div>
                 </button>
              ))}
           </div>

           {/* Active Route Details */}
           {activeRoute ? (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-xl font-bold text-slate-800">{activeRoute.name}</h3>
                         {getStatusBadge(activeRoute.status)}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                         <span className="flex items-center"><User size={14} className="mr-1" /> {activeRoute.driverName}</span>
                         <span className="flex items-center"><Truck size={14} className="mr-1" /> {activeRoute.vehiclePlate}</span>
                         <span className="flex items-center"><Calendar size={14} className="mr-1" /> {activeRoute.date}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                         <div className="text-xs text-slate-500 font-bold uppercase">Terhelés</div>
                         <div className="text-lg font-black text-slate-800">
                            {activeRoute.currentLoadKg} <span className="text-sm text-slate-400 font-normal">/ {activeRoute.maxCapacityKg} kg</span>
                         </div>
                      </div>
                      <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition" title="Nyomtatás">
                         <Printer size={18} />
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center transition shadow-lg shadow-green-600/20">
                         <Navigation size={16} className="mr-2" /> Indítás
                      </button>
                   </div>
                </div>

                {/* Stops List */}
                <div className="flex-1 overflow-y-auto p-0">
                   {activeRoute.stops.length > 0 ? (
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-100">
                           <tr>
                              <th className="px-6 py-3 w-16 text-center">#</th>
                              <th className="px-6 py-3">Partner / Cím</th>
                              <th className="px-6 py-3">Rendelés Info</th>
                              <th className="px-6 py-3 text-right">Súly</th>
                              <th className="px-6 py-3 text-right">Művelet</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {activeRoute.stops.map((stop, index) => (
                              <tr key={stop.id} className="hover:bg-slate-50 transition group">
                                 <td className="px-6 py-4 text-center font-bold text-slate-400">
                                    {index + 1}
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{stop.order.partnerName}</div>
                                    <div className="text-xs text-slate-500 flex items-center mt-1">
                                       <MapPin size={12} className="mr-1" /> {stop.order.city}, {stop.order.address}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs">
                                       {stop.order.orderNumber}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right font-medium text-slate-700">
                                    {stop.order.weightKg} kg
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={() => handleRemoveStop(stop.id, stop.order.id, stop.order.weightKg)}
                                      className="text-slate-300 hover:text-red-500 transition p-1"
                                    >
                                       <X size={18} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Truck size={48} className="mb-4 opacity-20" />
                        <p>A járat üres. Válassz rendeléseket a bal oldali listából.</p>
                     </div>
                   )}
                </div>

                {/* Footer Bar */}
                <div className="bg-slate-50 border-t border-slate-200 p-3 text-xs text-center text-slate-500">
                   Drag & Drop funkció hamarosan elérhető a sorrend módosításához.
                </div>

             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                Válassz vagy hozz létre egy járatot.
             </div>
           )}

        </div>
      </div>

      {/* New Route Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
               <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center">
                     <Truck className="mr-2 text-blue-400" />
                     Új Járat Tervezése
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
               </div>
               <form onSubmit={handleCreateRoute} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Járat Neve</label>
                     <input 
                        type="text" 
                        required
                        placeholder="Pl. Szeredai Körút"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newRouteData.name}
                        onChange={e => setNewRouteData({...newRouteData, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Jármű Rendszám</label>
                     <select 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newRouteData.plate}
                        onChange={e => {
                           const cap = e.target.value === 'HR-05-BOM' ? 800 : 3500; // Mock logic
                           setNewRouteData({...newRouteData, plate: e.target.value, capacity: cap})
                        }}
                     >
                        <option value="">Válassz járművet...</option>
                        <option value="HR-99-TEJ">HR-99-TEJ (Hűtős - 3.5t)</option>
                        <option value="HR-05-BOM">HR-05-BOM (Caddy - 800kg)</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Sofőr</label>
                     <input 
                        type="text" 
                        placeholder="Név"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newRouteData.driver}
                        onChange={e => setNewRouteData({...newRouteData, driver: e.target.value})}
                     />
                  </div>
                  <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-lg transition">
                     Létrehozás
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
};

export default DeliveryPlanner;
