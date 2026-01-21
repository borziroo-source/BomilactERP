import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  CheckCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  CreditCard,
  Banknote
} from 'lucide-react';

const DEBTORS = [
  { 
    id: 'd1', 
    name: 'Sarki Kisbolt', 
    totalDebt: 1250, 
    invoices: [
      { id: 'INV-001', date: '2023-10-01', amount: 500, due: '2023-10-15' }, // Overdue
      { id: 'INV-005', date: '2023-10-20', amount: 750, due: '2023-11-04' },
    ]
  },
  { 
    id: 'd2', 
    name: 'Restaurant Bradul', 
    totalDebt: 4500, 
    invoices: [
      { id: 'INV-002', date: '2023-09-20', amount: 2000, due: '2023-10-05' }, // Overdue
      { id: 'INV-003', date: '2023-10-10', amount: 2500, due: '2023-10-25' }, // Overdue
    ]
  },
  { 
    id: 'd3', 
    name: 'Mini Market Zsófia', 
    totalDebt: 300, 
    invoices: [
      { id: 'INV-008', date: '2023-10-25', amount: 300, due: '2023-11-08' },
    ]
  },
];

const AgentFinance: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHECK'>('CASH');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setPaymentAmount('');
  };

  const handleCollect = (debtorName: string) => {
    if (!paymentAmount) return;
    alert(`Sikeres befizetés rögzítve!\nPartner: ${debtorName}\nÖsszeg: ${paymentAmount} RON\nMód: ${paymentMethod === 'CASH' ? 'Készpénz' : 'Csekk'}`);
    setPaymentAmount('');
    setExpandedId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Kintlévőségek & Beszedés</h2>
        <p className="text-sm text-slate-500">Nyitott számlák kezelése</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Partner keresése..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        {DEBTORS.map(debtor => {
          const isExpanded = expandedId === debtor.id;
          const overdueCount = debtor.invoices.filter(i => new Date(i.due) < new Date()).length;

          return (
            <div key={debtor.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all">
              <div 
                onClick={() => toggleExpand(debtor.id)}
                className="p-4 flex justify-between items-center cursor-pointer active:bg-slate-50"
              >
                <div>
                  <h3 className="font-bold text-slate-800">{debtor.name}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center">
                    <FileText size={12} className="mr-1" /> {debtor.invoices.length} nyitott számla
                    {overdueCount > 0 && <span className="ml-2 text-red-600 font-bold">({overdueCount} lejárt)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-800">{debtor.totalDebt.toLocaleString()} RON</span>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 p-4 border-t border-slate-100 animate-slide-down">
                  {/* Invoice List */}
                  <div className="space-y-2 mb-4">
                    {debtor.invoices.map(inv => {
                      const isOverdue = new Date(inv.due) < new Date();
                      return (
                        <div key={inv.id} className="flex justify-between text-sm p-2 bg-white rounded border border-slate-200">
                          <div>
                            <div className="font-mono font-bold text-slate-600">{inv.id}</div>
                            <div className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                              Határidő: {inv.due} {isOverdue ? '(LEJÁRT)' : ''}
                            </div>
                          </div>
                          <div className="font-bold text-slate-700">{inv.amount} RON</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Form */}
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Befizetés Rögzítése</label>
                    
                    <div className="flex gap-2 mb-3">
                      <button 
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex-1 py-2 rounded text-xs font-bold flex items-center justify-center border ${paymentMethod === 'CASH' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        <Banknote size={14} className="mr-1" /> Készpénz
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('CHECK')}
                        className={`flex-1 py-2 rounded text-xs font-bold flex items-center justify-center border ${paymentMethod === 'CHECK' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                      >
                        <CreditCard size={14} className="mr-1" /> Csekk / BO
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Összeg (RON)" 
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold"
                      />
                      <button 
                        onClick={() => handleCollect(debtor.name)}
                        className="bg-green-600 text-white px-4 rounded-lg font-bold shadow-sm active:scale-95 transition"
                      >
                        <CheckCircle />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentFinance;