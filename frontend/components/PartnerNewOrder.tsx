
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ChevronRight, 
  CheckCircle,
  Package,
  Info
} from 'lucide-react';

// Mock Product Catalog
const CATALOG = [
  { id: 'p1', name: 'Cașcaval Rucăr 450g', category: 'SAJT', price: 18.5, sku: 'RUC-NAT-450', image: '🧀' },
  { id: 'p2', name: 'Cașcaval Dalia 450g', category: 'SAJT', price: 17.5, sku: 'DAL-NAT-450', image: '🧀' },
  { id: 'p3', name: 'Sajt Trapista 500g', category: 'SAJT', price: 22.0, sku: 'TRAP-500', image: '🧀' },
  { id: 'p4', name: 'Tejföl 12% 350g', category: 'FRISS', price: 4.2, sku: 'SC-12-350', image: '🥛' },
  { id: 'p5', name: 'Tejföl 20% 350g', category: 'FRISS', price: 5.5, sku: 'SC-20-350', image: '🥛' },
  { id: 'p6', name: 'Tejföl 20% 850g', category: 'FRISS', price: 11.5, sku: 'SC-20-850', image: '🪣' },
  { id: 'p7', name: 'Joghurt Natúr 150g', category: 'FRISS', price: 2.1, sku: 'YOG-NAT-150', image: '🥣' },
  { id: 'p8', name: 'Vaj 82% 200g', category: 'EGYEB', price: 12.0, sku: 'BUT-82-200', image: '🧈' },
  { id: 'p9', name: 'Mozzarella Golyó 125g', category: 'SAJT', price: 6.5, sku: 'MOZZ-125', image: '⚪' },
];

const CATEGORIES = [
  { id: 'ALL', label: 'Összes' },
  { id: 'SAJT', label: 'Sajtok' },
  { id: 'FRISS', label: 'Frissáru' },
  { id: 'EGYEB', label: 'Egyéb' },
];

const PartnerNewOrder: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{id: string, qty: number}[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Helpers ---
  
  const filteredProducts = useMemo(() => {
    return CATALOG.filter(p => {
      const matchCat = activeCategory === 'ALL' || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const prod = CATALOG.find(p => p.id === item.id);
      return acc + (prod ? prod.price * item.qty : 0);
    }, 0);
  }, [cart]);

  const handleUpdateCart = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== productId);
        return prev.map(i => i.id === productId ? { ...i, qty: newQty } : i);
      } else if (delta > 0) {
        return [...prev, { id: productId, qty: delta }];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (cart.length === 0) return;
    setIsSuccess(true);
    setTimeout(() => {
      setCart([]);
      setIsSuccess(false);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in text-center p-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Rendelés Elküldve!</h2>
        <p className="text-slate-500 max-w-sm">
          Köszönjük a rendelést. Hamarosan küldjük a visszaigazolást emailben.
          <br/>
          Rendelés azonosító: <strong>#ORD-WEB-{Math.floor(Math.random()*1000)}</strong>
        </p>
        <button onClick={() => setIsSuccess(false)} className="mt-8 text-blue-600 font-bold hover:underline">
          Vissza a termékekhez
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in">
      
      {/* Header & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Új Rendelés</h2>
            <p className="text-sm text-slate-500">Válogass termékeink közül</p>
          </div>
          <div className="w-full md:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Termék keresése..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide mt-4 pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap
                ${activeCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const inCart = cart.find(i => i.id === product.id);
            const qty = inCart ? inCart.qty : 0;

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between transition hover:shadow-md">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-4xl bg-slate-50 p-2 rounded-lg">{product.image}</div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-slate-800">{product.price.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">RON / db</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-700 leading-tight mb-1">{product.name}</h3>
                  <div className="text-xs text-slate-400 font-mono mb-4">{product.sku}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-1 flex items-center justify-between">
                  <button 
                    onClick={() => handleUpdateCart(product.id, -1)}
                    disabled={qty === 0}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Minus size={18} />
                  </button>
                  <span className={`font-bold text-lg ${qty > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                    {qty}
                  </span>
                  <button 
                    onClick={() => handleUpdateCart(product.id, 1)}
                    className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded shadow-sm text-white hover:bg-blue-700 transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 animate-slide-up z-50">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-slate-800 p-2 rounded-xl mr-3 relative">
                <ShoppingCart size={24} className="text-blue-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-bold">Összesen</div>
                <div className="text-xl font-bold">{cartTotal.toLocaleString()} RON</div>
              </div>
            </div>
            
            <button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center transition shadow-lg shadow-blue-900/50"
            >
              Rendelés <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerNewOrder;
