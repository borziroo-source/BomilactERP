
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Filter, 
  Save, 
  X, 
  Globe,
  Database,
  Store,
  ShoppingCart,
  Coffee,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';

// --- Types ---

type PartnerType = 'RETAIL' | 'WHOLESALE' | 'HORECA' | 'KEY_ACCOUNT';

interface Partner {
  id: string;
  name: string;
  cui: string; // Adószám
  regNo: string; // Cégjegyzékszám
  type: PartnerType;
  address: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  
  // Financial & Sales
  paymentTermDays: number;
  creditLimit: number;
  currentDebt: number;
  priceList: 'STANDARD' | 'VIP' | 'DISTRIBUTOR';
  sagaId: string; // Accounting ID
}

// --- Mock Data ---

const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'p-001',
    name: 'Merkúr Supermarket Kft.',
    cui: 'RO12345678',
    regNo: 'J19/123/2005',
    type: 'KEY_ACCOUNT',
    city: 'Csíkszereda',
    address: 'Hargita u. 10.',
    contactPerson: 'Kovács Éva',
    phone: '+40 740 111 222',
    email: 'beszerzes@merkur.ro',
    status: 'ACTIVE',
    paymentTermDays: 30,
    creditLimit: 50000,
    currentDebt: 12500,
    priceList: 'VIP',
    sagaId: '411.001'
  },
  {
    id: 'p-002',
    name: 'Sarki Kisbolt - Szabó Egyéni Vállalkozó',
    cui: 'RO87654321',
    regNo: 'F19/55/2010',
    type: 'RETAIL',
    city: 'Székelyudvarhely',
    address: 'Kossuth Lajos u. 5.',
    contactPerson: 'Szabó Péter',
    phone: '+40 755 333 444',
    email: 'szabopeter@gmail.com',
    status: 'ACTIVE',
    paymentTermDays: 7,
    creditLimit: 5000,
    currentDebt: 1200,
    priceList: 'STANDARD',
    sagaId: '411.055'
  },
  {
    id: 'p-003',
    name: 'Hotel Transilvania',
    cui: 'RO99887766',
    regNo: 'J19/88/2018',
    type: 'HORECA',
    city: 'Gyergyószentmiklós',
    address: 'Fő tér 1.',
    contactPerson: 'Recepció / Konyha',
    phone: '+40 266 100 200',
    email: 'info@hoteltrans.ro',
    status: 'ACTIVE',
    paymentTermDays: 15,
    creditLimit: 10000,
    currentDebt: 0,
    priceList: 'STANDARD',
    sagaId: '411.088'
  },
  {
    id: 'p-004',
    name: 'Agro-West Disztribúció',
    cui: 'RO11223344',
    regNo: 'J20/12/2000',
    type: 'WHOLESALE',
    city: 'Marosvásárhely',
    address: 'Raktár utca 44.',
    contactPerson: 'Nagy Zsolt',
    phone: '+40 722 987 654',
    email: 'zsolt@agrowest.ro',
    status: 'INACTIVE',
    paymentTermDays: 45,
    creditLimit: 100000,
    currentDebt: 0,
    priceList: 'DISTRIBUTOR',
    sagaId: '411.012'
  }
];

const PartnerManagement: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PartnerType | 'ALL'>('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner>>({});
  const [isEditing, setIsEditing] = useState(false);

  // --- Filtering ---
  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.cui.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [partners, searchTerm, filterType]);

  // --- Handlers ---
  const handleAddNew = () => {
    setCurrentPartner({
      status: 'ACTIVE',
      paymentTermDays: 15,
      creditLimit: 0,
      currentDebt: 0,
      priceList: 'STANDARD',
      type: 'RETAIL'
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setCurrentPartner({ ...partner });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a partnert?')) {
      setPartners(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner.name || !currentPartner.cui) return;

    const partnerToSave = {
      ...currentPartner,
      id: currentPartner.id || `p-${Date.now()}`
    } as Partner;

    if (isEditing) {
      setPartners(prev => prev.map(p => p.id === partnerToSave.id ? partnerToSave : p));
    } else {
      setPartners([...partners, partnerToSave]);
    }
    setIsModalOpen(false);
  };

  // --- Helpers ---
  const getTypeBadge = (type: PartnerType) => {
    switch(type) {
      case 'RETAIL': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200"><Store size={12} className="mr-1"/> KISKER</span>;
      case 'WHOLESALE': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Truck size={12} className="mr-1"/> NAGYKER</span>;
      case 'KEY_ACCOUNT': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200"><ShoppingCart size={12} className="mr-1"/> ÜZLETLÁNC</span>;
      case 'HORECA': return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200"><Coffee size={12} className="mr-1"/> HORECA</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Partnertörzs (Vevők)</h2>
          <p className="text-sm text-slate-500">Kereskedelmi partnerek, boltok és viszonteladók kezelése</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cégnév, CUI, Város..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Új Partner
          </button>
        </div>
      </div>

      {/* Stats / Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-3 flex space-x-2 bg-white p-2 rounded-xl border border-slate-100 overflow-x-auto scrollbar-hide">
            <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>Összes</button>
            <button onClick={() => setFilterType('RETAIL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'RETAIL' ? 'bg-green-100 text-green-800' : 'hover:bg-slate-50 text-slate-600'}`}>Kisker</button>
            <button onClick={() => setFilterType('KEY_ACCOUNT')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'KEY_ACCOUNT' ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-50 text-slate-600'}`}>Láncok</button>
            <button onClick={() => setFilterType('HORECA')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'HORECA' ? 'bg-orange-100 text-orange-800' : 'hover:bg-slate-50 text-slate-600'}`}>HoReCa</button>
            <button onClick={() => setFilterType('WHOLESALE')} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === 'WHOLESALE' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}>Nagyker</button>
         </div>
         <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Aktív Partnerek</span>
            <span className="text-xl font-black text-slate-800">{partners.filter(p => p.status === 'ACTIVE').length}</span>
         </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Cégnév / Adószám</th>
                <th className="px-6 py-4">Típus</th>
                <th className="px-6 py-4">Elérhetőség</th>
                <th className="px-6 py-4">Pénzügyi Infó</th>
                <th className="px-6 py-4">Státusz</th>
                <th className="px-6 py-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.map(partner => (
                <tr key={partner.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{partner.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1 flex items-center">
                       <CreditCard size={10} className="mr-1" /> {partner.cui} 
                       <span className="mx-2">•</span>
                       <Database size={10} className="mr-1" /> {partner.sagaId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(partner.type)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center mb-1"><MapPin size={12} className="mr-1.5 text-slate-400"/> {partner.city}, {partner.address}</div>
                    <div className="flex items-center mb-1"><Building size={12} className="mr-1.5 text-slate-400"/> {partner.contactPerson}</div>
                    <div className="flex items-center"><Phone size={12} className="mr-1.5 text-slate-400"/> {partner.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                       <div className="text-xs text-slate-500">
                          Fizetés: <span className="font-bold text-slate-700">{partner.paymentTermDays} nap</span>
                       </div>
                       <div className="text-xs text-slate-500">
                          Árlista: <span className="font-bold text-blue-600">{partner.priceList}</span>
                       </div>
                       {partner.currentDebt > 0 && (
                          <div className="text-xs text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded w-fit mt-1">
                             Tartozás: {partner.currentDebt.toLocaleString()} RON
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {partner.status === 'ACTIVE' ? (
                       <span className="flex items-center text-green-600 text-xs font-bold"><CheckCircle size={14} className="mr-1"/> Aktív</span>
                    ) : (
                       <span className="flex items-center text-slate-400 text-xs font-bold"><XCircle size={14} className="mr-1"/> Inaktív</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleEdit(partner)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(partner.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPartners.length === 0 && (
             <div className="p-8 text-center text-slate-400">Nincs találat a keresési feltételeknek megfelelően.</div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-slate-800 p-4 text-white flex justify-between items-center sticky top-0 z-10">
                 <h3 className="font-bold flex items-center">
                    <Building className="mr-2 text-blue-400" />
                    {isEditing ? 'Partner Szerkesztése' : 'Új Partner Felvétele'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={18}/></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                 
                 {/* Basic Info */}
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center border-b pb-2">
                       <Building size={14} className="mr-1"/> Cégadatok
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="col-span-1 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cégnév *</label>
                          <input type="text" required value={currentPartner.name} onChange={(e) => setCurrentPartner({...currentPartner, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Adószám (CUI) *</label>
                          <input type="text" required value={currentPartner.cui} onChange={(e) => setCurrentPartner({...currentPartner, cui: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cégjegyzékszám</label>
                          <input type="text" value={currentPartner.regNo} onChange={(e) => setCurrentPartner({...currentPartner, regNo: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Partner Típus</label>
                          <select value={currentPartner.type} onChange={(e) => setCurrentPartner({...currentPartner, type: e.target.value as PartnerType})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                             <option value="RETAIL">Kisker (Bolt)</option>
                             <option value="WHOLESALE">Nagyker (Disztribútor)</option>
                             <option value="KEY_ACCOUNT">Üzletlánc (KA)</option>
                             <option value="HORECA">HoReCa (Hotel/Étterem)</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Státusz</label>
                          <select value={currentPartner.status} onChange={(e) => setCurrentPartner({...currentPartner, status: e.target.value as any})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                             <option value="ACTIVE">Aktív</option>
                             <option value="INACTIVE">Inaktív</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 {/* Contact Info */}
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center border-b pb-2">
                       <MapPin size={14} className="mr-1"/> Elérhetőség
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Város</label>
                          <input type="text" value={currentPartner.city} onChange={(e) => setCurrentPartner({...currentPartner, city: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cím (Utca, Hsz)</label>
                          <input type="text" value={currentPartner.address} onChange={(e) => setCurrentPartner({...currentPartner, address: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kapcsolattartó Neve</label>
                          <input type="text" value={currentPartner.contactPerson} onChange={(e) => setCurrentPartner({...currentPartner, contactPerson: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefonszám</label>
                          <input type="text" value={currentPartner.phone} onChange={(e) => setCurrentPartner({...currentPartner, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div className="col-span-1 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Cím</label>
                          <input type="email" value={currentPartner.email} onChange={(e) => setCurrentPartner({...currentPartner, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                    </div>
                 </div>

                 {/* Financials */}
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center border-b pb-2">
                       <CreditCard size={14} className="mr-1"/> Pénzügy & Integráció
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Fizetési Határidő (Nap)</label>
                          <input type="number" value={currentPartner.paymentTermDays} onChange={(e) => setCurrentPartner({...currentPartner, paymentTermDays: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Hitelkeret (RON)</label>
                          <input type="number" value={currentPartner.creditLimit} onChange={(e) => setCurrentPartner({...currentPartner, creditLimit: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Árlista Kategória</label>
                          <select value={currentPartner.priceList} onChange={(e) => setCurrentPartner({...currentPartner, priceList: e.target.value as any})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                             <option value="STANDARD">Standard</option>
                             <option value="VIP">VIP</option>
                             <option value="DISTRIBUTOR">Disztribútor</option>
                          </select>
                       </div>
                       <div className="col-span-1 md:col-span-3">
                          <label className="block text-sm font-medium text-slate-700 mb-1">SAGA Azonosító (Könyvelés)</label>
                          <input type="text" value={currentPartner.sagaId} onChange={(e) => setCurrentPartner({...currentPartner, sagaId: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="pl. 411.001" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 -mx-6 -mb-6 p-6">
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

export default PartnerManagement;
