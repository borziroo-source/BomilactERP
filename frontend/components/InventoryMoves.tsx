import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  RefreshCw, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  FileText,
  User,
  Package,
  ArrowRight,
  X,
  Save,
  AlertCircle
} from 'lucide-react';

// --- Types ---

export type MovementType = 'IN' | 'OUT' | 'SCRAP' | 'ADJUSTMENT';

export interface InventoryMove {
  id: string;
  date: string; // ISO DateTime
  type: MovementType;
  productName: string;
  sku: string;
  quantity: number;
  uom: string;
  reason: string;
  location: string;
  performedBy: string;
  costImpact?: number; // Optional financial value
}

// --- Mock Data ---

const INITIAL_MOVES: InventoryMove[] = [
  {
    id: 'mv-1001',
    date: '2023-10-26T08:30:00',
    type: 'IN',
    productName: 'Nyers Tehéntej',
    sku: 'ING-MILK-RAW',
    quantity: 4500,
    uom: 'l',
    reason: 'Napi Begyűjtés (Körút 1)',
    location: 'Nyers Tej Siló 1',
    performedBy: 'Kovács János',
    costImpact: 9450
  },
  {
    id: 'mv-1002',
    date: '2023-10-26T09:15:00',
    type: 'OUT',
    productName: 'Oltó (Chymosin)',
    sku: 'ING-105',
    quantity: 0.5,
    uom: 'l',
    reason: 'Gyártás: Cașcaval Rucăr (L23-1026)',
    location: 'Hűtőkamra 1',
    performedBy: 'Nagy Éva'
  },
  {
    id: 'mv-1003',
    date: '2023-10-25T16:00:00',
    type: 'SCRAP',
    productName: 'Joghurt Natúr 150g',
    sku: 'YOG-NAT-150',
    quantity: 12,
    uom: 'db',
    reason: 'Sérült csomagolás (Raktári baleset)',
    location: 'Késztermék Raktár / Polc 3',
    performedBy: 'Varga Péter',
    costImpact: -24
  },
  {
    id: 'mv-1004',
    date: '2023-10-25T14:30:00',
    type: 'ADJUSTMENT',
    productName: 'Ipari Só',
    sku: 'ING-200',
    quantity: -5,
    uom: 'kg',
    reason: 'Havi Leltár Korrekció',
    location: 'Szárazraktár',
    performedBy: 'Raktárvezető'
  },
  {
    id: 'mv-1005',
    date: '2023-10-25T10:00:00',
    type: 'OUT',
    productName: 'Vákuum tasak 20x30',
    sku: 'PKG-VAC-2030',
    quantity: 500,
    uom: 'db',
    reason: 'Csomagolóba kiadás',
    location: 'Raktár B',
    performedBy: 'Nagy Éva'
  }
];

const InventoryMoves: React.FC = () => {
  const [moves, setMoves] = useState<InventoryMove[]>(INITIAL_MOVES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<MovementType | 'ALL'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMove, setNewMove] = useState<Partial<InventoryMove>>({
    type: 'IN',
    date: new Date().toISOString().slice(0, 16), // datetime-local format
    quantity: 0,
    uom: 'db'
  });

  // --- Filtering ---
  const filteredMoves = moves.filter(m => {
    const matchesSearch = m.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || m.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- Helpers ---
  const getTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'IN': 
        return <span className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100"><ArrowDownLeft size={12} className="mr-1"/> BEVÉTELEZÉS</span>;
      case 'OUT': 
        return <span className="flex items-center text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-bold border border-blue-100"><ArrowUpRight size={12} className="mr-1"/> KIADÁS</span>;
      case 'SCRAP': 
        return <span className="flex items-center text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100"><Trash2 size={12} className="mr-1"/> SELEJT</span>;
      case 'ADJUSTMENT': 
        return <span className="flex items-center text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-bold border border-amber-100"><RefreshCw size={12} className="mr-1"/> KORREKCIÓ</span>;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMove.productName || !newMove.quantity) return;

    const move: InventoryMove = {
      id: `mv-${Date.now()}`,
      date: newMove.date || new Date().toISOString(),
      type: newMove.type as MovementType,
      productName: newMove.productName,
      sku: newMove.sku || 'UNKNOWN',
      quantity: newMove.quantity,
      uom: newMove.uom || 'db',
      reason: newMove.reason || 'Kézi rögzítés',
      location: newMove.location || 'Központi Raktár',
      performedBy: 'Aktív Felhasználó', // Mock user
    };

    setMoves([move, ...moves]);
    setIsModalOpen(false);
    // Reset form
    setNewMove({
       type: 'IN',
       date: new Date().toISOString().slice(0, 16),
       quantity: 0,
       uom: 'db',
       productName: '',
       sku: '',
       reason: ''
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <p className="text-xs text-slate-500 font-bold uppercase">Mai Mozgások</p>
           <h3 className="text-2xl font-black text-slate-800 mt-1">{moves.filter(m => m.date.startsWith(new Date().toISOString().slice(0,10))).length} db</h3>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <p className="text-xs text-slate-500 font-bold uppercase">Kiadott Anyagok</p>
           <h3 className="text-2xl font-black text-slate-800 mt-1">12 Tétel</h3>
           <p className="text-xs text-blue-500 mt-1">Gyártásba adava</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <p className="text-xs text-slate-500 font-bold uppercase">Selejt Érték (Hó)</p>
           <h3 className="text-2xl font-black text-red-600 mt-1">450 RON</h3>
           <p className="text-xs text-slate-400 mt-1">Limit alatt (OK)</p>
        </div>
        <div className="bg-blue-600 p-4 rounded-xl shadow-sm border border-blue-700 text-white flex flex-col justify-center items-center cursor-pointer hover:bg-blue-700 transition" onClick={() => setIsModalOpen(true)}>
           <Plus size={32} className="mb-2" />
           <span className="font-bold text-sm">Új Mozgás Rögzítése</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto">
            <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>Összes</button>
            <button onClick={() => setFilterType('IN')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'IN' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}>Bevét</button>
            <button onClick={() => setFilterType('OUT')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'OUT' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}>Kiadás</button>
            <button onClick={() => setFilterType('SCRAP')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterType === 'SCRAP' ? 'bg-red-100 text-red-800' : 'hover:bg-slate-50 text-slate-600'}`}>Selejt</button>
         </div>

         <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Keresés..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                     <th className="px-6 py-4">Dátum / Idő</th>
                     <th className="px-6 py-4">Típus</th>
                     <th className="px-6 py-4">Termék / SKU</th>
                     <th className="px-6 py-4 text-right">Mennyiség</th>
                     <th className="px-6 py-4">Indoklás / Lokáció</th>
                     <th className="px-6 py-4">Felhasználó</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredMoves.map(move => (
                    <tr key={move.id} className="hover:bg-slate-50 transition">
                       <td className="px-6 py-4">
                          <div className="font-medium text-slate-700 flex items-center">
                             <Calendar size={14} className="mr-2 text-slate-400" />
                             {new Date(move.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500 ml-6">
                             {new Date(move.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          {getTypeBadge(move.type)}
                       </td>
                       <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{move.productName}</div>
                          <div className="text-xs text-slate-500 font-mono">{move.sku}</div>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <span className={`font-bold text-lg ${move.type === 'IN' ? 'text-green-600' : move.type === 'OUT' || move.type === 'SCRAP' ? 'text-slate-800' : 'text-amber-600'}`}>
                             {move.type === 'OUT' || move.type === 'SCRAP' ? '-' : '+'}{move.quantity.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">{move.uom}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">{move.reason}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-0.5">
                             <ArrowRight size={10} className="mr-1" /> {move.location}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center text-slate-600">
                             <User size={14} className="mr-2 text-slate-400" />
                             {move.performedBy}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {filteredMoves.length === 0 && (
               <div className="p-8 text-center text-slate-400">Nincs megjeleníthető mozgás.</div>
            )}
         </div>
      </div>

      {/* New Move Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                 <h3 className="font-bold flex items-center">
                    <Package className="mr-2 text-blue-400" />
                    Új Készletmozgás
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Mozgás Típusa</label>
                       <select 
                         value={newMove.type}
                         onChange={(e) => setNewMove({...newMove, type: e.target.value as MovementType})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                       >
                          <option value="IN">Bevételezés (+)</option>
                          <option value="OUT">Kiadás (-)</option>
                          <option value="SCRAP">Selejtezés (-)</option>
                          <option value="ADJUSTMENT">Leltár Korrekció (+/-)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Dátum</label>
                       <input 
                         type="datetime-local" 
                         value={newMove.date}
                         onChange={(e) => setNewMove({...newMove, date: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                 </div>

                 {newMove.type === 'SCRAP' && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700 flex items-start">
                       <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                       <div>
                          <span className="font-bold">Selejtezés Figyelmeztetés</span><br/>
                          A selejtezés pénzügyi veszteséget generál. Kérlek add meg a pontos okot!
                       </div>
                    </div>
                 )}

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Termék Megnevezés</label>
                    <input 
                      type="text" 
                      required
                      placeholder="pl. Nyers Tej, Só, Címke..."
                      value={newMove.productName}
                      onChange={(e) => setNewMove({...newMove, productName: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Cikkszám (SKU)</label>
                       <input 
                         type="text" 
                         placeholder="Opcionális"
                         value={newMove.sku}
                         onChange={(e) => setNewMove({...newMove, sku: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Lokáció / Raktár</label>
                       <input 
                         type="text" 
                         placeholder="pl. Hűtő 1"
                         value={newMove.location}
                         onChange={(e) => setNewMove({...newMove, location: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Mennyiség</label>
                       <input 
                         type="number" 
                         required
                         step="0.01"
                         value={newMove.quantity}
                         onChange={(e) => setNewMove({...newMove, quantity: parseFloat(e.target.value)})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Mértékegység</label>
                       <select 
                         value={newMove.uom}
                         onChange={(e) => setNewMove({...newMove, uom: e.target.value})}
                         className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                       >
                          <option value="db">db</option>
                          <option value="kg">kg</option>
                          <option value="l">liter</option>
                          <option value="csom">csomag</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Indoklás / Megjegyzés</label>
                    <textarea 
                      required
                      rows={2}
                      placeholder="pl. Bevételezés szállítólevél alapján..."
                      value={newMove.reason}
                      onChange={(e) => setNewMove({...newMove, reason: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    ></textarea>
                 </div>

                 <div className="pt-2 flex gap-3">
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

export default InventoryMoves;
