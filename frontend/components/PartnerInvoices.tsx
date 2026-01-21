
import React from 'react';
import { 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle,
  CreditCard
} from 'lucide-react';

const INVOICES = [
  { id: 'INV-2023-8821', date: '2023-10-25', dueDate: '2023-11-24', amount: 1850.50, status: 'OPEN' },
  { id: 'INV-2023-8700', date: '2023-10-10', dueDate: '2023-11-09', amount: 420.00, status: 'OPEN' },
  { id: 'INV-2023-8550', date: '2023-09-30', dueDate: '2023-10-30', amount: 2100.00, status: 'PAID' },
  { id: 'INV-2023-8100', date: '2023-09-01', dueDate: '2023-10-01', amount: 150.00, status: 'OVERDUE' },
];

const PartnerInvoices: React.FC = () => {
  
  const totalDebt = INVOICES.filter(i => i.status !== 'PAID').reduce((acc, i) => acc + i.amount, 0);
  const overdueDebt = INVOICES.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase mb-1">Jelenlegi Tartozás</p>
              <h3 className="text-3xl font-black">{totalDebt.toLocaleString()} RON</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <CreditCard size={24} className="text-blue-300" />
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-400">
            Fizetési határidőn belüli és lejárt számlák összesen.
          </div>
        </div>

        {overdueDebt > 0 ? (
          <div className="bg-red-50 rounded-xl p-6 border border-red-100 shadow-sm flex flex-col justify-center">
             <div className="flex items-center text-red-600 font-bold mb-2">
               <AlertCircle size={20} className="mr-2" /> Lejárt Tartozás
             </div>
             <h3 className="text-3xl font-black text-red-700">{overdueDebt.toLocaleString()} RON</h3>
             <p className="text-sm text-red-600 mt-2">Kérjük rendezze a lejárt számlákat!</p>
          </div>
        ) : (
          <div className="bg-green-50 rounded-xl p-6 border border-green-100 shadow-sm flex flex-col justify-center">
             <div className="flex items-center text-green-600 font-bold mb-2">
               <CheckCircle size={20} className="mr-2" /> Státusz
             </div>
             <h3 className="text-2xl font-bold text-green-800">Nincs lejárt tartozás</h3>
             <p className="text-sm text-green-600 mt-1">Köszönjük a pontos fizetést!</p>
          </div>
        )}
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Számlák</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {INVOICES.map(inv => (
            <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition">
              
              <div className="flex items-center gap-4 mb-3 md:mb-0">
                <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{inv.id}</div>
                  <div className="text-sm text-slate-500">
                    Kelt: {inv.date} • <span className={inv.status === 'OVERDUE' ? 'text-red-600 font-bold' : ''}>Határidő: {inv.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className="text-right">
                  <div className="font-black text-slate-800 text-lg">{inv.amount.toLocaleString()} RON</div>
                  <div className="text-xs font-bold uppercase">
                    {inv.status === 'PAID' && <span className="text-green-600">Fizetve</span>}
                    {inv.status === 'OPEN' && <span className="text-blue-600">Nyitott</span>}
                    {inv.status === 'OVERDUE' && <span className="text-red-600">Lejárt</span>}
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Letöltés">
                  <Download size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PartnerInvoices;
