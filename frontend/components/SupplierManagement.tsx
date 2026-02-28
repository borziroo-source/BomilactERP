
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Truck, 
  MapPin, 
  FileText,
  User,
  Building,
  Filter,
  Briefcase,
  Target,
  Landmark,
  CreditCard,
  Layers,
  Settings2,
  ChevronRight,
  Info,
  RotateCw,
  Upload
} from 'lucide-react';
import { Supplier, SupplierType, SupplierGroup, LegalType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import * as supplierService from '../services/suppliers';
import { usePermission } from '../hooks/usePermission';

// Mock Groups
const INITIAL_GROUPS: SupplierGroup[] = [
  { id: 'gr1', name: 'Alcsík', color: 'bg-blue-100 text-blue-800' },
  { id: 'gr2', name: 'Felső-Csík', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'gr3', name: 'Gyergyó-szék', color: 'bg-teal-100 text-teal-800' },
  { id: 'gr4', name: 'Udvarhely-szék', color: 'bg-orange-100 text-orange-800' },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { 
    id: 'sup1', 
    name: 'Kovács István E.V. (Gazda)', 
    cui: '19870512-112233', 
    legalType: 'INDIVIDUAL',
    exploitationCode: 'RO123456789',
    apiaCode: 'API-99001',
    hasSubsidy8: true,
    bankName: 'OTP Bank',
    bankBranch: 'Csíkszereda',
    iban: 'RO12 OTPA 0000 1111 2222 3333',
    type: 'FARMER', 
    groupId: 'gr1',
    address: '530122 Csíkszereda, Fő út 12.', 
    phone: '+40 740 123 456', 
    status: 'ACTIVE',
    lastCollectionDate: '2023-10-26',
    invoiceSeries: 'KIV',
    nextInvoiceNumber: 101
  },
  { 
    id: 'sup2', 
    name: 'Agro Lacto Coop (Szövetkezet)', 
    cui: 'RO12345678', 
    legalType: 'COMPANY',
    exploitationCode: 'RO888777666',
    apiaCode: 'API-55440',
    hasSubsidy8: false,
    bankName: 'Banca Transilvania',
    bankBranch: 'Gyergyószentmiklós',
    iban: 'RO88 BTRL 0000 4444 5555 6666',
    type: 'COOPERATIVE', 
    groupId: 'gr3',
    address: '537100 Gyergyószentmiklós, Mező u. 5.', 
    phone: '+40 266 987 654', 
    email: 'contact@agrolacto.ro',
    status: 'ACTIVE',
    lastCollectionDate: '2023-10-26',
    invoiceSeries: 'ALC',
    nextInvoiceNumber: 550
  },
  { 
    id: 'cp1', 
    name: 'Csarnok - Csíkszentdomokos', 
    cui: 'RO445566', 
    legalType: 'COMPANY',
    exploitationCode: 'EXPL-DOM',
    apiaCode: 'API-DOM',
    hasSubsidy8: false,
    bankName: 'BCR',
    bankBranch: 'Csíkszereda',
    iban: 'RO44 RNCB 0000 1111 2222 3333',
    type: 'COLLECTION_POINT', 
    groupId: 'gr2',
    address: '537075 Csíkszentdomokos, Alvég 44.', 
    phone: '+40 740 999 000', 
    status: 'ACTIVE',
    invoiceSeries: 'DOM',
    nextInvoiceNumber: 12
  }
];

const SupplierManagement: React.FC = () => {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { canCreate, canUpdate, canDelete } = usePermission('logistics', 'log_suppliers');
  const [groups] = useState<SupplierGroup[]>(INITIAL_GROUPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<SupplierType | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Adatok betöltése az API-ból
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supplierService.fetchSuppliers();
      
      // API adatok konvertálása Supplier típusra
      const mappedSuppliers: Supplier[] = data.map(apiSupplier => ({
        id: apiSupplier.id.toString(),
        name: apiSupplier.name,
        cui: apiSupplier.taxNumber || '',
        legalType: 'COMPANY' as LegalType,
        exploitationCode: apiSupplier.exploitationCode || '',
        apiaCode: apiSupplier.apiaCode || '',
        hasSubsidy8: false,
        bankName: '',
        bankBranch: '',
        iban: '',
        type: 'FARMER' as SupplierType,
        groupId: '',
        address: `${apiSupplier.address || ''} ${apiSupplier.city || ''}`.trim(),
        phone: apiSupplier.phone || '',
        email: apiSupplier.email || '',
        status: apiSupplier.isActive ? 'ACTIVE' : 'INACTIVE',
        invoiceSeries: '',
        nextInvoiceNumber: 1
      }));
      
      setSuppliers(mappedSuppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt az adatok betöltésekor');
      console.error('Error loading suppliers:', err);
      // Visszaesés mock adatokra hiba esetén
      setSuppliers(INITIAL_SUPPLIERS);
    } finally {
      setIsLoading(false);
    }
  };
  
  const collectionPoints = useMemo(() => suppliers.filter(s => s.type === 'COLLECTION_POINT'), [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const groupName = groups.find(g => g.id === s.groupId)?.name || '';
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.cui.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.apiaCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          groupName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'ALL' || s.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [suppliers, searchTerm, typeFilter, groups]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('sup.confirm_delete'))) {
      try {
        await supplierService.deleteSupplier(parseInt(id));
        setSuppliers(suppliers.filter(s => s.id !== id));
      } catch (err) {
        alert('Hiba történt a törlés során: ' + (err instanceof Error ? err.message : 'Ismeretlen hiba'));
        console.error('Error deleting supplier:', err);
      }
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setCurrentSupplier({ ...supplier });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentSupplier({
      name: '', cui: '', legalType: 'INDIVIDUAL', exploitationCode: '', apiaCode: '', hasSubsidy8: false,
      bankName: '', bankBranch: '', iban: '', type: 'FARMER', groupId: '', address: '', phone: '',
      status: 'ACTIVE', invoiceSeries: 'SZM', nextInvoiceNumber: 1, parentSupplierId: '',
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSupplier.name || !currentSupplier.cui) return;

    try {
      const apiData = {
        name: currentSupplier.name,
        taxNumber: currentSupplier.cui,
        exploitationCode: currentSupplier.exploitationCode || null,
        apiaCode: currentSupplier.apiaCode || null,
        address: currentSupplier.address,
        city: '',
        postalCode: '',
        country: 'RO',
        contactPerson: '',
        email: currentSupplier.email || null,
        phone: currentSupplier.phone || null,
        type: 1, // Supplier
        isActive: currentSupplier.status === 'ACTIVE'
      };

      if (isEditing && currentSupplier.id) {
        await supplierService.updateSupplier(parseInt(currentSupplier.id), apiData);
        setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? currentSupplier as Supplier : s));
      } else {
        const created = await supplierService.createSupplier(apiData);
        const newSupplier: Supplier = {
          id: created.id.toString(),
          name: created.name,
          cui: created.taxNumber || '',
          legalType: currentSupplier.legalType || 'INDIVIDUAL',
          exploitationCode: created.exploitationCode || currentSupplier.exploitationCode || '',
          apiaCode: created.apiaCode || currentSupplier.apiaCode || '',
          hasSubsidy8: currentSupplier.hasSubsidy8 || false,
          bankName: currentSupplier.bankName || '',
          bankBranch: currentSupplier.bankBranch || '',
          iban: currentSupplier.iban || '',
          type: currentSupplier.type || 'FARMER',
          groupId: currentSupplier.groupId,
          address: created.address || '',
          phone: created.phone || '',
          email: created.email || '',
          status: created.isActive ? 'ACTIVE' : 'INACTIVE',
          invoiceSeries: currentSupplier.invoiceSeries,
          nextInvoiceNumber: currentSupplier.nextInvoiceNumber
        };
        setSuppliers([...suppliers, newSupplier]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Hiba történt a mentés során: ' + (err instanceof Error ? err.message : 'Ismeretlen hiba'));
      console.error('Error saving supplier:', err);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError(null);
      const result = await supplierService.importSuppliers(file);
      await loadSuppliers();

      const errorLines = result.errors.slice(0, 3).map(e => `#${e.rowNumber}: ${e.message}`);
      const moreErrors = result.errors.length > 3 ? ` (+${result.errors.length - 3})` : '';
      const errorSummary = result.errors.length > 0 ? `\nHibak: ${errorLines.join(', ')}${moreErrors}` : '';

      alert(
        `Import kesz. Uj partnerek: ${result.createdPartners}, kihagyva: ${result.skippedPartners}. ` +
        `Uj szerzodesek: ${result.createdContracts}, kihagyva: ${result.skippedContracts}.${errorSummary}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba tortent az import soran');
      console.error('Error importing suppliers:', err);
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const getTypeBadge = (type: SupplierType) => {
    switch (type) {
      case 'FARMER': return <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100"><User size={10} className="mr-1"/> {t('sup.badge_farmer')}</span>;
      case 'COLLECTION_POINT': return <span className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase border border-blue-100"><Building size={10} className="mr-1"/> {t('sup.badge_point')}</span>;
      case 'COOPERATIVE': return <span className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-black uppercase border border-purple-100"><Briefcase size={10} className="mr-1"/> {t('sup.badge_coop')}</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Hiba üzenet */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <strong>Hiba:</strong> {error}
        </div>
      )}

      {/* Betöltés állapot */}
      {isLoading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Beszállítók betöltése...</p>
        </div>
      )}
      
      {/* Header & Stats */}
      {!isLoading && (
      <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('sup.title')}</h2>
          <p className="text-sm text-slate-500">{t('sup.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('sup.search_placeholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={loadSuppliers}
            disabled={isLoading}
            className="px-3 py-2.5 rounded-xl text-sm font-bold flex items-center transition border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Frissites"
          >
            <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleImportClick}
            disabled={isImporting || isLoading}
            className="px-3 py-2.5 rounded-xl text-sm font-bold flex items-center transition border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            title={t('sup.import_btn')}
          >
            <Upload size={18} className={isImporting ? 'animate-pulse' : ''} />
          </button>
          <button 
            onClick={handleAddNew}
            disabled={!canCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={18} className="mr-2" />
            {t('sup.new_btn')}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      {/* Toolbar Filters */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
        <button onClick={() => setTypeFilter('ALL')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${typeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Összes</button>
        <button onClick={() => setTypeFilter('FARMER')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${typeFilter === 'FARMER' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Gazdák</button>
        <button onClick={() => setTypeFilter('COLLECTION_POINT')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${typeFilter === 'COLLECTION_POINT' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Csarnokok</button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">{t('sup.table_name')}</th>
                <th className="px-6 py-4">{t('sup.table_ids')}</th>
                <th className="px-6 py-4">Hierarchia / Csoport</th>
                <th className="px-6 py-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((supplier) => {
                const parent = suppliers.find(s => s.id === supplier.parentSupplierId);
                const group = groups.find(g => g.id === supplier.groupId);
                return (
                  <tr key={supplier.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${supplier.type === 'COLLECTION_POINT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {supplier.type === 'COLLECTION_POINT' ? <Building size={16} /> : <User size={16} />}
                         </div>
                         <div>
                            <div className="font-bold text-slate-800 text-base">{supplier.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                               {getTypeBadge(supplier.type)}
                               <span className="text-xs text-slate-400 flex items-center"><MapPin size={10} className="mr-1" /> {supplier.address.split(',')[0]}</span>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                         <div className="text-xs font-mono font-bold text-slate-700">CUI: {supplier.cui}</div>
                         <div className="text-[10px] font-black text-blue-600 uppercase">APIA: {supplier.apiaCode || 'N/A'}</div>
                         <div className="text-[10px] font-black text-emerald-600 uppercase">EXPL: {supplier.exploitationCode || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {supplier.parentSupplierId ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-black bg-blue-50 px-2 py-1 rounded-lg w-fit uppercase">
                             <Layers size={10} /> {parent?.name || 'Csarnok'}
                          </div>
                        ) : supplier.type === 'COLLECTION_POINT' ? (
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Központi gyűjtő</span>
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">Közvetlen beszállító</span>
                        )}
                        {group && (
                          <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase w-fit ${group.color}`}>
                             {group.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => handleEdit(supplier)} disabled={!canUpdate} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(supplier.id)} disabled={!canDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Robust Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-800 p-5 text-white flex justify-between items-center shrink-0">
               <h3 className="font-bold text-xl flex items-center">
                 {isEditing ? <Edit2 className="mr-3 text-blue-400" size={24} /> : <Plus className="mr-3 text-blue-400" size={24} />}
                 {isEditing ? t('sup.modal_edit') : t('sup.modal_new')}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              
              {/* SECTION 1: GENERAL INFO */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center border-b border-blue-100 pb-2">
                   <Info size={14} className="mr-2" /> Alapadatok & Kapcsolat
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Megnevezés *</label>
                      <input type="text" required value={currentSupplier.name} onChange={(e) => setCurrentSupplier({...currentSupplier, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold bg-slate-50" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Típus</label>
                      <select value={currentSupplier.type} onChange={(e) => setCurrentSupplier({...currentSupplier, type: e.target.value as SupplierType})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold">
                          <option value="FARMER">Gazda (Termelő)</option>
                          <option value="COLLECTION_POINT">Csarnok (Gyűjtőpont)</option>
                          <option value="COOPERATIVE">Szövetkezet</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Csoport</label>
                      <select value={currentSupplier.groupId} onChange={(e) => setCurrentSupplier({...currentSupplier, groupId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold">
                          <option value="">{t('sup.no_group')}</option>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Kapcsolódó Csarnok</label>
                      <select disabled={currentSupplier.type === 'COLLECTION_POINT'} value={currentSupplier.parentSupplierId || ''} onChange={(e) => setCurrentSupplier({...currentSupplier, parentSupplierId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold disabled:opacity-50">
                          <option value="">Nincs (Közvetlen)</option>
                          {collectionPoints.map(cp => <option key={cp.id} value={cp.id}>{cp.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Telefonszám</label>
                      <input type="text" value={currentSupplier.phone} onChange={(e) => setCurrentSupplier({...currentSupplier, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50" />
                  </div>
                  <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cím</label>
                      <input type="text" value={currentSupplier.address} onChange={(e) => setCurrentSupplier({...currentSupplier, address: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50" placeholder="Város, utca, házszám..." />
                  </div>
                </div>
              </div>

              {/* SECTION 2: AGRICULTURE & LEGAL */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center border-b border-emerald-100 pb-2">
                   <Target size={14} className="mr-2" /> Mezőgazdasági & Jogi Azonosítók
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Jogi státusz</label>
                      <select value={currentSupplier.legalType} onChange={(e) => setCurrentSupplier({...currentSupplier, legalType: e.target.value as LegalType})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold text-sm">
                          <option value="INDIVIDUAL">Magánszemély (PF)</option>
                          <option value="COMPANY">Cég (SRL/PFA/II)</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Adószám / CUI / CNP *</label>
                      <input type="text" required value={currentSupplier.cui} onChange={(e) => setCurrentSupplier({...currentSupplier, cui: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">APIA Kód</label>
                      <input type="text" value={currentSupplier.apiaCode} onChange={(e) => setCurrentSupplier({...currentSupplier, apiaCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold text-blue-700" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Cod Exploatare</label>
                      <input type="text" value={currentSupplier.exploitationCode} onChange={(e) => setCurrentSupplier({...currentSupplier, exploitationCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold text-emerald-700" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BANKING */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center border-b border-amber-100 pb-2">
                   <Landmark size={14} className="mr-2" /> Pénzügyi & Banki Adatok
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Bank Neve</label>
                      <input type="text" value={currentSupplier.bankName} onChange={(e) => setCurrentSupplier({...currentSupplier, bankName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Fiók / Kirendeltség</label>
                      <input type="text" value={currentSupplier.bankBranch} onChange={(e) => setCurrentSupplier({...currentSupplier, bankBranch: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">IBAN Szám</label>
                      <input type="text" value={currentSupplier.iban} onChange={(e) => setCurrentSupplier({...currentSupplier, iban: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold text-amber-800" placeholder="RO00 ..." />
                  </div>
                </div>
              </div>

              {/* SECTION 4: INVOICING SETUP */}
              <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4">
                 <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center border-b border-slate-700 pb-2">
                    <Settings2 size={18} className="mr-2" /> Számlázási Beállítások (Önszámlázás)
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Számla Széria (Prefix)</label>
                        <input type="text" value={currentSupplier.invoiceSeries} onChange={(e) => setCurrentSupplier({...currentSupplier, invoiceSeries: e.target.value.toUpperCase()})} className="w-full border border-slate-700 rounded-xl px-4 py-2.5 bg-slate-800 text-white font-black uppercase" placeholder="pl. KIV" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Következő Sorszám</label>
                        <input type="number" value={currentSupplier.nextInvoiceNumber} onChange={(e) => setCurrentSupplier({...currentSupplier, nextInvoiceNumber: parseInt(e.target.value)})} className="w-full border border-slate-700 rounded-xl px-4 py-2.5 bg-slate-800 text-white font-black" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <label className="flex items-center cursor-pointer group mt-4">
                           <div className="relative">
                              <input type="checkbox" checked={currentSupplier.hasSubsidy8} onChange={(e) => setCurrentSupplier({...currentSupplier, hasSubsidy8: e.target.checked})} className="sr-only" />
                              <div className={`w-12 h-6 rounded-full transition-colors ${currentSupplier.hasSubsidy8 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${currentSupplier.hasSubsidy8 ? 'translate-x-6' : ''}`}></div>
                           </div>
                           <span className="ml-3 text-sm font-bold text-blue-100 group-hover:text-white transition-colors">8% ÁFA támogatás (Subvenție)</span>
                        </label>
                    </div>
                 </div>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex gap-4 shrink-0">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl transition hover:bg-slate-50">{t('sup.cancel_btn')}</button>
               <button onClick={handleSave} disabled={!(isEditing ? canUpdate : canCreate)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save size={20} className="mr-2" />
                  {t('sup.save_btn')}
               </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default SupplierManagement;
