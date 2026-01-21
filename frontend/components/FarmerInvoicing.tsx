
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  TrendingUp,
  FileOutput,
  Info,
  ArrowRight,
  Settings2,
  Check,
  User,
  RotateCcw,
  Zap,
  Loader2,
  FileDown
} from 'lucide-react';
import { Supplier } from '../types';

// Mock Gazda adatok (Számlázási beállításokkal) - UPDATED: No contract fields
const INITIAL_FARMERS: Supplier[] = [
  { 
    id: 'sup1', name: 'Kovács István E.V.', cui: '19870512-112233', legalType: 'INDIVIDUAL',
    exploitationCode: 'RO12345', apiaCode: 'API-99', hasSubsidy8: true, bankName: 'OTP', bankBranch: 'Csík', iban: 'RO12',
    type: 'FARMER', address: 'Csíkszereda', phone: '0740', status: 'ACTIVE',
    invoiceSeries: 'KIV', nextInvoiceNumber: 145
  },
  { 
    id: 'sup2', name: 'Nagy Béla', cui: 'RO888777', legalType: 'INDIVIDUAL',
    exploitationCode: 'RO555', apiaCode: 'API-10', hasSubsidy8: false, bankName: 'BT', bankBranch: 'Csík', iban: 'RO88',
    type: 'FARMER', address: 'Madaras', phone: '0741', status: 'ACTIVE',
    invoiceSeries: 'NB', nextInvoiceNumber: 22
  },
  { 
    id: 'sup3', name: 'Zöld Mező Bt.', cui: 'RO112233', legalType: 'COMPANY',
    exploitationCode: 'RO111', apiaCode: 'API-05', hasSubsidy8: true, bankName: 'BCR', bankBranch: 'Udvarhely', iban: 'RO44',
    type: 'COLLECTION_POINT', address: 'Keresztúr', phone: '0742', status: 'ACTIVE',
    invoiceSeries: 'ZM', nextInvoiceNumber: 89
  }
];

// Mock Begyűjtési adatok az adott hónapra (Összesítve)
// Note: price is now hardcoded for mock or would be fetched from Contract service in real app
const MONTHLY_TOTALS = [
  { supplierId: 'sup1', volume: 1420, avgFat: 3.85, avgProtein: 3.32, basePrice: 2.10 },
  { supplierId: 'sup2', volume: 750, avgFat: 3.70, avgProtein: 3.10, basePrice: 2.05 },
  { supplierId: 'sup3', volume: 11800, avgFat: 3.90, avgProtein: 3.40, basePrice: 2.15 },
];

const FarmerInvoicing: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2023-10');
  const [farmers, setFarmers] = useState<Supplier[]>(INITIAL_FARMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [completedInvoices, setCompletedInvoices] = useState<string[]>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  const filteredData = useMemo(() => {
    return farmers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(f => {
        const stats = MONTHLY_TOTALS.find(m => m.supplierId === f.id);
        const volume = stats?.volume || 0;
        const price = stats?.basePrice || 2.0;
        const netValue = volume * price;
        const vatValue = f.hasSubsidy8 ? netValue * 0.08 : netValue * 0.09; 
        return {
          ...f,
          monthlyVolume: volume,
          basePrice: price,
          netValue,
          vatValue,
          grossValue: netValue + vatValue,
          avgFat: stats?.avgFat || 0,
          avgProtein: stats?.avgProtein || 0
        };
      });
  }, [farmers, searchTerm]);

  const pendingCount = useMemo(() => {
    return filteredData.filter(f => !completedInvoices.includes(f.id)).length;
  }, [filteredData, completedInvoices]);

  const handleGenerate = (farmerId: string) => {
    setGeneratingId(farmerId);
    
    // Szimulált generálás és sorszám növelés
    setTimeout(() => {
      setFarmers(prev => prev.map(f => {
        if (f.id === farmerId) {
          return { ...f, nextInvoiceNumber: (f.nextInvoiceNumber || 0) + 1 };
        }
        return f;
      }));
      setCompletedInvoices(prev => [...prev, farmerId]);
      setGeneratingId(null);
    }, 1000);
  };

  const handleGenerateAll = async () => {
    if (!window.confirm(`Biztosan legenerálja az összes (${pendingCount} db) hiányzó számlát erre a hónapra?`)) return;
    
    setIsBulkGenerating(true);
    const toGenerate = filteredData.filter(f => !completedInvoices.includes(f.id));
    
    for (const farmer of toGenerate) {
      setGeneratingId(farmer.id);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setFarmers(prev => prev.map(f => {
        if (f.id === farmer.id) {
          return { ...f, nextInvoiceNumber: (f.nextInvoiceNumber || 0) + 1 };
        }
        return f;
      }));
      setCompletedInvoices(prev => [...prev, farmer.id]);
    }
    
    setGeneratingId(null);
    setIsBulkGenerating(false);
  };

  const handleDownloadPDF = (farmer: any) => {
    setDownloadingId(farmer.id);
    
    // Szimulált PDF generálás és letöltés trigger
    setTimeout(() => {
      const fileName = `Szamla_${farmer.invoiceSeries}_${farmer.nextInvoiceNumber - 1}_${farmer.name.replace(/ /g, '_')}.pdf`;
      const dummyContent = `
        BOMILACT TEJÜZEM - ELszámolási bizonylat
        --------------------------------------
        Időszak: ${selectedMonth}
        Gazda: ${farmer.name}
        CUI: ${farmer.cui}
        
        Tejmennyiség: ${farmer.monthlyVolume} L
        Átlag Zsír: ${farmer.avgFat}%
        Ár: ${farmer.basePrice} RON/L
        
        Nettó érték: ${farmer.netValue.toFixed(2)} RON
        ÁFA: ${farmer.vatValue.toFixed(2)} RON
        BRUTTÓ: ${farmer.grossValue.toFixed(2)} RON
      `;
      
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      
      setDownloadingId(null);
    }, 1200);
  };

  const handleDownloadReport = () => {
    alert("Havi összesített elszámolás generálása folyamatban... (Összesen: " + completedInvoices.length + " számla)");
  };

  const handleResetInvoice = (farmerId: string) => {
    if (window.confirm("Biztosan visszavonja a generált státuszt? Ez lehetővé teszi az adatok újbóli ellenőrzését és a számla újragenerálását.")) {
       setCompletedInvoices(prev => prev.filter(id => id !== farmerId));
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* 1. Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileOutput className="text-blue-600" size={24} />
            Gazda Számlázási Szerviz
          </h2>
          <p className="text-sm text-slate-500">Havi tejelszámolások és önszámlázás kezelése</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="month" 
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
               className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>

          <button 
             onClick={handleDownloadReport}
             disabled={completedInvoices.length === 0}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition disabled:opacity-50"
          >
             <FileDown size={18} />
             Havi Riport (PDF)
          </button>

          <button 
            disabled={pendingCount === 0 || isBulkGenerating}
            onClick={handleGenerateAll}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg
              ${pendingCount === 0 
                ? 'bg-slate-100 text-slate-400 shadow-none border border-slate-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'}
              ${isBulkGenerating ? 'animate-pulse' : ''}
            `}
          >
            {isBulkGenerating ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            {isBulkGenerating ? 'Feldolgozás...' : 'Összes Generálása'}
          </button>
        </div>
      </div>

      {/* 2. Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-500 font-black uppercase mb-1">Havi Össz. Volumen</p>
            <div className="text-2xl font-black text-blue-900">
               {MONTHLY_TOTALS.reduce((a, b) => a + b.volume, 0).toLocaleString()} L
            </div>
         </div>
         <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Fizetendő Bruttó</p>
            <div className="text-2xl font-black text-emerald-900">
               {filteredData.reduce((a, b) => a + b.grossValue, 0).toLocaleString()} RON
            </div>
         </div>
         <div className="bg-slate-900 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-center">
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-400 uppercase">Számlázási haladás</span>
               <span className="text-xs font-black">{completedInvoices.length} / {filteredData.length} kész</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
               <div className="bg-blue-500 h-full transition-all duration-500" style={{width: `${(completedInvoices.length / Math.max(1, filteredData.length)) * 100}%`}}></div>
            </div>
         </div>
      </div>

      {/* 3. Toolbar (Search) */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Gazda keresése a listában..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
        />
      </div>

      {/* 4. Invoicing Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">Kállító (Gazda)</th>
                <th className="px-6 py-4 text-center">Mennyiség</th>
                <th className="px-6 py-4">Számla Sorszám</th>
                <th className="px-6 py-4 text-right">Érték (Bruttó)</th>
                <th className="px-6 py-4">Státusz</th>
                <th className="px-6 py-4 text-right">Művelet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const isDone = completedInvoices.includes(row.id);
                const isGenerating = generatingId === row.id;
                const isDownloading = downloadingId === row.id;

                return (
                  <tr key={row.id} className={`hover:bg-slate-50/50 transition group ${isGenerating ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${isGenerating ? 'bg-blue-600 text-white animate-bounce' : 'bg-slate-100 text-slate-600'}`}>
                           <User size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{row.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{row.cui}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 text-base">
                      {row.monthlyVolume.toLocaleString()} L
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                            {row.invoiceSeries} - {isDone ? (row.nextInvoiceNumber || 0) - 1 : row.nextInvoiceNumber}
                         </span>
                         <button className="text-slate-300 hover:text-blue-500 transition">
                            <Settings2 size={14} />
                         </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="font-black text-blue-700 text-base">{row.grossValue.toFixed(2)} RON</div>
                       <div className="text-[10px] text-slate-400">Ár: {row.basePrice} RON/L</div>
                    </td>
                    <td className="px-6 py-4">
                       {isDone ? (
                         <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black border border-green-100">
                            <Check size={10} className="mr-1" /> KÉSZ
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-100">
                            TERVEZETT
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {!isDone ? (
                            <button 
                               disabled={isGenerating || isBulkGenerating}
                               onClick={() => handleGenerate(row.id)}
                               className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm bg-blue-600 text-white hover:bg-blue-700
                                  ${isGenerating ? 'animate-pulse' : ''}
                                  ${isBulkGenerating ? 'opacity-50 grayscale' : ''}
                               `}
                            >
                               {isGenerating ? 'Generálás...' : 'Számla Generálás'}
                               {!isGenerating && <ArrowRight size={14} />}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                               <button 
                                  disabled={isBulkGenerating || isDownloading}
                                  onClick={() => handleDownloadPDF(row)}
                                  className={`p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200 shadow-sm ${isDownloading ? 'animate-spin' : ''}`}
                                  title="PDF Letöltése"
                               >
                                  {isDownloading ? <Loader2 size={16} /> : <Download size={16} />}
                               </button>
                               <button 
                                  disabled={isBulkGenerating}
                                  onClick={() => handleResetInvoice(row.id)}
                                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition border border-slate-200"
                                  title="Számla státusz visszaállítása / Újragenerálás"
                               >
                                  <RotateCcw size={16} />
                                </button>
                               <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition shadow-sm border border-slate-200">
                                  <Printer size={16} />
                                </button>
                            </div>
                          )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
             <div className="p-12 text-center text-slate-400 italic">Nincs adat.</div>
          )}
        </div>
      </div>

      {/* 5. Help / Info */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-4">
         <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Info size={20} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-blue-800">Tipp az önszámlázáshoz</h4>
            <p className="text-xs text-blue-600 mt-1 leading-relaxed">
               A <strong>"Összes Generálása"</strong> gomb segítségével egy kattintással elvégezheti az összes várakozó gazda havi elszámolását. Generálás után a bizonylatok PDF-ben letölthetőek vagy közvetlenül nyomtathatóak. A havi összesítő gombbal pedig egyetlen listát kaphat az összes kifizetésről.
            </p>
         </div>
      </div>

    </div>
  );
};

export default FarmerInvoicing;
