
import { 
  LayoutDashboard, 
  Truck, 
  Factory, 
  Package, 
  Microscope, 
  ShoppingCart, 
  BadgeDollarSign, 
  Settings, 
  MapPin, 
  Droplet, 
  Wrench, 
  ShoppingBag, 
  FileText, 
  User,
  Briefcase,
  Users,
  Wallet,
  FileSignature,
  Layers,
  ClipboardList,
  FileOutput,
  Scale,
  Beaker
} from 'lucide-react';
import { MenuItem } from './types';

// Helper type for translation function
type Translator = (key: string) => string;

// --- 1. Internal User Menu (Admin / Production) ---
export const getInternalMenu = (t: Translator): MenuItem[] => [
  {
    id: 'dashboard',
    label: 'Vezérlőpult',
    icon: LayoutDashboard,
    subItems: [
      { id: 'dash_summary', label: 'Vezetői Összefoglaló', description: 'KPI (Napi tej, Gyártás, Eladás)' },
      { id: 'dash_alerts', label: 'Riasztások & HACCP', description: 'Kritikus készletek, technológiai határértékek' }
    ]
  },
  {
    id: 'logistics',
    label: 'Logisztika & Begyűjtés',
    icon: Truck,
    subItems: [
      { id: 'log_shipments', label: 'Beérkező Szállítmányok', description: 'Kamionok érkeztetése és gyors labor' },
      { id: 'log_collection', label: 'Napi Begyűjtési Napló', description: 'Begyűjtött mennyiségek rögzítése' },
      { id: 'log_farmer_invoicing', label: 'Gazda Elszámolás', description: 'Havi önszámlázás és borderou' },
      { id: 'log_routes', label: 'Útvonal Tervező', description: 'Begyűjtő járatok optimalizálása' },
      { id: 'log_fleet', label: 'Flotta & Mosás', description: 'Gépjárművek és CIP mosási napló' },
      { id: 'log_suppliers', label: 'Beszállítói Törzs', description: 'Gazdák és Gyűjtőpontok' },
      { id: 'log_supplier_groups', label: 'Körzetek Kezelése', description: 'Begyűjtési zónák' },
      { id: 'log_contracts', label: 'Szerződések & Árak', description: 'Kvóták és alapárak kezelése' }
    ]
  },
  {
    id: 'production',
    label: 'Termelés Menedzsment',
    icon: Factory,
    subItems: [
      { id: 'prod_plan', label: 'Gyártási Terv', description: 'Napi és heti ütemezés' },
      { id: 'prod_active', label: 'Aktív Gyártások', description: 'Valós idejű folyamatfelügyelet' },
      { id: 'prod_bom', label: 'Receptúrák (BOM)', description: 'Anyaghányadok kezelése' },
      { id: 'prod_haccp', label: 'Technológiai Napló', description: 'Digitális gyártási jegyzőkönyvek' }
    ]
  },
  {
    id: 'inventory',
    label: 'Raktárkészlet',
    icon: Package,
    subItems: [
      { id: 'inv_raw', label: 'Nyersanyag (Silók)', description: 'Tejkészlet és paraméterek' },
      { id: 'inv_aux', label: 'Segédanyag & Csomagoló', description: 'Oltó, kultúra, tasakok' },
      { id: 'inv_wip', label: 'Félkész (Érlelő)', description: 'Érlelés alatt álló sajtok' },
      { id: 'inv_finished', label: 'Késztermék Raktár', description: 'Eladásra kész árukészlet' },
      { id: 'inv_moves', label: 'Készletmozgások', description: 'Bevételezés, kiadás, selejtezés' }
    ]
  },
  {
    id: 'qa',
    label: 'Minőségügy (QA)',
    icon: Microscope,
    subItems: [
      { id: 'qa_lab', label: 'Laborvizsgálatok', description: 'Mintaeredmények rögzítése' },
      { id: 'qa_haccp_logs', label: 'HACCP Archívum', description: 'Ellenőrzési naplók exportja' },
      { id: 'qa_claims', label: 'Reklamációk', description: 'Vevői és beszállítói panaszok' }
    ]
  },
  {
    id: 'sales',
    label: 'Értékesítés',
    icon: ShoppingCart,
    subItems: [
      { id: 'sales_orders', label: 'Vevői Rendelések', description: 'Rendeléskezelés és státuszok' },
      { id: 'sales_partners', label: 'Vevőtörzs', description: 'Boltok, láncok, viszonteladók' },
      { id: 'sales_delivery', label: 'Kiszállítás Tervező', description: 'Járatok és fuvarlevelek' }
    ]
  },
  {
    id: 'finance',
    label: 'Pénzügy & Kontrolling',
    icon: BadgeDollarSign,
    subItems: [
      { id: 'fin_profit', label: 'Profitabilitás', description: 'LOT alapú önköltségszámítás' },
      { id: 'fin_saga', label: 'SAGA Integráció', description: 'Könyvelési adatok szinkronizálása' },
      { id: 'fin_costs', label: 'Költségelemzés', description: 'Rezsiköltségek és veszteségek' }
    ]
  },
  {
    id: 'admin',
    label: 'Adminisztráció',
    icon: Settings,
    subItems: [
      { id: 'admin_users', label: 'Felhasználók', description: 'Jogosultságok és hozzáférések' },
      { id: 'admin_products', label: 'Terméktörzs', description: 'SKU definíciók és paraméterek' },
      { id: 'admin_logs', label: 'Audit Log', description: 'Rendszeresemények naplózása' }
    ]
  }
];

export const getDriverMenu = (t: Translator): MenuItem[] => [
  { id: 'drive_route', label: 'Mai Begyűjtés', icon: MapPin },
  { id: 'drive_pickup', label: 'Tejátvétel', icon: Droplet },
  { id: 'drive_maint', label: 'CIP Mosás', icon: Wrench },
];

export const getAgentMenu = (t: Translator): MenuItem[] => [
  { id: 'agt_dashboard', label: 'Vezérlőpult', icon: Briefcase },
  { id: 'agt_sales', label: 'Rendelésfelvétel', icon: Users },
  { id: 'agt_finance', label: 'Pénzügyek', icon: Wallet },
];

export const getPartnerMenu = (t: Translator): MenuItem[] => [
  { id: 'part_new_order', label: 'Új Rendelés', icon: ShoppingBag },
  { id: 'part_my_orders', label: 'Rendeléseim', icon: Truck },
  { id: 'part_invoices', label: 'Számlák', icon: FileText },
  { id: 'part_profile', label: 'Adatlap', icon: User },
];
