import React from 'react';
import { Construction, ArrowRight } from 'lucide-react';

interface EmptyModuleProps {
  title: string;
  description?: string;
}

const EmptyModule: React.FC<EmptyModuleProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <Construction size={64} className="text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md mb-8">
        {description || "Ez a modul jelenleg fejlesztés alatt áll. A Bomilact Core v2 funkciói hamarosan elérhetőek lesznek."}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left">
         <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-slate-700 flex items-center">
              <ArrowRight size={16} className="mr-2 text-blue-500" />
              Tervezett Funkció
            </h4>
            <p className="text-sm text-slate-500 mt-1">Teljes adatbázis integráció és valós idejű szinkronizáció a szerverrel.</p>
         </div>
         <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-slate-700 flex items-center">
               <ArrowRight size={16} className="mr-2 text-blue-500" />
               AI Elemzés
            </h4>
            <p className="text-sm text-slate-500 mt-1">SAGA adatfeldolgozás és automatikus eltérés figyelés.</p>
         </div>
      </div>
    </div>
  );
};

export default EmptyModule;
