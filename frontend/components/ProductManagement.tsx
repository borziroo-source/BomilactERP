import React, { useState } from 'react';
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
  Scale
} from 'lucide-react';
import { Product, ProductCategory } from '../types';

// Expanded Mock Data
const INITIAL_PRODUCTS: Product[] = [
  // --- KÉSZTERMÉKEK (FINISHED) - 18 db ---
  { id: 'f1', sku: 'RUC-SMK-450', name: 'Cașcaval Rucăr Füstölt 450g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.45, shelfLifeDays: 60, minStockThreshold: 100, storageTempMin: 2, storageTempMax: 8, sagaRefId: '300101' },
  { id: 'f2', sku: 'RUC-NAT-450', name: 'Cașcaval Rucăr Natúr 450g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.45, shelfLifeDays: 60, minStockThreshold: 150, storageTempMin: 2, storageTempMax: 8, sagaRefId: '300102' },
  { id: 'f3', sku: 'DAL-NAT-450', name: 'Cașcaval Dalia 450g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.45, shelfLifeDays: 60, minStockThreshold: 120, storageTempMin: 2, storageTempMax: 8, sagaRefId: '300201' },
  { id: 'f4', sku: 'TRAP-500', name: 'Sajt Trapista 500g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.50, shelfLifeDays: 45, minStockThreshold: 80, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300305' },
  { id: 'f5', sku: 'MOZZ-BLK-2KG', name: 'Mozzarella Tömb 2kg (Pizza)', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 2.0, shelfLifeDays: 30, minStockThreshold: 40, storageTempMin: 0, storageTempMax: 4, sagaRefId: '300401' },
  { id: 'f6', sku: 'MOZZ-BALL-125', name: 'Mozzarella Golyó 125g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.125, shelfLifeDays: 25, minStockThreshold: 200, storageTempMin: 0, storageTempMax: 4, sagaRefId: '300402' },
  { id: 'f7', sku: 'TEL-COW-400', name: 'Telemea Tehén 400g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.40, shelfLifeDays: 45, minStockThreshold: 100, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300501' },
  { id: 'f8', sku: 'TEL-SHP-400', name: 'Telemea Juh 400g (Vákuum)', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.40, shelfLifeDays: 60, minStockThreshold: 50, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300502' },
  { id: 'f9', sku: 'SC-12-350', name: 'Tejföl 12% 350g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.35, shelfLifeDays: 30, minStockThreshold: 300, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300601' },
  { id: 'f10', sku: 'SC-20-350', name: 'Tejföl 20% 350g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.35, shelfLifeDays: 30, minStockThreshold: 250, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300602' },
  { id: 'f11', sku: 'SC-20-850', name: 'Tejföl 20% 850g (Családi)', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.85, shelfLifeDays: 30, minStockThreshold: 100, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300603' },
  { id: 'f12', sku: 'YOG-NAT-150', name: 'Joghurt Natúr 150g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.15, shelfLifeDays: 21, minStockThreshold: 500, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300701' },
  { id: 'f13', sku: 'YOG-DRK-330', name: 'Ivójoghurt Eper 330g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.33, shelfLifeDays: 21, minStockThreshold: 200, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300705' },
  { id: 'f14', sku: 'KEFIR-330', name: 'Kefir 330g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.33, shelfLifeDays: 28, minStockThreshold: 150, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300801' },
  { id: 'f15', sku: 'SANA-330', name: 'Sana 330g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.33, shelfLifeDays: 28, minStockThreshold: 150, storageTempMin: 2, storageTempMax: 6, sagaRefId: '300802' },
  { id: 'f16', sku: 'BUT-82-200', name: 'Vaj 82% 200g', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 0.20, shelfLifeDays: 45, minStockThreshold: 300, storageTempMin: 0, storageTempMax: 4, sagaRefId: '300901' },
  { id: 'f17', sku: 'MILK-15-1L', name: 'Tej 1.5% 1L (Zacskós)', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 1.0, shelfLifeDays: 5, minStockThreshold: 1000, storageTempMin: 2, storageTempMax: 4, sagaRefId: '301001' },
  { id: 'f18', sku: 'MILK-35-1L', name: 'Tej 3.5% 1L (ESL Dobozos)', category: ProductCategory.FINISHED, uom: 'db', weightNetKg: 1.0, shelfLifeDays: 21, minStockThreshold: 500, storageTempMin: 2, storageTempMax: 6, sagaRefId: '301002' },

  // --- CSOMAGOLÓANYAGOK (PACKAGING) - 12 db ---
  { id: 'p1', sku: 'PKG-VAC-2030', name: 'Vákuum tasak 20x30 (100mic)', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 5000, sagaRefId: 'MAT-005' },
  { id: 'p2', sku: 'PKG-VAC-3040', name: 'Vákuum tasak 30x40 (120mic)', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 3000, sagaRefId: 'MAT-006' },
  { id: 'p3', sku: 'PKG-CUP-350', name: 'Műanyag Pohár 350g (Tejföl)', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 10000, sagaRefId: 'MAT-020' },
  { id: 'p4', sku: 'PKG-CUP-150', name: 'Műanyag Pohár 150g (Joghurt)', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 15000, sagaRefId: 'MAT-021' },
  { id: 'p5', sku: 'PKG-LID-75', name: 'Alu Fedőfólia 75mm', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 20000, sagaRefId: 'MAT-025' },
  { id: 'p6', sku: 'PKG-LID-95', name: 'Alu Fedőfólia 95mm', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 20000, sagaRefId: 'MAT-026' },
  { id: 'p7', sku: 'PKG-BOX-CHS', name: 'Karton Doboz (Sajtgyűjtő 12db)', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 500, sagaRefId: 'MAT-050' },
  { id: 'p8', sku: 'PKG-LAB-RUC', name: 'Címke Rucăr 450g', category: ProductCategory.PACKAGING, uom: 'tekercs', minStockThreshold: 10, sagaRefId: 'MAT-080' },
  { id: 'p9', sku: 'PKG-LAB-DAL', name: 'Címke Dalia 450g', category: ProductCategory.PACKAGING, uom: 'tekercs', minStockThreshold: 10, sagaRefId: 'MAT-081' },
  { id: 'p10', sku: 'PKG-BAG-PE', name: 'Tejes Zacskó PE 1L (Nyomott)', category: ProductCategory.PACKAGING, uom: 'tekercs', minStockThreshold: 20, sagaRefId: 'MAT-090' },
  { id: 'p11', sku: 'PKG-SHRINK', name: 'Zsugorfólia 50cm', category: ProductCategory.PACKAGING, uom: 'kg', minStockThreshold: 50, sagaRefId: 'MAT-100' },
  { id: 'p12', sku: 'PKG-PAL-EUR', name: 'Raklap EUR', category: ProductCategory.PACKAGING, uom: 'db', minStockThreshold: 40, sagaRefId: 'MAT-200' },

  // --- ALAPANYAGOK (INGREDIENT) - 11 db ---
  { id: 'i1', sku: 'ING-MILK-RAW', name: 'Nyers Tehéntej', category: ProductCategory.RAW_MILK, uom: 'l', minStockThreshold: 5000, storageTempMax: 4, sagaRefId: 'RAW-001' },
  { id: 'i2', sku: 'ING-CULT-MESO', name: 'Kultúra Mesofil (Sajt)', category: ProductCategory.INGREDIENT, uom: 'csom', minStockThreshold: 20, storageTempMax: -18, sagaRefId: 'ING-101' },
  { id: 'i3', sku: 'ING-CULT-THER', name: 'Kultúra Thermofil (Joghurt)', category: ProductCategory.INGREDIENT, uom: 'csom', minStockThreshold: 20, storageTempMax: -18, sagaRefId: 'ING-102' },
  { id: 'i4', sku: 'ING-REN-CHYM', name: 'Oltó (Chymosin) 500ml', category: ProductCategory.INGREDIENT, uom: 'l', minStockThreshold: 5, storageTempMax: 4, sagaRefId: 'ING-105' },
  { id: 'i5', sku: 'ING-CACL', name: 'Kalcium-klorid 33%', category: ProductCategory.INGREDIENT, uom: 'l', minStockThreshold: 50, sagaRefId: 'ING-110' },
  { id: 'i6', sku: 'ING-SALT', name: 'Só (Ipari, jódozatlan)', category: ProductCategory.INGREDIENT, uom: 'kg', minStockThreshold: 1000, sagaRefId: 'ING-200' },
  { id: 'i7', sku: 'ING-FRUIT-STR', name: 'Gyümölcsvelő Eper', category: ProductCategory.INGREDIENT, uom: 'kg', minStockThreshold: 200, storageTempMax: 20, sagaRefId: 'ING-301' },
  { id: 'i8', sku: 'ING-FRUIT-PEA', name: 'Gyümölcsvelő Barack', category: ProductCategory.INGREDIENT, uom: 'kg', minStockThreshold: 200, storageTempMax: 20, sagaRefId: 'ING-302' },
  { id: 'i9', sku: 'ING-SUGAR', name: 'Kristálycukor', category: ProductCategory.INGREDIENT, uom: 'kg', minStockThreshold: 500, sagaRefId: 'ING-400' },
  { id: 'i10', sku: 'ING-STARCH', name: 'Módosított Keményítő', category: ProductCategory.INGREDIENT, uom: 'kg', minStockThreshold: 100, sagaRefId: 'ING-500' },
  { id: 'i11', sku: 'ING-SMK-LIQ', name: 'Füst Aroma (Folyékony)', category: ProductCategory.INGREDIENT, uom: 'l', minStockThreshold: 10, sagaRefId: 'ING-600' },

  // --- FÉLKÉSZ TERMÉKEK (WIP) - 16 db ---
  { id: 'w1', sku: 'WIP-MILK-PAST', name: 'Pasztőrözött Tej (Sajt Alap)', category: ProductCategory.WIP, uom: 'l', minStockThreshold: 0, storageTempMax: 6 },
  { id: 'w2', sku: 'WIP-MILK-YOG', name: 'Pasztőrözött Tej (Joghurt Alap)', category: ProductCategory.WIP, uom: 'l', minStockThreshold: 0, storageTempMax: 6 },
  { id: 'w3', sku: 'WIP-CURD-RUC', name: 'Alvadék (Rucăr)', category: ProductCategory.WIP, uom: 'kg', minStockThreshold: 0 },
  { id: 'w4', sku: 'WIP-CURD-TEL', name: 'Alvadék (Telemea)', category: ProductCategory.WIP, uom: 'kg', minStockThreshold: 0 },
  { id: 'w5', sku: 'WIP-CHS-PRESS-RUC', name: 'Préselt Sajt Rucăr (Friss)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.5, minStockThreshold: 0 },
  { id: 'w6', sku: 'WIP-CHS-PRESS-DAL', name: 'Préselt Sajt Dalia (Friss)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.5, minStockThreshold: 0 },
  { id: 'w7', sku: 'WIP-CHS-SALT-RUC', name: 'Sózott Sajt Rucăr (24h)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.48, minStockThreshold: 0 },
  { id: 'w8', sku: 'WIP-MAT-RUC-1W', name: 'Érlelés alatt: Rucăr (1 hét)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.47, minStockThreshold: 0, storageTempMax: 12 },
  { id: 'w9', sku: 'WIP-MAT-RUC-2W', name: 'Érlelés alatt: Rucăr (2 hét)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.46, minStockThreshold: 0, storageTempMax: 12 },
  { id: 'w10', sku: 'WIP-MAT-DAL-1W', name: 'Érlelés alatt: Dalia (1 hét)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.47, minStockThreshold: 0, storageTempMax: 12 },
  { id: 'w11', sku: 'WIP-MAT-DAL-3W', name: 'Érlelés alatt: Dalia (3 hét)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.45, minStockThreshold: 0, storageTempMax: 12 },
  { id: 'w12', sku: 'WIP-MAT-TRAP-1M', name: 'Érlelés alatt: Trapista (1 hónap)', category: ProductCategory.WIP, uom: 'db', weightNetKg: 0.5, minStockThreshold: 0, storageTempMax: 12 },
  { id: 'w13', sku: 'WIP-CURD-COTT', name: 'Túró alap (Szikkasztás)', category: ProductCategory.WIP, uom: 'kg', minStockThreshold: 0, storageTempMax: 4 },
  { id: 'w14', sku: 'WIP-TANK-SC', name: 'Tejföl Érlelés (Tank A)', category: ProductCategory.WIP, uom: 'l', minStockThreshold: 0, storageTempMax: 24 },
  { id: 'w15', sku: 'WIP-TANK-YOG', name: 'Joghurt Érlelés (Tank B)', category: ProductCategory.WIP, uom: 'l', minStockThreshold: 0, storageTempMax: 42 },
  { id: 'w16', sku: 'WIP-BLOCK-MOZZ', name: 'Mozzarella Blokk (Vágatlan)', category: ProductCategory.WIP, uom: 'kg', minStockThreshold: 0, storageTempMax: 4 }
];

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Filter
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sagaRefId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleDelete = (id: string) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
      setProducts(products.filter(p => p.id !== id));
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

    // 2. Duplicate Check
    const isDuplicateSKU = products.some(p => p.sku === product.sku && p.id !== product.id);
    if (isDuplicateSKU) {
      setWarningMsg(`A megadott Cikkszám (${product.sku}) már létezik!`);
      return false;
    }

    // 3. Duplicate Name Warning (Weak check)
    const isSimilarName = products.some(p => p.name.toLowerCase() === product.name?.toLowerCase() && p.id !== product.id);
    if (isSimilarName && !warningMsg) {
       // This is just a warning, normally we'd ask confirmation, but for now we block to force unique names or let user bypass in a real app
       setWarningMsg('Figyelem: Ilyen nevű termék már létezik. Kérlek használj egyedi elnevezést.');
       return false;
    }
    
    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProduct(currentProduct)) return;

    if (isEditing && currentProduct.id) {
      setProducts(products.map(p => p.id === currentProduct.id ? currentProduct as Product : p));
    } else {
      const newProduct: Product = {
        ...currentProduct as Product,
        id: Math.random().toString(36).substr(2, 9)
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredProducts.map((product) => (
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