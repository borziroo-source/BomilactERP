import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  ShoppingCart, 
  Check, 
  ChevronRight, 
  UserPlus, 
  Building,
  Save,
  ArrowLeft
} from 'lucide-react';

// Mock Data
const AGENT_PARTNERS = [
  { id: '1', name: 'Sarki Kisbolt', address: 'Székelyudvarhely, Kossuth L. 5.', phone: '0755123456', lastOrder: '2 napja' },
  { id: '2', name: 'Hotel Transilvania', address: 'Gyergyószentmiklós, Fő tér 1.', phone: '0744987654', lastOrder: '1 hete' },
  { id: '3', name: 'Harmopan Pékség', address: 'Csíkszereda, Testvériség 22.', phone: '0722111222', lastOrder: 'Tegnap' },
];

const PRODUCTS = [
  { id: 'p1', name: 'Cașcaval Rucăr 450g', price: 18.5 },
  { id: 'p2', name: 'Tejföl 12% 350g', price: 4.2 },
  { id: 'p3', name: 'Sajt Trapista 500g', price: 22.0 },
  { id: 'p4', name: 'Vaj 82% 200g', price: 12.0 },
];

const AgentSales: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'ORDER' | 'NEW_LEAD'>('LIST');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [cart, setCart] = useState<{id: string, qty: number}[]>([]);
  
  // New Lead State
  const [leadForm, setLeadForm] = useState({ name: '', address: '', phone: '', cui: '' });

  // Handlers
  const handleStartOrder = (partner: any) => {
    setSelectedPartner(partner);
    setCart([]);
    setView('ORDER');
  };

  const handleAddToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: productId, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.qty > 1) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const submitOrder = () => {
    if (cart.length === 0) return;
    alert(`Rendelés sikeresen rögzítve ${selectedPartner.name} részére!`);
    setView('LIST');
  };

  const submitLead = () => {
    if (!leadForm.name) return;
    alert(`Új partner (${leadForm.name}) rögzítve! Az adminisztráció jóváhagyása szükséges.`);
    setView('LIST');
    setLeadForm({ name: '', address: '', phone: '', cui: '' });
  };

  // --- VIEW: PARTNER LIST ---
  if (view === 'LIST') {
    return (
      <div className="space-y-4 animate-fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Partnerek</h2>
          <button 
            onClick={() => setView('NEW_LEAD')}
            className="bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700"
          >
            <UserPlus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Keresés név vagy cím..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3">
          {AGENT_PARTNERS.map(partner => (
            <div key={partner.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{partner.name}</h3>
                <div className="text-sm text-slate-500 flex items-center mt-1">
                  <MapPin size={12} className="mr-1" /> {partner.address}
                </div>
                <div className="text-xs text-slate-400 mt-1">Utolsó rendelés: {partner.lastOrder}</div>
              </div>
              <button 
                onClick={() => handleStartOrder(partner)}
                className="bg-green-50 text-green-700 p-3 rounded-lg hover:bg-green-100 transition"
              >
                <ShoppingCart size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: NEW LEAD ---
  if (view === 'NEW_LEAD') {
    return (
      <div className="space-y-4 animate-slide-left pb-20">
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
          <button onClick={() => setView('LIST')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft /></button>
          <h2 className="text-lg font-bold text-slate-800">Új Kliens Felvétele</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Cégnév / Név</label>
            <input 
              type="text" 
              value={leadForm.name}
              onChange={e => setLeadForm({...leadForm, name: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Cím</label>
            <input 
              type="text" 
              value={leadForm.address}
              onChange={e => setLeadForm({...leadForm, address: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Telefonszám</label>
            <input 
              type="tel" 
              value={leadForm.phone}
              onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Adószám (CUI)</label>
            <input 
              type="text" 
              value={leadForm.cui}
              onChange={e => setLeadForm({...leadForm, cui: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={submitLead}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition"
          >
            Mentés
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: ORDER TAKING ---
  const totalAmount = cart.reduce((acc, item) => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    return acc + (prod ? prod.price * item.qty : 0);
  }, 0);

  return (
    <div className="space-y-4 animate-slide-left flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('LIST')} className="p-1 rounded-full hover:bg-slate-100"><ArrowLeft /></button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Rendelés</h2>
            <p className="text-xs text-slate-500">{selectedPartner?.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-blue-600">{totalAmount.toLocaleString()} RON</div>
          <div className="text-xs text-slate-400">{cart.reduce((a,b)=>a+b.qty,0)} tétel</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        {PRODUCTS.map(product => {
          const inCart = cart.find(i => i.id === product.id);
          return (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">{product.name}</div>
                <div className="text-sm text-slate-500">{product.price} RON / db</div>
              </div>
              
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                {inCart ? (
                  <>
                    <button onClick={() => handleRemoveFromCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-700 font-bold">-</button>
                    <span className="w-8 text-center font-bold text-slate-800">{inCart.qty}</span>
                    <button onClick={() => handleAddToCart(product.id)} className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded shadow-sm text-white font-bold">+</button>
                  </>
                ) : (
                  <button onClick={() => handleAddToCart(product.id)} className="px-4 py-1.5 bg-white rounded shadow-sm text-slate-700 font-bold text-sm">Hozzáad</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96">
          <button 
            onClick={submitOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-xl flex justify-between px-6 items-center active:scale-95 transition"
          >
            <span>Rendelés Leadása</span>
            <span>{totalAmount.toLocaleString()} RON <ChevronRight className="inline ml-1" /></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentSales;