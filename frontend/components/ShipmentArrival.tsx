
import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  ClipboardList, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Search,
  Droplet,
  Beaker,
  Thermometer,
  Save,
  X,
  Plus,
  FileText,
  UserPlus,
  User,
  FlaskConical,
  TestTubeDiagonal,
  Calendar
} from 'lucide-react';
import { Shipment, ShipmentStatus, DeliveryNote, Supplier } from '../types';

// Kibővített Beszállítói lista a kereséshez
const ALL_SUPPLIERS: Partial<Supplier>[] = [
  { id: 's1', name: 'Agro Lacto Coop', cui: 'RO123456' },
  { id: 's2', name: 'Csarnok - Domokos', cui: 'RO888777' },
  { id: 's3', name: 'Kovács István E.V.', cui: 'RO198705' },
  { id: 's4', name: 'Zöld Mező Bt.', cui: 'RO444555' },
  { id: 's5', name: 'Varga Sándor', cui: 'RO111222' },
  { id: 's6', name: 'Hargita Tej Szövetkezet', cui: 'RO999000' },
  { id: 's7', name: 'Bio-Farma 2000', cui: 'RO777111' },
  { id: 's8', name: 'Havasok Teje Kft.', cui: 'RO222333' },
  { id: 's9', name: 'Puskás Farm', cui: 'RO555666' },
];

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'shp-1',
    shipmentNumber: 'SHP-20260121-01',
    vehiclePlate: 'HR-10-BOM',
    driverName: 'Tóth Gábor',
    departureTime: '2026-01-21T06:00:00',
    status: 'COMPLETED',
    totalVolume: 8200,
    avizos: [
      { id: 'av-1', supplierId: 's1', supplierName: 'Agro Lacto Coop', plannedVolume: 4500, actualVolume: 4480, fatPercentage: 3.82, proteinPercentage: 3.31, temperature: 3.8, ph: 6.65, antibioticTest: 'NEGATIVE', hasSample: true, status: 'VERIFIED' },
      { id: 'av-2', supplierId: 's3', supplierName: 'Kovács István E.V.', plannedVolume: 1200, actualVolume: 1210, fatPercentage: 4.10, proteinPercentage: 3.45, temperature: 4.2, ph: 6.62, antibioticTest: 'NEGATIVE', hasSample: true, status: 'VERIFIED' },
      { id: 'av-3', supplierId: 's5', supplierName: 'Varga Sándor', plannedVolume: 2500, actualVolume: 2510, fatPercentage: 3.75, proteinPercentage: 3.28, temperature: 4.5, ph: 6.68, antibioticTest: 'NEGATIVE', hasSample: true, status: 'VERIFIED' },
    ]
  },
  {
    id: 'shp-2',
    shipmentNumber: 'SHP-20260121-02',
    vehiclePlate: 'HR-99-TEJ',
    driverName: 'Kiss Zoltán',
    departureTime: '2026-01-21T07:30:00',
    status: 'ARRIVED',
    totalVolume: 12000,
    avizos: [
      { id: 'av-4', supplierId: 's2', supplierName: 'Csarnok - Domokos', plannedVolume: 5000, actualVolume: 0, fatPercentage: 0, proteinPercentage: 0, temperature: 0, ph: 0, antibioticTest: 'PENDING', hasSample: false, status: 'PENDING' },
      { id: 'av-5', supplierId: 's4', supplierName: 'Zöld Mező Bt.', plannedVolume: 4000, actualVolume: 0, fatPercentage: 0, proteinPercentage: 0, temperature: 0, ph: 0, antibioticTest: 'PENDING', hasSample: false, status: 'PENDING' },
    ]
  },
  {
    id: 'shp-3',
    shipmentNumber: 'SHP-20260121-03',
    vehiclePlate: 'HR-05-BOM',
    driverName: 'Fekete Aladár',
    departureTime: '2026-01-21T10:15:00',
    status: 'IN_TRANSIT',
    totalVolume: 1500,
    avizos: [
      { id: 'av-7', supplierId: 's6', supplierName: 'Hargita Tej Szövetkezet', plannedVolume: 1500, actualVolume: 0, fatPercentage: 0, proteinPercentage: 0, temperature: 0, ph: 0, antibioticTest: 'PENDING', hasSample: false, status: 'PENDING' },
    ]
  },
  {
    id: 'shp-prev-1',
    shipmentNumber: 'SHP-20260120-05',
    vehiclePlate: 'HR-10-BOM',
    driverName: 'Tóth Gábor',
    departureTime: '2026-01-20T14:00:00',
    status: 'COMPLETED',
    totalVolume: 5600,
    avizos: [
      { id: 'av-prev-1', supplierId: 's8', supplierName: 'Havasok Teje Kft.', plannedVolume: 5600, actualVolume: 5590, fatPercentage: 3.70, proteinPercentage: 3.20, temperature: 4.1, ph: 6.64, antibioticTest: 'NEGATIVE', hasSample: true, status: 'VERIFIED' },
    ]
  }
];

const ShipmentArrival: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-21'); // Alapértelmezett a screenshot szerinti dátum
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [editingAvizo, setEditingAvizo] = useState<DeliveryNote | null>(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  // Szűrt szállítmányok a választott nap alapján
  const dailyShipments = useMemo(() => {
    return shipments.filter(s => s.departureTime.startsWith(selectedDate));
  }, [shipments, selectedDate]);

  const activeShipment = useMemo(() => 
    shipments.find(s => s.id === selectedShipmentId), 
    [shipments, selectedShipmentId]
  );

  const handleUpdateAvizo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAvizo || !selectedShipmentId) return;

    setShipments(prev => prev.map(s => {
      if (s.id === selectedShipmentId) {
        return {
          ...s,
          avizos: s.avizos.map(a => a.id === editingAvizo.id ? { ...editingAvizo, status: 'VERIFIED' } : a)
        };
      }
      return s;
    }));
    setEditingAvizo(null);
  };

  const handleAddSupplierToShipment = (supplier: Partial<Supplier>) => {
    if (!selectedShipmentId) return;

    const newAvizo: DeliveryNote = {
      id: `av-new-${Date.now()}`,
      supplierId: supplier.id!,
      supplierName: supplier.name!,
      plannedVolume: 0,
      actualVolume: 0,
      fatPercentage: 3.5,
      proteinPercentage: 3.2,
      temperature: 4.0,
      ph: 6.6,
      antibioticTest: 'PENDING',
      hasSample: false,
      status: 'PENDING'
    };

    setShipments(prev => prev.map(s => {
      if (s.id === selectedShipmentId) {
        if (s.avizos.some(a => a.supplierId === supplier.id)) {
           alert("Ez a beszállító már szerepel a listában!");
           return s;
        }
        return {
          ...s,
          avizos: [...s.avizos, newAvizo]
        };
      }
      return s;
    }));
    setIsAddSupplierModalOpen(false);
    setSupplierSearch('');
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'ARRIVED': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-200">BEÉRKEZETT</span>;
      case 'IN_TRANSIT': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black animate-pulse border border-amber-200">ÚTON</span>;
      case 'PROCESSING': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-black border border-purple-200">FELDOLGOZÁS</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black border border-green-200">LEZÁRVA</span>;
    }
  };

  const filteredSuppliers = ALL_SUPPLIERS.filter(s => 
    s.name?.toLowerCase().includes(supplierSearch.toLowerCase()) || 
    s.cui?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in">
      
      {/* Bal oldali panel: Szállítmányok listája */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
            <Truck size={20} className="mr-2 text-blue-500" />
            Szállítmányok
          </h2>
          
          <div className="relative">
             <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Kiválasztott nap</label>
             <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedShipmentId(null);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {dailyShipments.length > 0 ? (
            dailyShipments.map(shp => (
              <div 
                key={shp.id}
                onClick={() => setSelectedShipmentId(shp.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedShipmentId === shp.id ? 'bg-white border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{shp.shipmentNumber}</span>
                  {getStatusBadge(shp.status)}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{shp.vehiclePlate}</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1">
                  <Clock size={14} className="mr-1" /> Indult: {new Date(shp.departureTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
                <div className="mt-3 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>Beszállítók: {shp.avizos.length} db</span>
                  <span className="text-blue-600 font-black">{shp.avizos.filter(a => a.status === 'VERIFIED').length} / {shp.avizos.length} KÉSZ</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
               <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
               <p className="text-sm text-slate-500 font-medium">Nincs rögzített szállítmány ezen a napon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Jobb oldali panel: Részletek */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {activeShipment ? (
          <>
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{activeShipment.vehiclePlate} rakománya</h3>
                <p className="text-sm text-slate-500">Sofőr: {activeShipment.driverName} • {activeShipment.shipmentNumber}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 {activeShipment.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => setIsAddSupplierModalOpen(true)}
                      className="flex-1 md:flex-none bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition flex items-center justify-center shadow-sm"
                    >
                        <UserPlus size={18} className="mr-2" /> Beszállító hozzáadása
                    </button>
                 )}
                 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
                    Szállítmány Lezárása
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                   <ClipboardList size={14} className="mr-1.5" /> Beszállítónkénti Tej-Avizók
                </h4>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {activeShipment.avizos.map(av => (
                  <div key={av.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition group">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <h5 className="font-bold text-slate-800">{av.supplierName}</h5>
                           {av.status === 'VERIFIED' ? 
                             <span className="flex items-center text-green-600 text-[10px] font-black bg-green-50 px-1.5 py-0.5 rounded border border-green-100"><CheckCircle size={10} className="mr-1" /> ELLENŐRIZVE</span> :
                             <span className="text-amber-600 text-[10px] font-black bg-amber-50 px-1.5 py-0.5 rounded uppercase border border-amber-100">Várakozik</span>
                           }
                           {av.hasSample && (
                             <span className="flex items-center text-blue-600 text-[10px] font-black bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title="Minta leadva">
                                <TestTubeDiagonal size={10} className="mr-1" /> MINTA OK
                             </span>
                           )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                           <div className="text-xs">
                              <span className="text-slate-400 block uppercase font-bold text-[10px]">Tervezett</span>
                              <span className="font-bold text-slate-700">{av.plannedVolume > 0 ? `${av.plannedVolume} L` : 'Nincs terv'}</span>
                           </div>
                           <div className="text-xs">
                              <span className="text-slate-400 block uppercase font-bold text-[10px]">Mért</span>
                              <span className={`font-bold ${av.actualVolume > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                                 {av.actualVolume > 0 ? `${av.actualVolume} L` : 'N/A'}
                              </span>
                           </div>
                           <div className="text-xs">
                              <span className="text-slate-400 block uppercase font-bold text-[10px]">Zsír / Fehérje</span>
                              <span className="font-bold text-slate-700">{av.fatPercentage > 0 ? `${av.fatPercentage}% / ${av.proteinPercentage}%` : 'N/A'}</span>
                           </div>
                           <div className="text-xs">
                              <span className="text-slate-400 block uppercase font-bold text-[10px]">Hőfok</span>
                              <span className={`font-bold ${av.temperature > 8 ? 'text-red-600' : av.temperature > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                                {av.temperature > 0 ? `${av.temperature}°C` : 'N/A'}
                              </span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                         <button 
                           onClick={() => setEditingAvizo(av)}
                           className="w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold text-slate-600 transition flex items-center justify-center border border-slate-200"
                         >
                            Adatok rögzítése <ChevronRight size={16} className="ml-1" />
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-slate-50/30">
            <div className="p-6 bg-white rounded-full mb-6 shadow-sm">
               <Truck size={64} className="opacity-20 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-600">Nincs kiválasztott szállítmány</h3>
            <p className="max-w-xs mt-2 text-sm">Válassz ki egy járművet a bal oldali listából a rakomány részleteihez és a laboradatok rögzítéséhez.</p>
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center">
                    <UserPlus size={18} className="mr-2 text-blue-400" />
                    Beszállító keresése
                 </h3>
                 <button onClick={() => setIsAddSupplierModalOpen(false)} className="hover:bg-slate-700 p-1 rounded transition"><X size={20}/></button>
              </div>
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="Név vagy CUI keresése..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {filteredSuppliers.map(s => (
                   <button 
                     key={s.id}
                     onClick={() => handleAddSupplierToShipment(s)}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition group text-left"
                   >
                      <div>
                         <div className="font-bold text-slate-800 group-hover:text-blue-700">{s.name}</div>
                         <div className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">{s.cui}</div>
                      </div>
                      <Plus size={18} className="text-slate-300 group-hover:text-blue-500" />
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Editing Avizo Data Modal */}
      {editingAvizo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center shrink-0">
                 <h3 className="font-bold flex items-center">
                    <Beaker size={18} className="mr-2 text-blue-400" />
                    Mérési adatok: {editingAvizo.supplierName}
                 </h3>
                 <button onClick={() => setEditingAvizo(null)} className="hover:bg-slate-700 p-1 rounded transition"><X size={20}/></button>
              </div>

              <form onSubmit={handleUpdateAvizo} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
                 {/* ... (Az űrlap többi része változatlan) */}
                 <div className="pt-2 flex gap-3 sticky bottom-0 bg-white -mx-6 -mb-6 p-6 border-t border-slate-100">
                    <button type="button" onClick={() => setEditingAvizo(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Mégse</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition flex items-center justify-center">
                       <Save size={18} className="mr-2" /> Mentés & Jóváhagyás
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default ShipmentArrival;
