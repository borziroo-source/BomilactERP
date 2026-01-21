
import React, { useState } from 'react';
import { 
  Map, 
  Truck, 
  User, 
  Clock, 
  Navigation, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Settings,
  X,
  Save,
  PackagePlus
} from 'lucide-react';

// --- Types ---

interface RouteStop {
  id: string;
  sequence: number;
  supplierName: string;
  address: string;
  estimatedVolume: number;
  status: 'PENDING' | 'COLLECTED' | 'SKIPPED';
  arrivalTime?: string;
}

interface LogisticsRoute {
  id: string;
  name: string; // e.g. "Csíki-medence Körút"
  date: string;
  vehiclePlate: string;
  driverName: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  vehicleCapacity: number;
  stops: RouteStop[];
}

// --- Mock Data ---

const MOCK_ROUTES: LogisticsRoute[] = [
  {
    id: 'rt-101',
    name: 'Felső-Csík Körút',
    date: '2023-10-27',
    vehiclePlate: 'HR-10-BOM',
    driverName: 'Tóth Gábor',
    vehicleCapacity: 8000,
    status: 'IN_PROGRESS',
    stops: [
      { id: 's1', sequence: 1, supplierName: 'Agro Lacto Coop', address: 'Gyergyószentmiklós, Mező u. 5.', estimatedVolume: 2500, status: 'COLLECTED', arrivalTime: '07:30' },
      { id: 's2', sequence: 2, supplierName: 'Csarnok - Domokos', address: 'Csíkszentdomokos, Alvég 44.', estimatedVolume: 3200, status: 'PENDING' },
      { id: 's3', sequence: 3, supplierName: 'Kovács István E.V.', address: 'Csíkszereda, Fő út 12.', estimatedVolume: 800, status: 'PENDING' },
    ]
  },
  {
    id: 'rt-102',
    name: 'Alcsík Begyűjtés',
    date: '2023-10-27',
    vehiclePlate: 'HR-99-TEJ',
    driverName: 'Kiss Zoltán',
    vehicleCapacity: 12000,
    status: 'PLANNED',
    stops: [
      { id: 's4', sequence: 1, supplierName: 'Szabó János', address: 'Csíkszentsimon, Felszeg 10.', estimatedVolume: 500, status: 'PENDING' },
      { id: 's5', sequence: 2, supplierName: 'Tusnád Farm Kft.', address: 'Tusnádfürdő, Állomás köz 2.', estimatedVolume: 4000, status: 'PENDING' },
    ]
  }
];

const RoutePlanner: React.FC = () => {
  const [routes, setRoutes] = useState<LogisticsRoute[]>(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(MOCK_ROUTES[0].id);
  
  // New Route Modal State
  const [isNewRouteModalOpen, setIsNewRouteModalOpen] = useState(false);
  const [newRouteData, setNewRouteData] = useState<Partial<LogisticsRoute>>({
    name: '',
    vehiclePlate: '',
    driverName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PLANNED',
    vehicleCapacity: 8000
  });

  // Add Stop Modal State
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [newStopData, setNewStopData] = useState({
    supplierName: '',
    address: '',
    estimatedVolume: 0
  });

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  // --- Calculations ---
  const calculateTotalVolume = (route: LogisticsRoute) => {
    return route.stops.reduce((acc, stop) => acc + stop.estimatedVolume, 0);
  };

  const getCapacityPercentage = (route: LogisticsRoute) => {
    const total = calculateTotalVolume(route);
    return Math.min(100, (total / route.vehicleCapacity) * 100);
  };

  // --- Handlers ---
  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: LogisticsRoute = {
      id: `rt-${Math.random().toString(36).substr(2, 5)}`,
      name: newRouteData.name || 'Új Útvonal',
      date: newRouteData.date || '',
      vehiclePlate: newRouteData.vehiclePlate || 'HR-??-???',
      driverName: newRouteData.driverName || 'Nincs kijelölve',
      vehicleCapacity: newRouteData.vehicleCapacity || 8000,
      status: 'PLANNED',
      stops: []
    };
    setRoutes([...routes, newRoute]);
    setSelectedRouteId(newRoute.id);
    setIsNewRouteModalOpen(false);
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    if (!newStopData.supplierName) return;

    const newStop: RouteStop = {
      id: `s-${Date.now()}`,
      sequence: selectedRoute.stops.length + 1,
      supplierName: newStopData.supplierName,
      address: newStopData.address,
      estimatedVolume: newStopData.estimatedVolume,
      status: 'PENDING'
    };

    const updatedRoutes = routes.map(r => {
      if (r.id === selectedRouteId) {
        return { ...r, stops: [...r.stops, newStop] };
      }
      return r;
    });

    setRoutes(updatedRoutes);
    setIsAddStopModalOpen(false);
    setNewStopData({ supplierName: '', address: '', estimatedVolume: 0 });
  };

  const handleOptimize = () => {
    alert("AI Optimalizálás: Az útvonalat újraszámoltuk a legrövidebb út és a FEFO elvek alapján.");
  };

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-140px)] animate-fade-in space-y-4">
      
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Útvonal Tervező</h2>
          <p className="text-sm text-slate-500">Napi begyűjtési körök kezelése és optimalizálása</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="date" className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="2023-10-27" />
           </div>
           <button 
             onClick={() => setIsNewRouteModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg shadow-blue-600/20"
           >
             <Plus size={18} className="mr-2" />
             Új Útvonal
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* Left Panel: Route List */}
        {/* On mobile: natural height. On desktop: scrollable */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-4 lg:overflow-y-auto pr-0 lg:pr-2">
          {routes.map(route => {
            const totalVol = calculateTotalVolume(route);
            const capPercent = getCapacityPercentage(route);
            const isSelected = route.id === selectedRouteId;

            return (
              <div 
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white border-blue-500 shadow-md' 
                    : 'bg-white border-slate-100 hover:border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{route.name}</h3>
                  {route.status === 'IN_PROGRESS' && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">ÚTON</span>}
                  {route.status === 'PLANNED' && <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">TERVEZETT</span>}
                  {route.status === 'COMPLETED' && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">KÉSZ</span>}
                </div>
                
                <div className="flex items-center text-sm text-slate-500 mb-3 space-x-3">
                   <span className="flex items-center"><Truck size={12} className="mr-1"/> {route.vehiclePlate}</span>
                   <span className="flex items-center"><User size={12} className="mr-1"/> {route.driverName}</span>
                </div>

                <div className="space-y-1">
                   <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Telítettség ({totalVol}L)</span>
                      <span>{capPercent.toFixed(0)}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${capPercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                        style={{ width: `${capPercent}%` }}
                      ></div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel: Map & Details */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[500px]">
          {selectedRoute ? (
            <>
              {/* Route Detail Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                   <h3 className="text-xl font-bold text-slate-800 flex items-center">
                     {selectedRoute.name}
                     <span className="ml-3 text-sm font-normal text-slate-500 border-l border-slate-300 pl-3 flex items-center">
                       <Truck size={14} className="mr-1" /> {selectedRoute.vehiclePlate}
                     </span>
                   </h3>
                   <p className="text-sm text-slate-500 mt-1 flex items-center">
                     <Clock size={14} className="mr-1" /> Indulás: 06:00 &bull; Várható érkezés: 14:30
                   </p>
                 </div>
                 <div className="flex space-x-2 w-full md:w-auto">
                    <button 
                      onClick={handleOptimize}
                      className="flex-1 md:flex-none justify-center px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium flex items-center transition whitespace-nowrap"
                    >
                      <Settings size={16} className="mr-2" />
                      Optimalizál
                    </button>
                    <button className="flex-1 md:flex-none justify-center px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center transition">
                      <Map size={16} className="mr-2" />
                      Térkép
                    </button>
                 </div>
              </div>

              {/* Timeline / Stops */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                 <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                    <div className="space-y-6">
                       {selectedRoute.stops.map((stop, idx) => (
                         <div key={stop.id} className="relative flex items-start group">
                            {/* Node */}
                            <div className={`
                              relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm bg-white
                              ${stop.status === 'COLLECTED' ? 'border-green-500 text-green-700' : 'border-blue-500 text-blue-700'}
                            `}>
                              {idx + 1}
                            </div>

                            {/* Content Card */}
                            <div className="ml-4 flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                               <div className="flex justify-between items-start">
                                  <div>
                                     <h4 className="font-bold text-slate-800 text-lg">{stop.supplierName}</h4>
                                     <p className="text-sm text-slate-500 flex items-center mt-1">
                                       <MapPin size={14} className="mr-1 text-slate-400" />
                                       {stop.address}
                                     </p>
                                  </div>
                                  <div className="text-right">
                                     <div className="font-bold text-slate-700 text-lg">{stop.estimatedVolume} L</div>
                                     <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                                        stop.status === 'COLLECTED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                     }`}>
                                       {stop.status === 'COLLECTED' ? 'Begyűjtve' : 'Várakozik'}
                                     </span>
                                  </div>
                               </div>
                               
                               {stop.arrivalTime && (
                                 <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center">
                                   <Clock size={12} className="mr-1" /> Érkezett: {stop.arrivalTime}
                                 </div>
                               )}
                            </div>
                         </div>
                       ))}
                       
                       {/* Add Stop Placeholder */}
                       <div className="relative flex items-center">
                          <div className="relative z-10 w-12 h-12 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                            <Plus size={20} />
                          </div>
                          <button 
                            onClick={() => setIsAddStopModalOpen(true)}
                            className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            + Megálló hozzáadása
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Footer Summary */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex space-x-6 text-sm w-full sm:w-auto justify-between sm:justify-start">
                    <div>
                      <span className="block text-slate-500 text-xs uppercase">Össz Távolság</span>
                      <span className="font-bold text-slate-800">142 km</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs uppercase">Össz Súly</span>
                      <span className="font-bold text-slate-800">{calculateTotalVolume(selectedRoute)} L</span>
                    </div>
                 </div>
                 <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center shadow-lg shadow-green-600/20 transition">
                    <Navigation size={18} className="mr-2" />
                    Útvonal Indítása
                 </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
               <Map size={64} className="mb-4 text-slate-200" />
               <p>Válassz egy útvonalat a listából vagy hozz létre egy újat.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Route Modal */}
      {isNewRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
             <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center">
                 <Navigation className="mr-2 text-blue-400" />
                 Új Útvonal Tervezése
               </h3>
               <button onClick={() => setIsNewRouteModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
             </div>
             
             <form onSubmit={handleCreateRoute} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Útvonal Neve</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Pl: Gyergyó-szék körút"
                    value={newRouteData.name}
                    onChange={e => setNewRouteData({...newRouteData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Dátum</label>
                     <input 
                       type="date" 
                       required
                       className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                       value={newRouteData.date}
                       onChange={e => setNewRouteData({...newRouteData, date: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Kapacitás (L)</label>
                     <input 
                       type="number" 
                       className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                       value={newRouteData.vehicleCapacity}
                       onChange={e => setNewRouteData({...newRouteData, vehicleCapacity: parseInt(e.target.value)})}
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Jármű Rendszám</label>
                   <select 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={newRouteData.vehiclePlate}
                      onChange={e => setNewRouteData({...newRouteData, vehiclePlate: e.target.value})}
                   >
                      <option value="">Válassz járművet...</option>
                      <option value="HR-10-BOM">HR-10-BOM (Tartályos - 8000L)</option>
                      <option value="HR-99-TEJ">HR-99-TEJ (Hűtős - 12000L)</option>
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Sofőr</label>
                   <input 
                     type="text" 
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Sofőr neve"
                     value={newRouteData.driverName}
                     onChange={e => setNewRouteData({...newRouteData, driverName: e.target.value})}
                   />
                </div>

                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition">
                   <Save size={18} className="mr-2" />
                   Terv Létrehozása
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {isAddStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center">
                 <PackagePlus className="mr-2 text-blue-400" />
                 Új Megálló Hozzáadása
               </h3>
               <button onClick={() => setIsAddStopModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
             </div>
             
             <form onSubmit={handleAddStop} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Partner Neve</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Pl: Kiss János"
                    value={newStopData.supplierName}
                    onChange={e => setNewStopData({...newStopData, supplierName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cím</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Település, Utca"
                    value={newStopData.address}
                    onChange={e => setNewStopData({...newStopData, address: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Becsült Mennyiség (L)</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={newStopData.estimatedVolume}
                    onChange={e => setNewStopData({...newStopData, estimatedVolume: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddStopModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
                  >
                    Mégse
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center transition">
                     Hozzáadás
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoutePlanner;
