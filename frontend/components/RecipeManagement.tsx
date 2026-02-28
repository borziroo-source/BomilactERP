import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  FileSpreadsheet, 
  Beaker, 
  Package, 
  ChevronRight,
  AlertCircle, 
  Check, 
  Copy,
  Scale,
  DollarSign,
  Info
} from 'lucide-react';
// types import removed - Product type no longer needed here
import {
  fetchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type RecipeApiDto,
  type RecipeItemDto,
  type RecipeInput,
} from '../services/recipes';
import { fetchProducts, type ProductApiDto } from '../services/products';
import { usePermission } from '../hooks/usePermission';

// --- Types ---

interface BomItem {
  id: string;
  productId: number;
  componentSku: string;
  componentName: string;
  quantity: number;
  uom: string;
  category: string;
  unitCost: number;
}

interface Recipe {
  id: number;
  productSku: string;
  productName: string;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  batchSize: number;
  batchUom: string;
  items: BomItem[];
  instructions?: string;
  lastModified: string;
  outputProductId?: number | null;
}

const dtoToRecipe = (dto: RecipeApiDto): Recipe => ({
  id: dto.id,
  productSku: dto.outputProductSku ?? '',
  productName: dto.name,
  version: dto.version,
  status: dto.status as Recipe['status'],
  batchSize: dto.outputQuantity,
  batchUom: dto.outputUom,
  instructions: dto.instructions ?? undefined,
  lastModified: dto.updatedAt ? dto.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  outputProductId: dto.outputProductId,
  items: dto.items.map(item => ({
    id: item.id.toString(),
    productId: item.productId,
    componentSku: item.componentSku ?? '',
    componentName: item.componentName,
    quantity: Number(item.quantity),
    uom: item.unit,
    category: item.category ?? 'INGREDIENT',
    unitCost: Number(item.unitCost ?? 0),
  })),
});

const RecipeManagement: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { canCreate, canUpdate, canDelete } = usePermission('production', 'prod_bom');
  const [availableProducts, setAvailableProducts] = useState<ProductApiDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Editor State
  const [currentRecipe, setCurrentRecipe] = useState<Partial<Recipe>>({});
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [addComponentQty, setAddComponentQty] = useState<number>(1);

  const loadRecipes = useCallback(async () => {
    try {
      const data = await fetchRecipes();
      setRecipes(data.map(dtoToRecipe));
    } catch {
      setRecipes([]);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
    fetchProducts({ pageSize: 200 }).then(r => setAvailableProducts(r.items)).catch(() => {});
  }, [loadRecipes]);

  // --- Filtering ---
  const filteredRecipes = recipes.filter(r => 
    r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productSku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Helpers ---
  const calculateTotalCost = (items: BomItem[]) => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
  };

  // --- Handlers ---

  const handleCreateNew = () => {
    setCurrentRecipe({
      status: 'DRAFT',
      version: 'v0.1',
      items: [],
      batchSize: 1,
      batchUom: 'db',
      lastModified: new Date().toISOString().split('T')[0]
    });
    setIsEditorOpen(true);
  };

  const handleEdit = (recipe: Recipe) => {
    setCurrentRecipe(JSON.parse(JSON.stringify(recipe)));
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a receptúrát?')) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(r => r.id !== id));
      } catch {
        alert('Törlés sikertelen.');
      }
    }
  };

  const handleDuplicate = async (recipe: Recipe) => {
    const payload: RecipeInput = {
      name: `${recipe.productName} (MÁSOLAT)`,
      description: undefined,
      version: `${recipe.version}-COPY`,
      status: 'DRAFT',
      outputProductId: recipe.outputProductId,
      outputQuantity: recipe.batchSize,
      outputUom: recipe.batchUom,
      instructions: recipe.instructions,
      isActive: false,
      items: recipe.items.map(i => ({ productId: i.productId, quantity: i.quantity, unit: i.uom, unitCost: i.unitCost, category: i.category })),
    };
    try {
      await createRecipe(payload);
      await loadRecipes();
    } catch {
      alert('Duplikálás sikertelen.');
    }
  };

  const handleSave = async () => {
    if (!currentRecipe.items) return;
    
    const payload: RecipeInput = {
      name: currentRecipe.productName || 'Új Receptúra',
      version: currentRecipe.version || 'v0.1',
      status: currentRecipe.status || 'DRAFT',
      outputProductId: currentRecipe.outputProductId ?? null,
      outputQuantity: currentRecipe.batchSize || 1,
      outputUom: currentRecipe.batchUom || 'db',
      instructions: currentRecipe.instructions,
      isActive: currentRecipe.status === 'ACTIVE',
      items: currentRecipe.items.map(i => ({ productId: i.productId, quantity: i.quantity, unit: i.uom, unitCost: i.unitCost, category: i.category })),
    };

    try {
      if (currentRecipe.id) {
        await updateRecipe(currentRecipe.id, payload);
      } else {
        await createRecipe(payload);
      }
      await loadRecipes();
      setIsEditorOpen(false);
    } catch {
      alert('Mentés sikertelen.');
    }
  };

  const handleAddItem = () => {
    if (!selectedComponentId || !addComponentQty) return;
    const product = availableProducts.find(p => p.id.toString() === selectedComponentId);
    if (!product) return;

    const newItem: BomItem = {
      id: `bi-${Date.now()}`,
      productId: product.id,
      componentSku: product.sku,
      componentName: product.name,
      quantity: addComponentQty,
      uom: product.uom,
      category: product.category,
      unitCost: product.price ?? 0,
    };

    setCurrentRecipe(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setSelectedComponentId('');
    setAddComponentQty(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentRecipe(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== itemId)
    }));
  };

  // --- Sub-components for Editor ---
  
  const renderItemTable = (items: BomItem[], categoryFilter: 'INGREDIENT' | 'PACKAGING') => {
    const filteredItems = items.filter(i => {
      if (categoryFilter === 'INGREDIENT') return i.category !== 'PACKAGING';
      return i.category === 'PACKAGING';
    });

    if (filteredItems.length === 0) return <div className="text-sm text-slate-400 italic p-2">Nincs elem rögzítve.</div>;

    return (
      <table className="w-full text-sm">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left">Összetevő</th>
            <th className="px-3 py-2 text-right">Mennyiség</th>
            <th className="px-3 py-2 text-right">Költség (Est.)</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td className="px-3 py-2">
                <div className="font-medium text-slate-700">{item.componentName}</div>
                <div className="text-xs text-slate-400 font-mono">{item.componentSku}</div>
              </td>
              <td className="px-3 py-2 text-right font-medium text-slate-800">
                {item.quantity} {item.uom}
              </td>
              <td className="px-3 py-2 text-right text-slate-600">
                {(item.quantity * item.unitCost).toFixed(2)} RON
              </td>
              <td className="px-3 py-2 text-right">
                <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* List View */}
      {!isEditorOpen && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Receptúra Kezelő (BOM)</h2>
              <p className="text-sm text-slate-500">Gyártási anyaghányadok és technológiák karbantartása</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Keresés..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button 
                onClick={handleCreateNew}
                disabled={!canCreate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Új Receptúra
              </button>
            </div>
          </div>

          {/* Recipes Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow relative">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border 
                    ${recipe.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 
                      recipe.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}
                  `}>
                    {recipe.status}
                  </span>
                  <div className="flex space-x-1">
                    <button onClick={() => handleDuplicate(recipe)} disabled={!canCreate} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded disabled:opacity-40 disabled:cursor-not-allowed" title="Duplikálás">
                      <Copy size={14} />
                    </button>
                    <button onClick={() => handleEdit(recipe)} disabled={!canUpdate} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded disabled:opacity-40 disabled:cursor-not-allowed" title="Szerkesztés">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(recipe.id)} disabled={!canDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed" title="Törlés">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{recipe.productName}</h3>
                <div className="text-xs text-slate-500 font-mono mb-4 flex items-center">
                   <FileSpreadsheet size={12} className="mr-1" />
                   {recipe.productSku} • Verzió: {recipe.version}
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2 border border-slate-100">
                   <div className="flex justify-between">
                      <span className="text-slate-500">Bázis Mennyiség:</span>
                      <span className="font-bold text-slate-700">{recipe.batchSize} {recipe.batchUom}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-500">Összetevők:</span>
                      <span className="font-bold text-slate-700">{recipe.items.length} db</span>
                   </div>
                   <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-500 font-bold">Becsült Költség:</span>
                      <span className="font-bold text-blue-600">{calculateTotalCost(recipe.items).toLocaleString()} RON</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Editor View */}
      {isEditorOpen && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] animate-slide-left">
           
           {/* Editor Header */}
           <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center">
                 <FileSpreadsheet className="mr-3 text-blue-400" />
                 <div>
                    <h3 className="font-bold text-lg">Receptúra Szerkesztő</h3>
                    <p className="text-xs text-slate-400">
                      {currentRecipe.id} • {currentRecipe.version}
                    </p>
                 </div>
              </div>
              <div className="flex space-x-3">
                 <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition">
                    Mégse
                 </button>
                 <button onClick={handleSave} disabled={!(currentRecipe.id ? canUpdate : canCreate)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition flex items-center shadow-lg shadow-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <Save size={16} className="mr-2" />
                    Mentés
                 </button>
              </div>
           </div>

           {/* Editor Body */}
           <div className="flex-1 overflow-y-auto p-6">
              
              {/* Top Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 
                 {/* Left: Product Selection */}
                 <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Receptúra neve</label>
                           <input
                             type="text"
                             value={currentRecipe.productName ?? ""}
                             onChange={(e) => setCurrentRecipe({ ...currentRecipe, productName: e.target.value })}
                             placeholder="Pl. Cașcaval Rucăr receptúra"
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                           />
                        </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Verzió</label>
                          <input 
                             type="text" 
                             value={currentRecipe.version}
                             onChange={(e) => setCurrentRecipe({...currentRecipe, version: e.target.value})}
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Bázis Mennyiség (Batch Size)</label>
                          <div className="flex">
                             <input 
                               type="number" 
                               value={currentRecipe.batchSize}
                               onChange={(e) => setCurrentRecipe({...currentRecipe, batchSize: parseFloat(e.target.value)})}
                               className="w-full border border-slate-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                             />
                             <div className="bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg px-3 py-2 text-slate-600 font-bold text-sm flex items-center">
                                {currentRecipe.batchUom}
                             </div>
                          </div>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Státusz</label>
                          <select 
                             value={currentRecipe.status}
                             onChange={(e) => setCurrentRecipe({...currentRecipe, status: e.target.value as any})}
                             className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                             <option value="DRAFT">Tervezet</option>
                             <option value="ACTIVE">Aktív</option>
                             <option value="ARCHIVED">Archivált</option>
                          </select>
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-1">Gyártási Utasítások</label>
                       <textarea 
                          rows={3}
                          value={currentRecipe.instructions}
                          onChange={(e) => setCurrentRecipe({...currentRecipe, instructions: e.target.value})}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          placeholder="Rövid leírás a technológiáról..."
                       ></textarea>
                    </div>
                 </div>

                 {/* Right: Summary Card */}
                 <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col justify-center space-y-4">
                    <h4 className="font-bold text-blue-800 flex items-center">
                       <Scale size={18} className="mr-2" /> Költségbecslés
                    </h4>
                    <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Alapanyag Költség:</span>
                          <span className="font-bold text-blue-900">
                             {calculateTotalCost((currentRecipe.items || []).filter(i => i.category !== 'PACKAGING')).toLocaleString()} RON
                          </span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Csomagolóanyag:</span>
                          <span className="font-bold text-blue-900">
                             {calculateTotalCost((currentRecipe.items || []).filter(i => i.category === 'PACKAGING')).toLocaleString()} RON
                          </span>
                       </div>
                       <div className="border-t border-blue-200 pt-2 flex justify-between text-lg">
                          <span className="font-bold text-blue-800">Összesen:</span>
                          <span className="font-black text-blue-900">{calculateTotalCost(currentRecipe.items || []).toLocaleString()} RON</span>
                       </div>
                       <div className="text-xs text-blue-500 text-right mt-1">
                          Egységár: {(calculateTotalCost(currentRecipe.items || []) / (currentRecipe.batchSize || 1)).toFixed(2)} RON / {currentRecipe.batchUom}
                       </div>
                    </div>
                 </div>

              </div>

              {/* Items Section */}
              <div className="border-t border-slate-200 pt-6">
                 <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-slate-800 text-lg">Anyaghányadok</h3>
                    
                    {/* Add Item Bar */}
                    <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                       <select 
                          value={selectedComponentId}
                          onChange={(e) => setSelectedComponentId(e.target.value)}
                          className="w-64 text-sm bg-white border-none rounded px-2 py-1.5 focus:ring-0 outline-none"
                       >
                          <option value="">Válassz komponenst...</option>
                          <optgroup label="Alapanyagok">
                             {availableProducts.filter(p => p.category !== 'PACKAGING').map(p => (
                                <option key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</option>
                             ))}
                          </optgroup>
                          <optgroup label="Csomagolók">
                             {availableProducts.filter(p => p.category === 'PACKAGING').map(p => (
                                <option key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</option>
                             ))}
                          </optgroup>
                       </select>
                       <input 
                          type="number" 
                          value={addComponentQty}
                          onChange={(e) => setAddComponentQty(parseFloat(e.target.value))}
                          placeholder="Menny."
                          className="w-20 text-sm bg-white border-none rounded px-2 py-1.5 focus:ring-0 outline-none"
                       />
                       <button 
                          onClick={handleAddItem}
                          disabled={!canUpdate}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                       >
                          Hozzáad
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ingredients Column */}
                    <div>
                       <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-3">
                          <Beaker size={14} className="mr-1" /> Alapanyagok
                       </div>
                       <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          {renderItemTable(currentRecipe.items || [], 'INGREDIENT')}
                       </div>
                    </div>

                    {/* Packaging Column */}
                    <div>
                       <div className="flex items-center text-slate-500 font-bold uppercase text-xs mb-3">
                          <Package size={14} className="mr-1" /> Csomagolóanyagok
                       </div>
                       <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          {renderItemTable(currentRecipe.items || [], 'PACKAGING')}
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

export default RecipeManagement;
