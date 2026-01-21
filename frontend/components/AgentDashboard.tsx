import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  Clock,
  Wallet
} from 'lucide-react';

const AgentDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ügynök Vezérlőpult</h2>
          <p className="text-sm text-slate-500">Havi teljesítmény és mai útvonal</p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm mt-2 md:mt-0">
          Mai dátum: {new Date().toLocaleDateString('hu-HU')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Havi Eladás</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">45.200 RON</h3>
              <p className="text-xs text-green-600 font-medium mt-1">+12% a célhoz képest</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-100">
            <div className="h-full bg-blue-600" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Új Kliensek</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">3 db</h3>
              <p className="text-xs text-slate-400 mt-1">Havi cél: 5 db</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Begyűjtött Pénz</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">12.500 RON</h3>
              <p className="text-xs text-slate-400 mt-1">Mai napon</p>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Látogatások</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">8 / 12</h3>
              <p className="text-xs text-amber-600 mt-1">4 hátralévő</p>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <MapPin size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Route List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Mai Útvonalterv</h3>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Csíki Körút</span>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { time: '09:00', name: 'Merkúr Supermarket', city: 'Csíkszereda', status: 'DONE' },
              { time: '10:30', name: 'Sarki Kisbolt', city: 'Székelyudvarhely', status: 'DONE' },
              { time: '12:00', name: 'Hotel Transilvania', city: 'Gyergyó', status: 'PENDING' },
              { time: '14:00', name: 'Harmopan Pékség', city: 'Szereda', status: 'PENDING' },
            ].map((stop, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${stop.status === 'DONE' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <div className="text-sm font-mono text-slate-500 w-12">{stop.time}</div>
                  <div>
                    <div className="font-bold text-slate-800">{stop.name}</div>
                    <div className="text-xs text-slate-500 flex items-center">
                      <MapPin size={10} className="mr-1"/> {stop.city}
                    </div>
                  </div>
                </div>
                <div>
                  {stop.status === 'DONE' ? (
                    <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-2 py-1 rounded"><CheckCircle size={12} className="mr-1"/> Kész</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded"><Clock size={12} className="mr-1"/> Vár</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-1">Új Lehetőség?</h3>
            <p className="text-blue-100 text-sm mb-4">Rögzíts új potenciális partnert a rendszerben azonnal.</p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-50 transition">
              + Partner Felvétele
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase">Friss Üzenetek</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-200">
                <div className="font-bold text-slate-700 text-xs mb-1">Kovács János (Gyártás)</div>
                <p className="text-slate-600">A füstölt sajt készlet alacsony, kérlek jelezd a partnereknek a hosszabb szállítási időt.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentDashboard;