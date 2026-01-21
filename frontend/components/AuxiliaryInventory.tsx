import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Package, 
  Droplet, 
  FlaskConical, 
  Plus, 
  Minus, 
  History, 
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  CheckCircle,
  X
} from 'lucide-react';

// --- Types ---

type AuxCategory = 'INGREDIENT' | 'PACKAGING' | 'CHEMICAL';

interface AuxItem {
  id: string;
  name: string;
  sku: string;
  category: AuxCategory;
  batchId: string; // LOT szám
  quantity: number;
  uom: string; // Mértékegység
  minStock: number; // Reorder Point
  expiryDate?: string; // FEFO alap
  location: string;
  unitPrice?: number;
}

// --- Mock Data ---

const INITIAL_ITEMS: AuxItem[] = [
  // --- INGREDIENTS (Oltó, Kultúra, Só) ---
  { id: 'aux-1', name: 'Oltó (Chymosin) 500ml', sku: 'ING-105', category: 'INGREDIENT', batchId: 'L23001', quantity: 2, uom: 'db', minStock: 5, expiryDate: '2023-11-15', location: 'Hűtőkamra 1' },
  { id: 'aux-2', name: 'Oltó (Chymosin) 500ml', sku: 'ING-105', category: 'INGREDIENT', batchId: 'L23005', quantity: 10, uom: 'db', minStock: 5, expiryDate: '2024-05-20', location: 'Hűtőkamra 1' },
  { id: 'aux-3', name: 'Kultúra Mesofil (Sajt)', sku: 'ING-101', category: 'INGREDIENT', batchId: 'M-8821', quantity: 45, uom: 'tasak', minStock: 20, expiryDate: '2024-02-10', location: 'Fagyasztó A' },
  { id: 'aux-4', name: 'Ipari Só (Jódozatlan)', sku: 'ING-200', category: 'INGREDIENT', batchId: 'S-9900', quantity: 1200, uom: 'kg', minStock: 500, location: 'Szárazraktár' },
  
  // --- PACKAGING (Csomagoló) ---
  { id: 'aux-5', name: 'Vákuum tasak 20x30', sku: 'PKG-VAC-2030', category: 'PACKAGING', batchId: 'PV-101', quantity: 800, uom: 'db', minStock: 2000, location: 'Raktár B / Polc 2' }, // LOW STOCK
  { id: 'aux-6', name: 'Műanyag Pohár 350g', sku: 'PKG-CUP-350', category: 'PACKAGING', batchId: 'PC-550', quantity: 12500, uom: 'db', minStock: 5000, location: 'Raktár B / Polc 4' },
  { id: 'aux-7', name: 'Alu Fedőfólia 95mm', sku: 'PKG-LID-95', category: 'PACKAGING', batchId: 'AL-200', quantity: 18000, uom: 'db', minStock: 5000, location: 'Raktár B / Polc 4' },
  
  // --- CHEMICALS (Vegyszer) ---
  { id: 'aux-8', name: 'Lúg (CIP Tisztító)', sku: 'CHEM-ALK', category: 'CHEMICAL', batchId: 'CH-800', quantity: 120, uom: 'liter', minStock: 50, expiryDate: '2025-01-01', location: 'Vegyszerraktár' },
  { id: 'aux-9', name: 'Sav (CIP Tisztító)', sku: 'CHEM-ACD', category: 'CHEMICAL', batchId: 'CH-801', quantity: 40, uom: 'liter', minStock: 50, expiryDate: '2024-12-01', location: 'Vegyszerraktár' }, // LOW STOCK
];

const AuxiliaryInventory: React.FC = () => {
  const [items, setItems] = useState<AuxItem[]>(INITIAL_ITEMS);
  const [activeTab, setActiveTab] = useState<AuxCategory>('INGREDIENT');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Movement Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'IN' | 'OUT'>('OUT');
  const [selectedItem, setSelectedItem] = useState<AuxItem | null>(null);
  const [movementAmount, setMovementAmount] = useState<string>('');

  // --- DERIVED STATE ---
  
  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.category === activeTab &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
      // FEFO Sort: If expiry exists, sort by date ascending
      if (a.expiryDate && b.expiryDate) {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      return 0;
    });
  }, [items, activeTab, searchTerm]);

  // Aggregated Stock per SKU (for Purchase Alerts)
  const stockBySku = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(i => {
      const current = map.get(i.sku) || 0;
      map.set(i.sku, current + i.quantity);
    });
    return map;
  }, [items]);

  // Low Stock Alerts
  const lowStockAlerts = useMemo(() => {
    // Check unique SKUs against their minStock (using the first item found as reference for name/minStock)
    const alerts: {sku: string, name: string, current: number, min: number}[] = [];
    const processedSkus = new Set<string>();

    items.forEach(item => {
      if (processedSkus.has(item.sku)) return;
      
      const totalStock = stockBySku.get(item.sku) || 0;
      if (totalStock <= item.minStock) {
        alerts.push({
          sku: item.sku,
          name: item.name,
          current: totalStock,
          min: item.minStock
        });
      }
      processedSkus.add(item.sku);
    });
    return alerts;
  }, [items, stockBySku]);

  // --- HANDLERS ---

  const handleOpenModal = (item: AuxItem, type: 'IN' | 'OUT') => {
    setSelectedItem(item);
    setModalType(type);
    setMovementAmount('');
    setIsModalOpen(true);
  };

  const handleMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !movementAmount) return;

    const amount = parseFloat(movementAmount);
    
    setItems(prevItems => prevItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          quantity: modalType === 'IN' ? item.quantity + amount : Math.max(0, item.quantity - amount)
        };
      }
      return item;
    }));

    setIsModalOpen(false);
  };

  // Check if an item is the "FEFO Winner" (Earliest expiry for its SKU)
  const isFecoWinner = (item: AuxItem) => {
    if (!item.expiryDate) return false;
    const sameSkuItems = items.filter(i => i.sku === item.sku && i.quantity > 0 && i.expiryDate);
    if (sameSkuItems.length === 0) return false;
    
    // Find earliest date
    const dates = sameSkuItems.map(i => new Date(i.expiryDate!).getTime());
    const minDate = Math.min(...dates);
    
    return new Date(item.expiryDate).getTime() === minDate;
  };

  const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Title Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <h2 className="text-lg font-bold text-slate-800">Auxiliáris Anyagok & Raktár</h2>
           <p className="text-sm text-slate-500">Alapanyagok, csomagolók és vegyszerek készletkezelése FEFO elv alapján.</p>
        </div>

        {/* Purchase Alert Box */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col justify-center">
           <div className="flex items-center text-red-700 font-bold mb-1">
             <ShoppingCart size={18} className="mr-2" />
             Beszerzési Riasztások
           </div>
           <div className="text-2xl font-black text-red-800">{lowStockAlerts.length} tétel</div>
           <p className="text-xs text-red-600">készlethiányos vagy kritikus szinten</p>
        </div>
      </div>

      {/* Critical Alerts Detail */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-4 overflow-x-auto flex space-x-4 items-center scrollbar-hide">
           <div className="font-bold text-slate-700 text-sm whitespace-nowrap mr-2">
             Szükséges Rendelések:
           </div>
           {lowStockAlerts.map(alert => (
             <div key={alert.sku} className="flex items-center bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs border border-red-100 whitespace-nowrap flex-shrink-0">
                <AlertTriangle size={12} className="mr-1.5" />
                <span className="font-bold mr-1">{alert.name}</span>
                <span>(Jelenleg: {alert.current}, Min: {alert.min})</span>
             </div>
           ))}
        </div>
      )}

      {/* TABS & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <button 
              onClick={() => setActiveTab('INGREDIENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition whitespace-nowrap ${activeTab === 'INGREDIENT' ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <Droplet size={16} className="mr-2" /> Alapanyagok
            </button>
            <button 
              onClick={() => setActiveTab('PACKAGING')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition whitespace-nowrap ${activeTab === 'PACKAGING' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <Package size={16} className="mr-2" /> Csomagolóanyag
            </button>
            <button 
              onClick={() => setActiveTab('CHEMICAL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition whitespace-nowrap ${activeTab === 'CHEMICAL' ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <FlaskConical size={16} className="mr-2" /> Vegyszerek
            </button>
         </div>

         <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Keresés név vagy SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                     <th className="px-6 py-4">Megnevezés / SKU</th>
                     <th className="px-6 py-4">LOT / Sarzs</th>
                     <th className="px-6 py-4">Lejárat (FEFO)</th>
                     <th className="px-6 py-4">Lokáció</th>
                     <th className="px-6 py-4 text-right">Készlet</th>
                     <th className="px-6 py-4 text-center">Műveletek</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => {
                       const daysLeft = getDaysUntilExpiry(item.expiryDate);
                       const isExpired = daysLeft !== null && daysLeft < 0;
                       const isNearExpiry = daysLeft !== null && daysLeft > 0 && daysLeft < 30;
                       const isFefo = isFecoWinner(item);

                       return (
                         <tr key={item.id} className={`hover:bg-slate-50 transition ${item.quantity <= 0 ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-6 py-4">
                               <div className="font-bold text-slate-800">{item.name}</div>
                               <div className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</div>
                               {item.quantity <= 0 && <span className="text-[10px] font-bold text-red-500 uppercase">Kifogyott</span>}
                            </td>
                            <td className="px-6 py-4">
                               <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono font-medium">
                                 {item.batchId}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               {item.expiryDate ? (
                                  <div className="flex items-center">
                                     <Calendar size={14} className={`mr-2 ${isExpired ? 'text-red-500' : 'text-slate-400'}`} />
                                     <div className="flex flex-col">
                                       <span className={`${isExpired ? 'text-red-600 font-bold' : isNearExpiry ? 'text-amber-600 font-medium' : 'text-slate-700'}`}>
                                          {item.expiryDate}
                                       </span>
                                       {isFefo && item.quantity > 0 && (
                                         <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold w-fit mt-0.5">
                                           FEFO AJÁNLOTT
                                         </span>
                                       )}
                                     </div>
                                  </div>
                               ) : (
                                  <span className="text-slate-400">-</span>
                               )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                               {item.location}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="font-bold text-slate-800 text-base">{item.quantity.toLocaleString()}</div>
                               <div className="text-xs text-slate-500">{item.uom}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center justify-center space-x-2">
                                  <button 
                                    onClick={() => handleOpenModal(item, 'IN')}
                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition"
                                    title="Bevételezés"
                                  >
                                    <ArrowDownRight size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleOpenModal(item, 'OUT')}
                                    className={`p-1.5 rounded-lg border border-transparent transition ${
                                       isFefo 
                                       ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-md animate-pulse' 
                                       : 'text-amber-600 hover:bg-amber-50 hover:border-amber-200'
                                    }`}
                                    title="Kiadás (Felhasználás)"
                                  >
                                    <ArrowUpRight size={18} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       );
                    })
                  ) : (
                    <tr>
                       <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          Nincs megjeleníthető tétel ebben a kategóriában.
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* MOVEMENT MODAL */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className={`p-4 text-white flex justify-between items-center ${modalType === 'IN' ? 'bg-green-600' : 'bg-amber-500'}`}>
                 <h3 className="font-bold flex items-center">
                    {modalType === 'IN' ? <ArrowDownRight className="mr-2" /> : <ArrowUpRight className="mr-2" />}
                    {modalType === 'IN' ? 'Készlet Bevételezés' : 'Készlet Kiadás'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded"><X size={18}/></button>
              </div>

              <form onSubmit={handleMovement} className="p-6 space-y-4">
                 
                 {modalType === 'OUT' && isFecoWinner(selectedItem) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 flex items-start">
                       <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                       <div>
                          <span className="font-bold">Helyes választás (FEFO)!</span>
                          <br/>
                          Ez a legrégebbi lejáratú tétel ebből az anyagból.
                       </div>
                    </div>
                 )}

                 {modalType === 'OUT' && !isFecoWinner(selectedItem) && selectedItem.expiryDate && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start">
                       <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                       <div>
                          <span className="font-bold">Figyelem (FEFO Eltérés)!</span>
                          <br/>
                          Van korábbi lejáratú tétel is raktáron! Biztosan ezt a LOT-ot bontod meg?
                       </div>
                    </div>
                 )}

                 <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Tétel</label>
                    <div className="font-bold text-slate-800 text-lg">{selectedItem.name}</div>
                    <div className="text-sm text-slate-500 font-mono">LOT: {selectedItem.batchId}</div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-500 mb-1">Jelenlegi</label>
                       <div className="font-bold text-slate-700">{selectedItem.quantity} {selectedItem.uom}</div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-500 mb-1">Mozgás ({selectedItem.uom})</label>
                       <input 
                         type="number" 
                         autoFocus
                         required
                         min="0.1"
                         step="0.1"
                         max={modalType === 'OUT' ? selectedItem.quantity : undefined}
                         value={movementAmount}
                         onChange={(e) => setMovementAmount(e.target.value)}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95 flex justify-center items-center mt-4 ${
                      modalType === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'
                   }`}
                 >
                    {modalType === 'IN' ? 'Készlet Növelése' : 'Készlet Csökkentése'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default AuxiliaryInventory;