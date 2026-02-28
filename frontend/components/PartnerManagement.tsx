
import React, { useState, useEffect } from 'react';
import { usePermission } from '../hooks/usePermission';
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
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

// --- Types ---

interface Partner {
  id: number;
  name: string;
  taxNumber: string;
  exploitationCode: string;
  apiaCode: string;
  type: number;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
  supplierGroupId: number | null;
}

interface PaginatedResponse {
  items: Partner[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5197/api';
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/api')
  ? RAW_API_BASE_URL
  : `${RAW_API_BASE_URL.replace(/\/$/, '')}/api`;

const PartnerManagement: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const { canCreate, canUpdate, canDelete } = usePermission('sales', 'sales_partners');
  const [pagination, setPagination] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Fetch partners with pagination and search
  const fetchPartners = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { searchTerm: search })
      });
      
      const response = await fetch(`${API_BASE_URL}/partners/paginated?${params}`);
      const data: PaginatedResponse = await response.json();
      
      setPartners(data.items);
      setPagination(data);
      setPageNumber(page);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPartners(1, '');
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners(1, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- Handlers ---
  const handleAddNew = () => {
    setCurrentPartner({
      isActive: true,
      type: 0
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setCurrentPartner({ ...partner });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a partnert?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchPartners(pageNumber, searchTerm);
        } else {
          console.error('Error deleting partner');
        }
      } catch (error) {
        console.error('Error deleting partner:', error);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner.name || !currentPartner.taxNumber) return;

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/partners/${currentPartner.id}`
        : `${API_BASE_URL}/partners`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentPartner)
      });

      if (response.ok) {
        setIsModalOpen(false);
        await fetchPartners(pageNumber, searchTerm);
      } else {
        console.error('Error saving partner');
      }
    } catch (error) {
      console.error('Error saving partner:', error);
    }
  };

  // --- Helpers ---
  const getTypeBadge = (type: number) => {
    switch(type) {
      case 0: return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200"><ShoppingCart size={12} className="mr-1"/> VEVŐ</span>;
      case 1: return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200"><Truck size={12} className="mr-1"/> SZÁLLÍTÓ</span>;
      case 2: return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Store size={12} className="mr-1"/> MINDKETTŐ</span>;
      default: return <span className="text-slate-500">-</span>;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPartners(newPage, searchTerm);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Partnertörzs</h2>
          <p className="text-sm text-slate-500">Partnerek kezelése (szerveroldali keresés és paginálás)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cégnév, Adószám, Város..." 
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

      {/* Stats / Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
         <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase">Keresési eredmények</span>
         </div>
         <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Összesen</span>
            <span className="text-xl font-black text-slate-800">{pagination?.totalCount ?? 0}</span>
         </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-semibold">
                    <th className="px-6 py-4">Cégnév / Adószám</th>
                    <th className="px-6 py-4">Típus</th>
                    <th className="px-6 py-4">Elérhetőség</th>
                    <th className="px-6 py-4">Státusz</th>
                    <th className="px-6 py-4 text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.length > 0 ? (
                    partners.map(partner => (
                      <tr key={partner.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-base">{partner.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-1 flex items-center">
                             <CreditCard size={10} className="mr-1" /> {partner.taxNumber}
                             {partner.exploitationCode && (
                               <>
                                 <span className="mx-2">•</span>
                                 <Database size={10} className="mr-1" /> {partner.exploitationCode}
                               </>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getTypeBadge(partner.type)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {partner.city && <div className="flex items-center mb-1"><MapPin size={12} className="mr-1.5 text-slate-400"/> {partner.city}</div>}
                          {partner.contactPerson && <div className="flex items-center mb-1"><Building size={12} className="mr-1.5 text-slate-400"/> {partner.contactPerson}</div>}
                          {partner.phone && <div className="flex items-center"><Phone size={12} className="mr-1.5 text-slate-400"/> {partner.phone}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {partner.isActive ? (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">Nincs találat a keresési feltételeknek megfelelően.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </>
        )}
      </div>

      {/* Pagination Controls - Separate Section */}
      {pagination && (
        <div className="space-y-4">
          {/* Page Size Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {pagination.totalCount > 0 ? (
                  <>
                    Megjelenítés: <strong>{((pageNumber - 1) * pageSize) + 1}</strong> – <strong>{Math.min(pageNumber * pageSize, pagination.totalCount)}</strong> / <strong>{pagination.totalCount}</strong> partnerből
                  </>
                ) : (
                  'Nincsenek partnerek'
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Sorok oldalanként:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    fetchPartners(1, searchTerm);
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white hover:bg-slate-50 transition"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Page Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={!pagination.hasPreviousPage}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition font-medium"
                title="Előző oldal"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 px-4">
                {Array.from({ length: Math.min(7, pagination.totalPages) }).map((_, idx) => {
                  const pageNum = Math.max(1, pageNumber - 3) + idx;
                  if (pageNum > pagination.totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                        pageNum === pageNumber
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'border border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition font-medium"
                title="Következő oldal"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Page Info */}
            <div className="text-center mt-3 text-xs text-slate-500">
              <strong>{pageNumber}</strong>. oldal / <strong>{pagination.totalPages}</strong> oldalból
            </div>
          </div>
        </div>
      )}

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
                          <input type="text" required value={currentPartner.name || ''} onChange={(e) => setCurrentPartner({...currentPartner, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Adószám *</label>
                          <input type="text" required value={currentPartner.taxNumber || ''} onChange={(e) => setCurrentPartner({...currentPartner, taxNumber: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kihasználási Kód</label>
                          <input type="text" value={currentPartner.exploitationCode || ''} onChange={(e) => setCurrentPartner({...currentPartner, exploitationCode: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Partner Típus</label>
                          <select value={currentPartner.type || 0} onChange={(e) => setCurrentPartner({...currentPartner, type: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                             <option value={0}>Vevő</option>
                             <option value={1}>Szállító</option>
                             <option value={2}>Mindkettő</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Státusz</label>
                          <select value={currentPartner.isActive ? 'true' : 'false'} onChange={(e) => setCurrentPartner({...currentPartner, isActive: e.target.value === 'true'})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                             <option value="true">Aktív</option>
                             <option value="false">Inaktív</option>
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
                          <input type="text" value={currentPartner.city || ''} onChange={(e) => setCurrentPartner({...currentPartner, city: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cím</label>
                          <input type="text" value={currentPartner.address || ''} onChange={(e) => setCurrentPartner({...currentPartner, address: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Postai Irányítószám</label>
                          <input type="text" value={currentPartner.postalCode || ''} onChange={(e) => setCurrentPartner({...currentPartner, postalCode: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ország</label>
                          <input type="text" value={currentPartner.country || ''} onChange={(e) => setCurrentPartner({...currentPartner, country: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kapcsolattartó Neve</label>
                          <input type="text" value={currentPartner.contactPerson || ''} onChange={(e) => setCurrentPartner({...currentPartner, contactPerson: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefonszám</label>
                          <input type="text" value={currentPartner.phone || ''} onChange={(e) => setCurrentPartner({...currentPartner, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                       </div>
                       <div className="col-span-1 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Cím</label>
                          <input type="email" value={currentPartner.email || ''} onChange={(e) => setCurrentPartner({...currentPartner, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
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
