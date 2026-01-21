import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  ChevronRight, 
  Droplet, 
  Thermometer, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Printer,
  ArrowLeft,
  Save,
  X,
  MapPin,
  Beaker,
  Truck
} from 'lucide-react';

// Mock data for suppliers on the route
const NEARBY_SUPPLIERS = [
  { id: 'sup1', name: 'Kovács István E.V.', address: 'Csíkszereda, Fő út 12.', contractId: 'CTR-2023/001' },
  { id: 'sup3', name: 'Csarnok - Csíkszentdomokos', address: 'Csíkszentdomokos, Alvég 44.', contractId: 'INT-LOC-005' },
  { id: 'sup5', name: 'Tusnád Farm Kft.', address: 'Tusnádfürdő, Állomás köz 2.', contractId: 'CTR-2023/099' },
];

type CollectionStep = 'SELECT_PARTNER' | 'QUALITY_CHECK' | 'QUANTITY_INPUT' | 'SUMMARY' | 'SUCCESS';

const DriverCollection: React.FC = () => {
  const [step, setStep] = useState<CollectionStep>('SELECT_PARTNER');
  const [selectedPartner, setSelectedPartner] = useState<typeof NEARBY_SUPPLIERS[0] | null>(null);
  
  // Form Data
  const [temperature, setTemperature] = useState<string>('');
  const [ph, setPh] = useState<string>('6.6');
  const [sensoryCheck, setSensoryCheck] = useState<boolean>(true);
  const [antibioticNegative, setAntibioticNegative] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<string>('');
  const [sampleId, setSampleId] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers ---

  const handlePartnerSelect = (partner: typeof NEARBY_SUPPLIERS[0]) => {
    setSelectedPartner(partner);
    setSampleId(`SMP-${Math.floor(Math.random() * 10000)}`); // Auto-generate sample ID
    setStep('QUALITY_CHECK');
  };

  const handleScanQR = () => {
    // Mock QR Scan
    alert("Kamera indítása... (Szimuláció: Kovács István kiválasztva)");
    handlePartnerSelect(NEARBY_SUPPLIERS[0]);
  };

  const validateQuality = () => {
    const tempVal = parseFloat(temperature);
    if (!temperature || isNaN(tempVal)) {
      alert("Kérlek add meg a hőmérsékletet!");
      return;
    }
    if (tempVal > 10) {
      if (!window.confirm("FIGYELEM: A hőmérséklet magas (>10°C)! Biztosan folytatod?")) return;
    }
    if (!antibioticNegative) {
      alert("HIBA: Pozitív antibiotikum teszt esetén a tej nem vehető át!");
      return;
    }
    setStep('QUANTITY_INPUT');
  };

  const handleFinish = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep('SUCCESS');
    }, 1500);
  };

  const resetFlow = () => {
    setStep('SELECT_PARTNER');
    setSelectedPartner(null);
    setTemperature('');
    setPh('6.6');
    setQuantity('');
    setSensoryCheck(true);
    setAntibioticNegative(true);
  };

  // --- Render Steps ---

  // 1. SELECT PARTNER
  if (step === 'SELECT_PARTNER') {
    return (
      <div className="flex flex-col h-full bg-slate-100 animate-fade-in">
        {/* Mobile Header */}
        <div className="bg-slate-900 text-white p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
             <div>
               <h2 className="text-xl font-bold">Tejátvétel</h2>
               <p className="text-xs text-slate-400 flex items-center">
                 <Truck size={12} className="mr-1"/> HR-10-BOM (Jelenlegi járat)
               </p>
             </div>
             <button 
               onClick={handleScanQR}
               className="bg-blue-600 p-3 rounded-full shadow-lg active:scale-95 transition"
             >
               <QrCode size={24} />
             </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Partner keresése..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-900 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase ml-1 mb-2">Következő Megállók</h3>
          {NEARBY_SUPPLIERS.map(partner => (
            <button 
              key={partner.id}
              onClick={() => handlePartnerSelect(partner)}
              className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between active:bg-blue-50 transition"
            >
              <div className="text-left">
                <h4 className="text-lg font-bold text-slate-800">{partner.name}</h4>
                <div className="flex items-center text-slate-500 text-sm mt-1">
                  <MapPin size={14} className="mr-1" />
                  {partner.address}
                </div>
              </div>
              <ChevronRight className="text-slate-300" size={24} />
            </button>
          ))}
          
          <div className="mt-8 p-6 text-center text-slate-400">
            <p className="text-sm">Nincs több tervezett megálló a közelben.</p>
          </div>
        </div>
      </div>
    );
  }

  // Common Header for inner steps
  const InnerHeader = ({ title }: { title: string }) => (
    <div className="bg-white border-b border-slate-200 p-4 flex items-center shadow-sm z-10">
      <button onClick={() => {
        if (step === 'QUALITY_CHECK') setStep('SELECT_PARTNER');
        if (step === 'QUANTITY_INPUT') setStep('QUALITY_CHECK');
        if (step === 'SUMMARY') setStep('QUANTITY_INPUT');
      }} className="p-2 -ml-2 mr-2 text-slate-600 hover:bg-slate-100 rounded-full">
        <ArrowLeft size={24} />
      </button>
      <div>
        <h2 className="text-lg font-bold text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500">{selectedPartner?.name}</p>
      </div>
    </div>
  );

  // 2. QUALITY CHECK
  if (step === 'QUALITY_CHECK') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-slide-left">
        <InnerHeader title="1. Minőségellenőrzés" />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           {/* Antibiotic Check */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase flex items-center">
                 <TestTube size={16} className="mr-2 text-blue-500" />
                 Antibiotikum Gyorsteszt
              </label>
              <div className="flex space-x-2">
                 <button 
                   onClick={() => setAntibioticNegative(true)}
                   className={`flex-1 py-4 rounded-xl font-bold border-2 transition flex flex-col items-center justify-center ${antibioticNegative ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-400'}`}
                 >
                   <CheckCircle size={24} className="mb-1" />
                   NEGATÍV (OK)
                 </button>
                 <button 
                   onClick={() => setAntibioticNegative(false)}
                   className={`flex-1 py-4 rounded-xl font-bold border-2 transition flex flex-col items-center justify-center ${!antibioticNegative ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-400'}`}
                 >
                   <X size={24} className="mb-1" />
                   POZITÍV
                 </button>
              </div>
           </div>

           {/* Temperature & pH */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase flex items-center">
                       <Thermometer size={16} className="mr-2 text-red-500" />
                       Hőfok (°C)
                    </label>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="pl. 3.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className={`w-full text-center text-3xl font-bold p-4 rounded-xl border-2 focus:outline-none ${parseFloat(temperature) > 10 ? 'border-red-500 text-red-600 bg-red-50' : 'border-slate-200 text-slate-800 focus:border-blue-500'}`}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase flex items-center">
                       <Beaker size={16} className="mr-2 text-purple-500" />
                       pH Érték
                    </label>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      value={ph}
                      onChange={(e) => setPh(e.target.value)}
                      className="w-full text-center text-3xl font-bold p-4 rounded-xl border-2 border-slate-200 text-slate-800 focus:border-blue-500 focus:outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Sensory Check */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700">Érzékszervi Vizsgálat (Illat/Íz/Szín)</span>
              <div 
                onClick={() => setSensoryCheck(!sensoryCheck)}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${sensoryCheck ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${sensoryCheck ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
           </div>

        </div>

        <div className="p-4 bg-white border-t border-slate-200">
           <button 
             onClick={validateQuality}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center"
           >
             Tovább <ChevronRight className="ml-2" />
           </button>
        </div>
      </div>
    );
  }

  // 3. QUANTITY INPUT
  if (step === 'QUANTITY_INPUT') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-slide-left">
        <InnerHeader title="2. Mennyiség Rögzítése" />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
           
           <div className="w-full max-w-sm">
             <label className="block text-center text-slate-500 font-bold uppercase mb-4 tracking-wider">Mért Mennyiség (Liter)</label>
             <div className="relative">
               <input 
                 type="number" 
                 inputMode="numeric"
                 autoFocus
                 placeholder="0"
                 value={quantity}
                 onChange={(e) => setQuantity(e.target.value)}
                 className="w-full text-center text-4xl sm:text-6xl font-black py-8 rounded-2xl border-4 border-blue-100 text-blue-900 focus:border-blue-500 focus:outline-none shadow-sm bg-white"
               />
               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">L</span>
             </div>
             
             <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                   <span className="block text-xs font-bold text-blue-400 uppercase">Minta Azonosító</span>
                   <span className="font-mono font-bold text-blue-900 text-lg">{sampleId}</span>
                </div>
                <button className="bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                   Újragenerálás
                </button>
             </div>
           </div>

        </div>

        <div className="p-4 bg-white border-t border-slate-200">
           <button 
             disabled={!quantity}
             onClick={() => setStep('SUMMARY')}
             className="w-full bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center"
           >
             Áttekintés <ChevronRight className="ml-2" />
           </button>
        </div>
      </div>
    );
  }

  // 4. SUMMARY
  if (step === 'SUMMARY') {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-slide-left">
        <InnerHeader title="3. Összegzés" />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
              <h3 className="text-slate-500 font-bold text-sm uppercase mb-1">Beszállító</h3>
              <div className="text-xl font-bold text-slate-800">{selectedPartner?.name}</div>
              <div className="text-slate-400 text-sm mt-1">{selectedPartner?.address}</div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                 <div className="text-slate-400 text-xs font-bold uppercase mb-1">Mennyiség</div>
                 <div className="text-2xl font-black text-blue-600">{quantity} L</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                 <div className="text-slate-400 text-xs font-bold uppercase mb-1">Hőfok</div>
                 <div className="text-2xl font-black text-slate-700">{temperature} °C</div>
              </div>
           </div>

           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                 <span className="text-slate-500 font-medium">Antibiotikum</span>
                 <span className="font-bold text-green-600 flex items-center"><CheckCircle size={16} className="mr-1"/> Negatív</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                 <span className="text-slate-500 font-medium">pH Érték</span>
                 <span className="font-bold text-slate-700">{ph}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                 <span className="text-slate-500 font-medium">Érzékszervi</span>
                 <span className="font-bold text-green-600">Megfelelő</span>
              </div>
              <div className="flex justify-between items-center py-2">
                 <span className="text-slate-500 font-medium">Minta ID</span>
                 <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{sampleId}</span>
              </div>
           </div>

           {/* Signature Placeholder */}
           <div className="h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              Aláírás helye
           </div>

        </div>

        <div className="p-4 bg-white border-t border-slate-200">
           <button 
             onClick={handleFinish}
             disabled={isProcessing}
             className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center"
           >
             {isProcessing ? (
               <span className="animate-pulse">Mentés...</span>
             ) : (
               <>
                 <Save className="mr-2" /> Mentés & Nyomtatás
               </>
             )}
           </button>
        </div>
      </div>
    );
  }

  // 5. SUCCESS
  if (step === 'SUCCESS') {
    return (
      <div className="flex flex-col h-full bg-green-50 animate-scale-up items-center justify-center p-6 text-center">
         <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600 w-12 h-12" />
         </div>
         <h2 className="text-3xl font-bold text-slate-800 mb-2">Sikeres Átvétel!</h2>
         <p className="text-slate-600 mb-8 max-w-xs">
           Az adatok rögzítve a központi rendszerben. A bizonylat nyomtatása folyamatban.
         </p>
         
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm mb-8 transform -rotate-1">
            <div className="border-b border-dashed border-slate-300 pb-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-slate-800">Bizonylat #8821</span>
                 <span className="text-xs text-slate-400">MA 08:42</span>
              </div>
              <div className="text-xl font-black text-slate-800">{quantity} Liter</div>
              <div className="text-sm text-slate-500">{selectedPartner?.name}</div>
            </div>
            <div className="flex items-center justify-center text-blue-600 font-bold text-sm">
               <Printer size={16} className="mr-2" /> Nyomtatás kész
            </div>
         </div>

         <button 
           onClick={resetFlow}
           className="w-full max-w-sm bg-slate-900 text-white text-lg font-bold py-4 rounded-xl shadow-xl active:scale-95 transition"
         >
           Következő Beszállító
         </button>
      </div>
    );
  }

  return null;
};

export default DriverCollection;