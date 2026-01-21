
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  ChevronRight, 
  Search, 
  LogOut,
  BrainCircuit,
  X,
  Globe
} from 'lucide-react';
import { UserRole, MenuItem } from './types';
import { getInternalMenu, getDriverMenu, getPartnerMenu, getAgentMenu } from './constants';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';
import FleetManagement from './components/FleetManagement';
import SupplierManagement from './components/SupplierManagement';
import SupplierGroupManagement from './components/SupplierGroupManagement';
import ContractManagement from './components/ContractManagement';
import DailyCollection from './components/DailyCollection';
import ShipmentArrival from './components/ShipmentArrival';
import RoutePlanner from './components/RoutePlanner';
import DriverCollection from './components/DriverCollection';
import RawMaterialInventory from './components/RawMaterialInventory';
import AuxiliaryInventory from './components/AuxiliaryInventory';
import WipInventory from './components/WipInventory';
import InventoryMoves from './components/InventoryMoves';
import FinishedGoodsInventory from './components/FinishedGoodsInventory';
import RecipeManagement from './components/RecipeManagement';
import ProductionPlan from './components/ProductionPlan';
import ActiveProduction from './components/ActiveProduction';
import HaccpLogs from './components/HaccpLogs';
import LabTests from './components/LabTests';
import PartnerManagement from './components/PartnerManagement';
import OrderManagement from './components/OrderManagement';
import DeliveryPlanner from './components/DeliveryPlanner';
import EmptyModule from './components/EmptyModule';
import AgentDashboard from './components/AgentDashboard';
import AgentSales from './components/AgentSales';
import AgentFinance from './components/AgentFinance';
import PartnerNewOrder from './components/PartnerNewOrder';
import PartnerOrders from './components/PartnerOrders';
import PartnerInvoices from './components/PartnerInvoices';
import PartnerProfile from './components/PartnerProfile';
import LotProfitability from './components/LotProfitability';
import CostAnalysis from './components/CostAnalysis';
import SagaIntegration from './components/SagaIntegration';
import AuditLog from './components/AuditLog'; 
import FarmerInvoicing from './components/FarmerInvoicing'; // Új modul import
import { askBomilactCore } from './services/geminiService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Language } from './translations';

const MainLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  // State
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.INTERNAL);
  const [activeMenuId, setActiveMenuId] = useState<string>('dashboard');
  const [activeSubMenuId, setActiveSubMenuId] = useState<string>('dash_summary');
  
  // Sidebar state: Open by default only on large screens
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Helper to get current menu structure based on role
  const getMenuStructure = () => {
    switch (currentRole) {
      case UserRole.DRIVER: return getDriverMenu(t);
      case UserRole.PARTNER: return getPartnerMenu(t);
      case UserRole.AGENT: return getAgentMenu(t);
      default: return getInternalMenu(t);
    }
  };

  const menu = getMenuStructure();

  // Find active item details for display
  const activeMainItem = menu.find(i => i.id === activeMenuId) || menu[0];
  const activeSubItem = activeMainItem.subItems?.find(s => s.id === activeSubMenuId);

  // AI Handler
  const handleAiAsk = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    const result = await askBomilactCore(aiPrompt, language);
    setAiResponse(result.text);
    setAiLoading(false);
  };

  // Render Component Logic
  const renderContent = () => {
    // 1. Dashboard
    if (activeMenuId === 'dashboard' && currentRole === UserRole.INTERNAL) {
      if (activeSubMenuId === 'dash_summary') return <Dashboard />;
      return <EmptyModule title={activeSubItem?.label || "Modul"} description={activeSubItem?.description} />;
    }
    
    // 2. Logistics Modules
    if (activeMenuId === 'logistics' && currentRole === UserRole.INTERNAL) {
       if (activeSubMenuId === 'log_shipments') return <ShipmentArrival />;
       if (activeSubMenuId === 'log_collection') return <DailyCollection />;
       if (activeSubMenuId === 'log_farmer_invoicing') return <FarmerInvoicing />; // Új modul renderelése
       if (activeSubMenuId === 'log_routes') return <RoutePlanner />;
       if (activeSubMenuId === 'log_fleet') return <FleetManagement />;
       if (activeSubMenuId === 'log_suppliers') return <SupplierManagement />;
       if (activeSubMenuId === 'log_supplier_groups') return <SupplierGroupManagement />; 
       if (activeSubMenuId === 'log_contracts') return <ContractManagement />;
    }
    
    // 3. Inventory Modules
    if (activeMenuId === 'inventory' && currentRole === UserRole.INTERNAL) {
      if (activeSubMenuId === 'inv_raw') return <RawMaterialInventory />;
      if (activeSubMenuId === 'inv_aux') return <AuxiliaryInventory />;
      if (activeSubMenuId === 'inv_wip') return <WipInventory />;
      if (activeSubMenuId === 'inv_finished') return <FinishedGoodsInventory />;
      if (activeSubMenuId === 'inv_moves') return <InventoryMoves />;
    }

    // 4. Production Modules
    if (activeMenuId === 'production' && currentRole === UserRole.INTERNAL) {
      if (activeSubMenuId === 'prod_plan') return <ProductionPlan />;
      if (activeSubMenuId === 'prod_active') return <ActiveProduction />;
      if (activeSubMenuId === 'prod_bom') return <RecipeManagement />;
      if (activeSubMenuId === 'prod_haccp') return <HaccpLogs />;
    }

    // 5. QA Modules
    if (activeMenuId === 'qa' && currentRole === UserRole.INTERNAL) {
       if (activeSubMenuId === 'qa_lab') return <LabTests />;
       if (activeSubMenuId === 'qa_haccp_logs') return <HaccpLogs />;
    }

    // 6. Sales Modules
    if (activeMenuId === 'sales' && currentRole === UserRole.INTERNAL) {
       if (activeSubMenuId === 'sales_orders') return <OrderManagement />;
       if (activeSubMenuId === 'sales_partners') return <PartnerManagement />;
       if (activeSubMenuId === 'sales_delivery') return <DeliveryPlanner />;
    }

    // 7. Finance Modules
    if (activeMenuId === 'finance' && currentRole === UserRole.INTERNAL) {
      if (activeSubMenuId === 'fin_profit') return <LotProfitability />;
      if (activeSubMenuId === 'fin_costs') return <CostAnalysis />;
      if (activeSubMenuId === 'fin_saga') return <SagaIntegration />;
    }
    
    // 8. Admin Modules
    if (activeMenuId === 'admin' && currentRole === UserRole.INTERNAL) {
      if (activeSubMenuId === 'admin_users') return <UserManagement />;
      if (activeSubMenuId === 'admin_products') return <ProductManagement />;
      if (activeSubMenuId === 'admin_logs') return <AuditLog />; 
    }

    // 9. Driver Modules
    if (currentRole === UserRole.DRIVER) {
       if (activeMenuId === 'drive_pickup') return <DriverCollection />;
       if (activeMenuId === 'drive_route') return <RoutePlanner />; 
    }

    // 10. Agent Modules
    if (currentRole === UserRole.AGENT) {
      if (activeMenuId === 'agt_dashboard') return <AgentDashboard />;
      if (activeMenuId === 'agt_sales') return <AgentSales />;
      if (activeMenuId === 'agt_finance') return <AgentFinance />;
    }

    // 11. Partner Modules
    if (currentRole === UserRole.PARTNER) {
      if (activeMenuId === 'part_new_order') return <PartnerNewOrder />;
      if (activeMenuId === 'part_my_orders') return <PartnerOrders />;
      if (activeMenuId === 'part_invoices') return <PartnerInvoices />;
      if (activeMenuId === 'part_profile') return <PartnerProfile />;
    }
    
    // Default placeholder for all other pages
    const title = activeSubItem ? `${activeMainItem.label} - ${activeSubItem.label}` : activeMainItem.label;
    const desc = activeSubItem?.description || "Válasszon egy funkciót a menüből.";
    return <EmptyModule title={title} description={desc} />;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 shadow-xl flex flex-col
          lg:static lg:z-auto
          ${sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full w-72 lg:translate-x-0 lg:w-20'}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
          <div className={`flex items-center space-x-2 animate-fade-in ${!sidebarOpen && 'lg:hidden'}`}> 
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-lg">B</span>
             </div>
             <span className="font-bold text-xl tracking-tight whitespace-nowrap">
               Bomilact<span className="text-blue-400 font-light">ERP</span>
             </span>
          </div>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
          >
             <span className="lg:hidden"><X size={24} /></span>
             <div className="hidden lg:block">
               {!sidebarOpen ? <div className="font-bold text-xl text-blue-500 text-center w-full">B</div> : <Menu size={20} />}
             </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-2">
            {menu.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveMenuId(item.id);
                    if (item.subItems && item.subItems.length > 0) {
                      setActiveSubMenuId(item.subItems[0].id);
                    }
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors group relative
                    ${activeMenuId === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  {item.icon && <item.icon size={22} className={`min-w-[22px] ${activeMenuId === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />}
                  
                  <span className={`font-medium text-sm text-left flex-1 transition-opacity duration-200 ${!sidebarOpen ? 'lg:hidden' : 'block'}`}>
                    {item.label}
                  </span>
                  
                  {!sidebarOpen && (
                    <div className="hidden lg:block absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none shadow-xl border border-slate-700">
                      {item.label}
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {sidebarOpen && activeMenuId === item.id && item.subItems && (
                  <ul className="mt-1 ml-4 border-l border-slate-700 pl-2 space-y-1 animate-slide-down">
                    {item.subItems.map((sub) => (
                      <li key={sub.id}>
                        <button
                          onClick={() => {
                            setActiveSubMenuId(sub.id);
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center justify-between
                            ${activeSubMenuId === sub.id ? 'text-blue-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}
                          `}
                        >
                          <span className="truncate">{sub.label}</span>
                          {activeSubMenuId === sub.id && <ChevronRight size={14} className="flex-shrink-0 ml-2" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Language & Role Switcher */}
        <div className="p-4 border-t border-slate-800 space-y-4">
           {/* Language Switcher */}
           <div>
              {sidebarOpen && <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center"><Globe size={10} className="mr-1"/> {t('ui.language')}</p>}
              <div className={`flex ${sidebarOpen ? 'flex-row' : 'flex-col'} gap-2`}>
                <button 
                  onClick={() => setLanguage('hu')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded ${language === 'hu' ? 'bg-slate-100 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  HU
                </button>
                <button 
                  onClick={() => setLanguage('ro')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded ${language === 'ro' ? 'bg-slate-100 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  RO
                </button>
              </div>
           </div>

           {/* Role Switcher */}
           <div>
              {sidebarOpen && <p className="text-xs text-slate-500 uppercase font-bold mb-2">{t('ui.role_switch')}</p>}
              <div className={`grid ${sidebarOpen ? 'grid-cols-4' : 'grid-cols-1'} gap-2`}>
                <button 
                  onClick={() => setCurrentRole(UserRole.INTERNAL)}
                  className={`flex items-center justify-center py-1.5 text-xs font-bold rounded ${currentRole === UserRole.INTERNAL ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                  title="Internal"
                >
                  INT
                </button>
                <button 
                  onClick={() => setCurrentRole(UserRole.DRIVER)}
                  className={`flex items-center justify-center py-1.5 text-xs font-bold rounded ${currentRole === UserRole.DRIVER ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                  title="Driver"
                >
                  DRV
                </button>
                <button 
                  onClick={() => setCurrentRole(UserRole.AGENT)}
                  className={`flex items-center justify-center py-1.5 text-xs font-bold rounded ${currentRole === UserRole.AGENT ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                  title="Agent"
                >
                  AGT
                </button>
                <button 
                  onClick={() => setCurrentRole(UserRole.PARTNER)}
                  className={`flex items-center justify-center py-1.5 text-xs font-bold rounded ${currentRole === UserRole.PARTNER ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                  title="Partner"
                >
                  PRT
                </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full flex flex-col relative w-full">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm shrink-0">
          
          {/* Mobile Menu Button & Search */}
          <div className="flex items-center flex-1 gap-3 overflow-hidden">
             <button 
               onClick={() => setSidebarOpen(true)}
               className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
             >
               <Menu size={24} />
             </button>

             {/* Search Bar */}
             <div className="relative flex-1 max-w-xl">
                <BrainCircuit className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                <input 
                  type="text" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                  placeholder={t('ui.ai_placeholder')}
                  className="w-full pl-10 pr-10 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white focus:shadow-md truncate"
                />
                <button 
                  onClick={handleAiAsk}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex-shrink-0"
                >
                  <Search size={14} />
                </button>
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4 ml-2 flex-shrink-0">
             <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
             <div className="flex items-center space-x-3">
               <div className="text-right hidden md:block">
                 <div className="text-sm font-bold text-slate-800">
                   {currentRole === UserRole.AGENT ? 'Ügynök Péter' : currentRole === UserRole.PARTNER ? 'Kisbolt Kft.' : 'Kovács János'}
                 </div>
                 <div className="text-xs text-slate-500">
                   {currentRole === UserRole.AGENT ? 'Értékesítő' : currentRole === UserRole.PARTNER ? 'Partner' : 'Termelésvezető'}
                 </div>
               </div>
               <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                 {currentRole === UserRole.AGENT ? 'ÜP' : currentRole === UserRole.PARTNER ? 'KB' : 'KJ'}
               </div>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 lg:p-6 flex-1 overflow-x-hidden">
           {renderContent()}
        </div>

        {/* AI Response Overlay */}
        {aiResponse && (
          <div className="fixed inset-x-2 bottom-2 md:inset-x-auto md:bottom-auto md:absolute md:top-20 md:right-6 md:w-96 bg-white rounded-xl shadow-2xl border border-blue-100 z-50 animate-slide-up md:animate-slide-left overflow-hidden">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center">
                   <BrainCircuit className="mr-2" size={20} />
                   <span className="font-bold">Bomilact Core AI</span>
                </div>
                <button onClick={() => setAiResponse(null)} className="hover:bg-white/20 p-1 rounded"><X size={18} /></button>
             </div>
             <div className="p-5 max-h-[50vh] md:max-h-[400px] overflow-y-auto">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResponse}
                </p>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Wrap App in Provider
const App = () => {
  return (
    <LanguageProvider>
      <MainLayout />
    </LanguageProvider>
  );
};

export default App;
