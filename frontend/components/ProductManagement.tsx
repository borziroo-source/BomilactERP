import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePermission } from '../hooks/usePermission';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Package, 
  AlertTriangle,
  Database,
  Thermometer,
  Calendar,
  Scale,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { fetchProducts, createProduct, updateProduct, deleteProduct, ProductInput } from '../services/products';

const PAGE_SIZE = 20;


const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { canCreate, canUpdate, canDelete } = usePermission('admin', 'admin_products');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadProducts = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchProducts({ page, pageSize: PAGE_SIZE, searchTerm: search });
      const mapped: Product[] = result.items.map(dto => ({
        id: dto.id.toString(),
        sku: dto.sku,
        name: dto.name,
        category: dto.category as ProductCategory,
        uom: dto.uom,
        weightNetKg: dto.weightNetKg ?? undefined,
        minStockThreshold: dto.minStockThreshold ?? undefined,
        sagaRefId: dto.sagaRefId ?? undefined,
        shelfLifeDays: dto.shelfLifeDays ?? undefined,
        storageTempMin: dto.storageTempMin ?? undefined,
        storageTempMax: dto.storageTempMax ?? undefined,
      }));
      setProducts(mapped);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Hiba a termékek betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(currentPage, searchTerm);
  }, [currentPage, loadProducts]);

  // Debounced search — resets to page 1
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadProducts(1, value);
    }, 400);
  };

  // Handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a terméket?')) return;
    try {
      await deleteProduct(Number(id));
      // If last item on page, go back one page
      const newPage = products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);
      loadProducts(newPage, searchTerm);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Hiba a törléskor.');
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditing(true);
    setWarningMsg(null);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({
      sku: '',
      name: '',
      category: ProductCategory.FINISHED,
      uom: 'db',
      minStockThreshold: 0
    });
    setIsEditing(false);
    setWarningMsg(null);
    setIsModalOpen(true);
  };

  const validateProduct = (product: Partial<Product>): boolean => {
    // 1. Mandatory Fields
    if (!product.sku || !product.name || !product.uom) {
      setWarningMsg('A Cikkszám (SKU), Név és Mértékegység (UOM) kitöltése kötelező!');
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProduct(currentProduct)) return;

    const payload: ProductInput = {
      name: currentProduct.name!,
      sku: currentProduct.sku!,
      uom: currentProduct.uom!,
      category: currentProduct.category ?? ProductCategory.FINISHED,
      weightNetKg: currentProduct.weightNetKg ?? null,
      minStockThreshold: currentProduct.minStockThreshold ?? null,
      sagaRefId: currentProduct.sagaRefId ?? null,
      shelfLifeDays: currentProduct.shelfLifeDays ?? null,
      storageTempMin: currentProduct.storageTempMin ?? null,
      storageTempMax: currentProduct.storageTempMax ?? null,
    };

    try {
      if (isEditing && currentProduct.id) {
        await updateProduct(Number(currentProduct.id), payload);
      } else {
        await createProduct(payload);
      }
      setIsModalOpen(false);
      loadProducts(currentPage, searchTerm);
    } catch (e: unknown) {
      setWarningMsg(e instanceof Error ? e.message : 'Hiba a mentéskor.');
    }
  };

  // Helper to render category badge
  const renderCategoryBadge = (category: ProductCategory) => {
    const colors: Record<ProductCategory, string> = {
      [ProductCategory.FINISHED]: 'bg-green-100 text-green-800',
      [ProductCategory.RAW_MILK]: 'bg-blue-100 text-blue-800',
      [ProductCategory.INGREDIENT]: 'bg-amber-100 text-amber-800',
      [ProductCategory.PACKAGING]: 'bg-purple-100 text-purple-800',
      [ProductCategory.WIP]: 'bg-slate-100 text-slate-800',
      [ProductCategory.SERVICE]: 'bg-gray-100 text-gray-600',
    };
    
    // Label translation
    const labels: Record<ProductCategory, string> = {
      [ProductCategory.FINISHED]: 'Késztermék',
      [ProductCategory.RAW_MILK]: 'Nyers Tej',
      [ProductCategory.INGREDIENT]: 'Alapanyag',
      [ProductCategory.PACKAGING]: 'Csomagoló',
      [ProductCategory.WIP]: 'Félkész',
      [ProductCategory.SERVICE]: 'Szolgáltatás',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category]}`}>
        {labels[category]}
      </span>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Terméktörzs</h2>
          <p className="text-sm text-slate-500">Cikkszámok, receptúrák és készletparaméterek kezelése</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Keresés SKU, Név..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Új Termék
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          <AlertTriangle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <th className="px-6 py-4">SKU / SAGA ID</th>
                <th className="px-6 py-4">Megnevezés</th>
                <th className="px-6 py-4">Kategória</th>
                <th className="px-6 py-4">Mértékegység</th>
                <th className="px-6 py-4">Min. Készlet</th>
                <th className="px-6 py-4">Lejárat / Hőfok</th>
                <th className="px-6 py-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30 animate-pulse" />
                    Betöltés...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    Nincs megjeleníthető termék.
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-bold text-slate-700">{product.sku}</div>
                    {product.sagaRefId && (
                      <div className="flex items-center text-xs text-blue-600 mt-1">
                        <Database size={10} className="mr-1" />
                        {product.sagaRefId}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{product.name}</div>
                    {product.weightNetKg && (
                      <div className="text-xs text-slate-500">Nettó: {product.weightNetKg} kg</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {renderCategoryBadge(product.category)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.uom}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.minStockThreshold ? (
                      <div className="flex items-center text-slate-600">
                         <AlertTriangle size={14} className="mr-1 text-amber-500" />
                         {product.minStockThreshold}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="space-y-1">
                      {product.shelfLifeDays && (
                        <div className="flex items-center" title="Szavatosság">
                          <Calendar size={12} className="mr-1" /> {product.shelfLifeDays} nap
                        </div>
                      )}
                      {(product.storageTempMin !== undefined || product.storageTempMax !== undefined) && (
                        <div className="flex items-center" title="Tárolási hőmérséklet">
                          <Thermometer size={12} className="mr-1" /> 
                          {product.storageTempMin ?? '?'}-{product.storageTempMax ?? '?'} °C
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100">
          <span className="text-sm text-slate-500">
            {totalCount} termék · {currentPage}. oldal / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={15} /> Előző
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Következő <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                {isEditing ? 'Termék Szerkesztése' : 'Új Termék Felvétele'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>
            
            {warningMsg && (
              <div className="mx-6 mt-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                {warningMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Termék Megnevezés *</label>
                   <input 
                      type="text" 
                      required
                      value={currentProduct.name || ''}
                      onChange={(e) => {
                        setWarningMsg(null);
                        setCurrentProduct({...currentProduct, name: e.target.value});
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pl: Cașcaval Rucăr"
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Cikkszám (SKU) *</label>
                   <input 
                      type="text" 
                      required
                      value={currentProduct.sku || ''}
                      onChange={(e) => {
                        setWarningMsg(null);
                        setCurrentProduct({...currentProduct, sku: e.target.value.toUpperCase()});
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="PL-001"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Kategória</label>
                   <select 
                      value={currentProduct.category}
                      onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value as ProductCategory})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                   >
                     <option value={ProductCategory.FINISHED}>Késztermék</option>
                     <option value={ProductCategory.RAW_MILK}>Nyers Tej</option>
                     <option value={ProductCategory.INGREDIENT}>Alapanyag</option>
                     <option value={ProductCategory.PACKAGING}>Csomagolóanyag</option>
                     <option value={ProductCategory.WIP}>Félkész Termék</option>
                     <option value={ProductCategory.SERVICE}>Szolgáltatás</option>
                   </select>
                </div>
              </div>

              {/* Logistics */}
              <div className="border-t border-slate-100 pt-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                    <Scale size={14} className="mr-1" /> Logisztikai Adatok
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Mértékegység (UOM) *</label>
                       <select 
                          value={currentProduct.uom}
                          onChange={(e) => setCurrentProduct({...currentProduct, uom: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                       >
                         <option value="db">db (Darab)</option>
                         <option value="kg">kg (Kilogramm)</option>
                         <option value="l">l (Liter)</option>
                         <option value="m">m (Méter)</option>
                         <option value="csom">csom (Csomag)</option>
                         <option value="tekercs">tekercs (Tekercs)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Nettó Súly (kg)</label>
                       <input 
                          type="number" 
                          step="0.001"
                          value={currentProduct.weightNetKg || ''}
                          onChange={(e) => setCurrentProduct({...currentProduct, weightNetKg: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Min. Készlet (Alert)</label>
                       <input 
                          type="number" 
                          value={currentProduct.minStockThreshold || ''}
                          onChange={(e) => setCurrentProduct({...currentProduct, minStockThreshold: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                    </div>
                 </div>
              </div>

              {/* Safety & Storage (Conditional for Foods) */}
              {(currentProduct.category === ProductCategory.FINISHED || currentProduct.category === ProductCategory.INGREDIENT || currentProduct.category === ProductCategory.WIP || currentProduct.category === ProductCategory.RAW_MILK) && (
                <div className="border-t border-slate-100 pt-4">
                   <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                      <Thermometer size={14} className="mr-1" /> Élelmiszerbiztonság
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Szavatosság (Nap)</label>
                         <input 
                            type="number" 
                            value={currentProduct.shelfLifeDays || ''}
                            onChange={(e) => setCurrentProduct({...currentProduct, shelfLifeDays: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Min. Hőfok (°C)</label>
                         <input 
                            type="number" 
                            value={currentProduct.storageTempMin || ''}
                            onChange={(e) => setCurrentProduct({...currentProduct, storageTempMin: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Max. Hőfok (°C)</label>
                         <input 
                            type="number" 
                            value={currentProduct.storageTempMax || ''}
                            onChange={(e) => setCurrentProduct({...currentProduct, storageTempMax: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                         />
                      </div>
                   </div>
                </div>
              )}

              {/* Integration */}
              <div className="border-t border-slate-100 pt-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center">
                    <Database size={14} className="mr-1" /> Rendszer Integráció
                 </h4>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SAGA Ref ID (Könyvelés)</label>
                    <input 
                       type="text" 
                       value={currentProduct.sagaRefId || ''}
                       onChange={(e) => setCurrentProduct({...currentProduct, sagaRefId: e.target.value})}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                       placeholder="Pl: 100234"
                    />
                 </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 sticky bottom-0 bg-white border-t border-slate-100 p-4 -mx-6 -mb-6 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Mégse
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;