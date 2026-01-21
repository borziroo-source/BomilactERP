
import React from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText 
} from 'lucide-react';

const PartnerProfile: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="h-24 bg-gradient-to-r from-slate-800 to-blue-900"></div>
        <div className="px-6 pb-6">
          <div className="relative -mt-10 mb-4 flex justify-between items-end">
            <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white">
              S
            </div>
            <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
              Adatok Módosítása
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sarki Kisbolt Kft.</h2>
            <p className="text-slate-500">Retail Partner • Aktív 2020 óta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <Building size={18} className="mr-2 text-slate-400" /> Cégadatok
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Cégnév</div>
              <div className="col-span-2 font-medium text-slate-800">Sarki Kisbolt Kereskedelmi Kft.</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Adószám (CUI)</div>
              <div className="col-span-2 font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded w-fit">RO12345678</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Regisztrációs Szám</div>
              <div className="col-span-2 font-medium text-slate-800">J19/123/2020</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Cím</div>
              <div className="col-span-2 font-medium text-slate-800 flex items-start">
                <MapPin size={14} className="mr-1 mt-0.5 text-slate-400" />
                535600 Székelyudvarhely, Kossuth Lajos u. 5.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <User size={18} className="mr-2 text-slate-400" /> Kapcsolattartás
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Kapcsolattartó</div>
              <div className="col-span-2 font-medium text-slate-800">Szabó Péter</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Telefon</div>
              <div className="col-span-2 font-medium text-blue-600 flex items-center">
                <Phone size={14} className="mr-2" /> +40 755 123 456
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500">Email</div>
              <div className="col-span-2 font-medium text-blue-600 flex items-center">
                <Mail size={14} className="mr-2" /> rendeles@sarkikisbolt.ro
              </div>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <FileText size={18} className="mr-2 text-slate-400" /> Szerződés & Ügynök
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-sm">
                <div className="text-slate-500">Szerződés Száma</div>
                <div className="font-mono font-bold text-slate-700">CTR-2020/055</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-slate-500">Fizetési Határidő</div>
                <div className="font-bold text-slate-800">15 Nap</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 uppercase font-bold mb-3">Kirendelt Ügynök</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                  ÜP
                </div>
                <div>
                  <div className="font-bold text-slate-800">Ügynök Péter</div>
                  <div className="text-xs text-slate-500">Területi Képviselő • +40 740 999 888</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PartnerProfile;
