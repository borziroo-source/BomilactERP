import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Droplet, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Settings, 
  Calendar, 
  FileText,
  Thermometer,
  Search,
  X,
  Save,
  Clock,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Vehicle, VehicleType, VehicleStatus, WashLog } from '../types';

// Mock Data
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'TRUCK-HR10BOM',
    plateNumber: 'HR-10-BOM',
    makeModel: 'MAN TGM 18.250',
    type: VehicleType.MILK_TANKER,
    status: VehicleStatus.DIRTY,
    totalCapacityLiters: 8000,
    compartments: [
      { id: 1, capacityLiters: 4000, currentContent: 'EMPTY' },
      { id: 2, capacityLiters: 4000, currentContent: 'EMPTY' }
    ],
    itpExpiry: '2024-12-15',
    rcaExpiry: '2024-11-01',
    lastWashTime: '2023-10-24T14:30:00', // Régi mosás -> DIRTY
    mileageKm: 145000
  },
  {
    id: 'TRUCK-HR99TEJ',
    plateNumber: 'HR-99-TEJ',
    makeModel: 'Mercedes Atego (Hűtős)',
    type: VehicleType.REEFER_TRUCK,
    status: VehicleStatus.READY_TO_COLLECT, // Hűtősöknél ez simán "READY"
    totalCapacityLiters: 15000, // Csomagtér
    itpExpiry: '2024-06-20',
    rcaExpiry: '2024-08-10',
    mileageKm: 210500,
    lastWashTime: new Date().toISOString() // Friss
  },
  {
    id: 'CAR-HR05BOM',
    plateNumber: 'HR-05-BOM',
    makeModel: 'Dacia Duster',
    type: VehicleType.PASSENGER,
    status: VehicleStatus.READY_TO_COLLECT,
    itpExpiry: '2025-01-10',
    rcaExpiry: '2024-12-01',
    mileageKm: 45000
  }
];

const FleetManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [activeTab, setActiveTab] = useState<'VEHICLES' | 'DOCS'>('VEHICLES');
  const [washModalOpen, setWashModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Wash Form State
  const [washTemp, setWashTemp] = useState(65);
  const [washChemicals, setWashChemicals] = useState('Lúg + Sav');
  const [washerName, setWasherName] = useState('Kovács Mosó');

  // Renew Form State
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewDocType, setRenewDocType] = useState<'ITP' | 'RCA' | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // Add Vehicle State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    plateNumber: '',
    makeModel: '',
    type: VehicleType.MILK_TANKER,
    status: VehicleStatus.READY_TO_COLLECT,
    totalCapacityLiters: 0,
    itpExpiry: '',
    rcaExpiry: '',
    mileageKm: 0
  });

  // --- LOGIC: HACCP Check ---
  // Ha a mosás régebbi mint 24 óra, és Milk Tanker, akkor jelezzük
  const isWashExpired = (lastWashTime?: string) => {
    if (!lastWashTime) return true;
    const diff = new Date().getTime() - new Date(lastWashTime).getTime();
    return diff > 24 * 60 * 60 * 1000; // 24 hours
  };

  // --- ACTIONS ---
  const handleOpenWashModal = (vId: string) => {
    setSelectedVehicleId(vId);
    setWashModalOpen(true);
  };

  const handleSaveWash = () => {
    if (!selectedVehicleId) return;
    
    const now = new Date().toISOString();
    
    setVehicles(prev => prev.map(v => {
      if (v.id === selectedVehicleId) {
        return {
          ...v,
          status: VehicleStatus.READY_TO_COLLECT,
          lastWashTime: now
        };
      }
      return v;
    }));

    setWashModalOpen(false);
    // Itt lehetne menteni a WashLog-ot is egy külön state-be
  };

  const handleOpenRenewModal = (vId: string, type: 'ITP' | 'RCA') => {
    setSelectedVehicleId(vId);
    setRenewDocType(type);
    
    // Default next date suggestion
    const currentVehicle = vehicles.find(v => v.id === vId);
    if (currentVehicle) {
        const currentDate = type === 'ITP' ? currentVehicle.itpExpiry : currentVehicle.rcaExpiry;
        // Simple logic: if exists, prefill, otherwise empty
        setNewExpiryDate(currentDate || ''); 
    }
    setRenewModalOpen(true);
  };

  const handleSaveRenew = () => {
    if (!selectedVehicleId || !renewDocType || !newExpiryDate) return;

    setVehicles(prev => prev.map(v => {
      if (v.id === selectedVehicleId) {
        return {
          ...v,
          [renewDocType === 'ITP' ? 'itpExpiry' : 'rcaExpiry']: newExpiryDate
        };
      }
      return v;
    }));

    setRenewModalOpen(false);
  };

  const handleSaveNewVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.plateNumber || !newVehicle.makeModel || !newVehicle.itpExpiry || !newVehicle.rcaExpiry) {
      alert("Minden mező kitöltése kötelező!");
      return;
    }

    const vehicle: Vehicle = {
      id: `VEH-${Math.floor(Math.random() * 10000)}`,
      plateNumber: newVehicle.plateNumber.toUpperCase(),
      makeModel: newVehicle.makeModel,
      type: newVehicle.type as VehicleType,
      status: VehicleStatus.READY_TO_COLLECT,
      itpExpiry: newVehicle.itpExpiry,
      rcaExpiry: newVehicle.rcaExpiry,
      mileageKm: newVehicle.mileageKm || 0,
      totalCapacityLiters: newVehicle.totalCapacityLiters || 0,
      lastWashTime: new Date().toISOString() // Assume clean on entry
    };

    setVehicles([...vehicles, vehicle]);
    setAddModalOpen(false);
    // Reset form
    setNewVehicle({
      plateNumber: '',
      makeModel: '',
      type: VehicleType.MILK_TANKER,
      status: VehicleStatus.READY_TO_COLLECT,
      totalCapacityLiters: 0,
      itpExpiry: '',
      rcaExpiry: '',
      mileageKm: 0
    });
  };

  const getStatusBadge = (vehicle: Vehicle) => {
    if (vehicle.status === VehicleStatus.MAINTENANCE) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-bold flex items-center"><Settings size={12} className="mr-1"/> SZERVIZ</span>;
    }

    // Specifikus logika TEJES autókra
    if (vehicle.type === VehicleType.MILK_TANKER) {
      if (isWashExpired(vehicle.lastWashTime) || vehicle.status === VehicleStatus.DIRTY) {
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold flex items-center"><AlertTriangle size={12} className="mr-1"/> MOSÁS SZÜKSÉGES</span>;
      }
    }

    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-bold flex items-center"><CheckCircle size={12} className="mr-1"/> INDULÁSRA KÉSZ</span>;
  };

  const getIconByType = (type: VehicleType) => {
    switch (type) {
      case VehicleType.MILK_TANKER: return <Droplet size={24} className="text-blue-500" />;
      case VehicleType.REEFER_TRUCK: return <Truck size={24} className="text-cyan-500" />;
      case VehicleType.PASSENGER: return <Navigation size={24} className="text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Flotta & Logisztika</h2>
          <p className="text-sm text-slate-500">Járműpark felügyelet és HACCP mosási naplózás</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('VEHICLES')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'VEHICLES' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             Járművek
           </button>
           <button 
             onClick={() => setActiveTab('DOCS')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'DOCS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
           >
             Okmányok & Vizsgák
           </button>
           <button 
             onClick={() => setAddModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
           >
             <Plus size={18} className="mr-2" /> Új Jármű
           </button>
        </div>
      </div>

      {/* Main Content - VEHICLES LIST */}
      {activeTab === 'VEHICLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const washExpired = isWashExpired(vehicle.lastWashTime);
            
            return (
              <div key={vehicle.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md
                ${vehicle.status === VehicleStatus.MAINTENANCE ? 'border-red-100' : 
                  (washExpired && vehicle.type === VehicleType.MILK_TANKER) ? 'border-amber-200' : 'border-slate-100'}
              `}>
                {/* Card Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                   <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                        {getIconByType(vehicle.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{vehicle.plateNumber}</h3>
                        <p className="text-xs text-slate-500">{vehicle.makeModel}</p>
                      </div>
                   </div>
                   {getStatusBadge(vehicle)}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  
                  {/* Capacity Info */}
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500">Kapacitás:</span>
                     <span className="font-semibold">{vehicle.totalCapacityLiters?.toLocaleString()} L / Kg</span>
                  </div>

                  {/* Compartments Visualization (Only for Tankers) */}
                  {vehicle.type === VehicleType.MILK_TANKER && vehicle.compartments && (
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rekeszek (Tartály)</p>
                      <div className="flex space-x-2">
                        {vehicle.compartments.map((comp) => (
                          <div key={comp.id} className="flex-1 bg-white border border-slate-300 rounded p-2 text-center relative overflow-hidden">
                             <div className="relative z-10">
                               <div className="text-xs font-bold text-slate-700">R{comp.id}</div>
                               <div className="text-xs text-slate-500">{comp.capacityLiters}L</div>
                             </div>
                             {/* Mock fill level visual */}
                             <div className="absolute bottom-0 left-0 w-full bg-blue-100 h-1"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Wash Info */}
                  <div className="flex items-start space-x-2 bg-blue-50 p-2 rounded text-xs text-blue-800">
                     <Clock size={14} className="mt-0.5" />
                     <div>
                       <span className="font-bold">Utolsó Mosás (CIP):</span><br/>
                       {vehicle.lastWashTime ? new Date(vehicle.lastWashTime).toLocaleString('hu-HU') : 'Nincs adat'}
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleOpenWashModal(vehicle.id)}
                      className="flex items-center justify-center px-3 py-2 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 rounded-lg text-sm transition"
                    >
                      <Droplet size={16} className="mr-2 text-blue-500" />
                      Mosás Rögzítése
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm transition">
                      <FileText size={16} className="mr-2 text-slate-400" />
                      Útvonal
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Docs Tab Content */}
      {activeTab === 'DOCS' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4">Lejáró Okmányok</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-xs">
                <th className="py-2">Rendszám</th>
                <th className="py-2">Típus</th>
                <th className="py-2">ITP (Műszaki)</th>
                <th className="py-2">RCA (Biztosítás)</th>
                <th className="py-2">Státusz</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-medium">{v.plateNumber}</td>
                  <td className="py-3 text-slate-500">{v.type}</td>
                  
                  {/* ITP Cell with Action */}
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                       <span className={`font-mono ${new Date(v.itpExpiry) < new Date() ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                         {v.itpExpiry}
                       </span>
                       <button 
                         onClick={() => handleOpenRenewModal(v.id, 'ITP')}
                         className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                         title="ITP Megújítás"
                       >
                         <RefreshCw size={14} />
                       </button>
                    </div>
                  </td>
                  
                  {/* RCA Cell with Action */}
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                       <span className={`font-mono ${new Date(v.rcaExpiry) < new Date() ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                         {v.rcaExpiry}
                       </span>
                       <button 
                         onClick={() => handleOpenRenewModal(v.id, 'RCA')}
                         className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                         title="RCA Megújítás"
                       >
                         <RefreshCw size={14} />
                       </button>
                    </div>
                  </td>

                  <td className="py-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">OK</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wash Modal */}
      {washModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center">
                 <Droplet className="mr-2 text-blue-400" />
                 CIP Mosás Rögzítése
               </h3>
               <button onClick={() => setWashModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 mb-4">
                <p className="font-bold mb-1">HACCP Figyelmeztetés:</p>
                Csak akkor rögzítsd a mosást, ha a pH teszt negatív és a hőmérséklet elérte a kritikus szintet (60°C+)!
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jármű Rendszám</label>
                <input disabled value={vehicles.find(v => v.id === selectedVehicleId)?.plateNumber || ''} className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-slate-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vegyszerek</label>
                <select value={washChemicals} onChange={(e) => setWashChemicals(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2">
                  <option value="Lúg + Sav">Lúg + Sav (Teljes CIP)</option>
                  <option value="Csak Lúg">Csak Lúg</option>
                  <option value="Csak Forróvíz">Csak Forróvíz (Fertőtlenítés)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Hőfok (°C)</label>
                   <div className="relative">
                     <Thermometer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input type="number" value={washTemp} onChange={(e) => setWashTemp(parseInt(e.target.value))} className="w-full pl-9 border border-slate-300 rounded px-3 py-2" />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Végezte</label>
                   <input type="text" value={washerName} onChange={(e) => setWasherName(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2" />
                </div>
              </div>

              <button 
                onClick={handleSaveWash}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition shadow-lg shadow-green-600/30"
              >
                <CheckCircle className="mr-2" />
                Mosás Igazolása & Státusz Frissítése
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Document Modal */}
      {renewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-blue-700 p-4 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center">
                 <RefreshCw className="mr-2 text-white" size={20} />
                 {renewDocType} Megújítás
               </h3>
               <button onClick={() => setRenewModalOpen(false)} className="hover:bg-blue-600 p-1 rounded"><X size={18}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                A kiválasztott jármű: <span className="font-bold text-slate-800">{vehicles.find(v => v.id === selectedVehicleId)?.plateNumber}</span>
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Új Lejárati Dátum</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    value={newExpiryDate} 
                    onChange={(e) => setNewExpiryDate(e.target.value)} 
                    className="w-full pl-10 border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => setRenewModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
                  >
                    Mégse
                  </button>
                  <button 
                    onClick={handleSaveRenew}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center transition"
                  >
                    <Save size={16} className="mr-2" />
                    Mentés
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center">
                 <Truck className="mr-2 text-blue-400" size={20} />
                 Új Jármű Felvétele
               </h3>
               <button onClick={() => setAddModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleSaveNewVehicle} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Rendszám *</label>
                   <input 
                     type="text" 
                     required
                     value={newVehicle.plateNumber} 
                     onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value.toUpperCase()})} 
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                     placeholder="HR-01-BOM"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Típus *</label>
                   <select 
                     value={newVehicle.type}
                     onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value as VehicleType})}
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                   >
                     <option value={VehicleType.MILK_TANKER}>Tejszállító Tartály</option>
                     <option value={VehicleType.REEFER_TRUCK}>Hűtőautó</option>
                     <option value={VehicleType.PASSENGER}>Személyautó</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Márka / Típus</label>
                <input 
                  type="text" 
                  value={newVehicle.makeModel} 
                  onChange={(e) => setNewVehicle({...newVehicle, makeModel: e.target.value})} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Pl: MAN TGM 18.250"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Kapacitás (L/Kg)</label>
                   <input 
                     type="number" 
                     value={newVehicle.totalCapacityLiters} 
                     onChange={(e) => setNewVehicle({...newVehicle, totalCapacityLiters: parseInt(e.target.value)})} 
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Km Óra Állás</label>
                   <input 
                     type="number" 
                     value={newVehicle.mileageKm} 
                     onChange={(e) => setNewVehicle({...newVehicle, mileageKm: parseInt(e.target.value)})} 
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ITP (Műszaki) Lejárat</label>
                   <input 
                     type="date" 
                     required
                     value={newVehicle.itpExpiry} 
                     onChange={(e) => setNewVehicle({...newVehicle, itpExpiry: e.target.value})} 
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RCA (Biztosítás) Lejárat</label>
                   <input 
                     type="date" 
                     required
                     value={newVehicle.rcaExpiry} 
                     onChange={(e) => setNewVehicle({...newVehicle, rcaExpiry: e.target.value})} 
                     className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                   />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
                  >
                    Mégse
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center transition"
                  >
                    <Save size={16} className="mr-2" />
                    Jármű Mentése
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FleetManagement;