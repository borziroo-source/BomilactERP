
import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  FileJson, 
  Download,
  Clock,
  Terminal,
  ArrowRight,
  X,
  ExternalLink,
  // Added missing XCircle icon
  XCircle
} from 'lucide-react';

// --- Types ---

type LogSeverity = 'INFO' | 'ACTION' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  details: string;
  severity: LogSeverity;
  ipAddress: string;
  metadata?: any;
}

// --- Mock Data ---

const INITIAL_LOGS: AuditEntry[] = [
  {
    id: 'LOG-8821',
    timestamp: '2023-10-27T10:45:00',
    userId: 'u-001',
    userName: 'Kovács János',
    module: 'Inventory',
    action: 'UPDATE_STOCK',
    details: 'Nyers tej készlet manuális korrekciója (14500L -> 14800L)',
    severity: 'WARNING',
    ipAddress: '192.168.1.45',
    metadata: { old: 14500, new: 14800, reason: 'Mérési hiba korrekció' }
  },
  {
    id: 'LOG-8822',
    timestamp: '2023-10-27T10:15:22',
    userId: 'system',
    userName: 'SAGA Connector',
    module: 'Finance',
    action: 'EXPORT_INVOICES',
    details: '42 db számla sikeresen exportálva a SAGA szoftverbe.',
    severity: 'INFO',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'LOG-8823',
    timestamp: '2023-10-27T09:30:10',
    userId: 'u-002',
    userName: 'Nagy Éva',
    module: 'Production',
    action: 'CREATE_RECIPE',
    details: 'Új receptúra létrehozva: Sajt Trapista v1.2',
    severity: 'ACTION',
    ipAddress: '192.168.1.12'
  },
  {
    id: 'LOG-8824',
    timestamp: '2023-10-27T08:05:45',
    userId: 'u-005',
    userName: 'Varga Péter',
    module: 'Admin',
    action: 'LOGIN_SUCCESS',
    details: 'Sikeres bejelentkezés.',
    severity: 'INFO',
    ipAddress: '172.20.5.11'
  },
  {
    id: 'LOG-8825',
    timestamp: '2023-10-26T18:00:00',
    userId: 'system',
    userName: 'Security Watchdog',
    module: 'Auth',
    action: 'FAILED_LOGIN_ATTEMPT',
    details: '3 sikertelen bejelentkezési kísérlet a "Kovács" felhasználóval.',
    severity: 'CRITICAL',
    ipAddress: '45.122.3.1',
    metadata: { attempts: 3, target: 'KovacsJ' }
  },
  {
    id: 'LOG-8826',
    timestamp: '2023-10-26T16:20:00',
    userId: 'u-001',
    userName: 'Kovács János',
    module: 'Logistics',
    action: 'DELETE_SUPPLIER',
    details: 'Beszállító törlése: Kisgazda Bt. (CUI: 887722)',
    severity: 'ERROR',
    ipAddress: '192.168.1.45'
  }
];

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'ALL'>('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  
  // Detail View
  const [selectedLog, setSelectedLog] = useState<AuditEntry | null>(null);

  // --- Calculations ---

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
      return matchesSearch && matchesSeverity && matchesModule;
    });
  }, [logs, searchTerm, severityFilter, moduleFilter]);

  const stats = useMemo(() => {
    const todayCount = logs.filter(l => l.timestamp.startsWith('2023-10-27')).length;
    const criticalCount = logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'ERROR').length;
    const activeModule = 'Inventory'; // Hardcoded for demo
    return { todayCount, criticalCount, activeModule };
  }, [logs]);

  const modules = Array.from(new Set(logs.map(l => l.module)));

  // --- Helpers ---

  const getSeverityStyles = (severity: LogSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'ERROR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ACTION': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getSeverityIcon = (severity: LogSeverity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertCircle size={14} className="mr-1.5" />;
      case 'ERROR': return <XCircle size={14} className="mr-1.5" />;
      case 'WARNING': return <AlertCircle size={14} className="mr-1.5" />;
      case 'ACTION': return <CheckCircle size={14} className="mr-1.5" />;
      default: return <Info size={14} className="mr-1.5" />;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Események (Ma)</p>
             <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.todayCount} db</h3>
           </div>
           <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
             <Activity size={24} />
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Kritikus / Hiba</p>
             <h3 className={`text-2xl font-black mt-1 ${stats.criticalCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
               {stats.criticalCount} db
             </h3>
           </div>
           <div className={`p-2.5 rounded-xl ${stats.criticalCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
             <Shield size={24} />
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-bold uppercase">Aktív Modul</p>
             <h3 className="text-xl font-black text-slate-800 mt-1">{stats.activeModule}</h3>
           </div>
           <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl">
             <Terminal size={24} />
           </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl shadow-lg flex flex-col justify-center text-white relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Biztonsági Napló</p>
              <p className="text-xs text-slate-300 leading-snug">Az összes esemény 90 napig tárolva.</p>
           </div>
           <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase py-1.5 rounded transition relative z-10 flex items-center justify-center">
              <Download size={12} className="mr-1.5" /> Teljes Export
           </button>
           <div className="absolute -right-2 -bottom-2 opacity-10 text-white transform rotate-12">
              <Shield size={64} />
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
         <div className="flex space-x-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setSeverityFilter('ALL')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${severityFilter === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Összes
            </button>
            <button 
              onClick={() => setSeverityFilter('CRITICAL')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${severityFilter === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Kritikus
            </button>
            <button 
              onClick={() => setSeverityFilter('WARNING')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${severityFilter === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Figyelem
            </button>
            <button 
              onClick={() => setSeverityFilter('ACTION')} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${severityFilter === 'ACTION' ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              Akciók
            </button>
         </div>

         <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
               <option value="ALL">Minden Modul</option>
               {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="relative flex-1 md:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Keresés tartalomra..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                     <th className="px-6 py-4">Időpont</th>
                     <th className="px-6 py-4">Felhasználó</th>
                     <th className="px-6 py-4">Modul / Művelet</th>
                     <th className="px-6 py-4">Esemény Leírása</th>
                     <th className="px-6 py-4">Súlyosság</th>
                     <th className="px-6 py-4 text-right">Részletek</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition group">
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-slate-800">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                             <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center">
                             <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-slate-500 text-[10px] border border-slate-200">
                                {log.userName.charAt(0)}
                             </div>
                             <div>
                                <div className="text-slate-700 font-bold">{log.userName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-500 mb-0.5 uppercase">{log.module}</div>
                          <div className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">{log.action}</div>
                       </td>
                       <td className="px-6 py-4 max-w-md">
                          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{log.details}</p>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getSeverityStyles(log.severity)}`}>
                             {getSeverityIcon(log.severity)}
                             {log.severity}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                             <ExternalLink size={18} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {filteredLogs.length === 0 && (
               <div className="p-12 text-center text-slate-400 italic">Nem található rögzített esemény a szűrésnek megfelelően.</div>
            )}
         </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center">
                    <Terminal className="mr-3 text-blue-400" />
                    Esemény Részletei: {selectedLog.id}
                 </h3>
                 <button onClick={() => setSelectedLog(null)} className="hover:bg-slate-700 p-1.5 rounded-lg transition"><X size={20}/></button>
              </div>
              
              <div className="p-6 space-y-6">
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Időbélyeg</span>
                       <div className="text-sm font-medium text-slate-800 flex items-center">
                          <Clock size={14} className="mr-1.5 text-slate-400" />
                          {new Date(selectedLog.timestamp).toLocaleString()}
                       </div>
                    </div>
                    <div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Modul / Művelet</span>
                       <div className="text-sm font-bold text-blue-600 uppercase">
                          {selectedLog.module} &raquo; {selectedLog.action}
                       </div>
                    </div>
                    <div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Végrehajtó</span>
                       <div className="text-sm font-medium text-slate-800 flex items-center">
                          <User size={14} className="mr-1.5 text-slate-400" />
                          {selectedLog.userName} ({selectedLog.userId})
                       </div>
                    </div>
                    <div>
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">IP Cím</span>
                       <div className="text-sm font-mono text-slate-600">{selectedLog.ipAddress}</div>
                    </div>
                 </div>

                 <div className="border-t border-slate-100 pt-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Leírás</span>
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm border border-slate-200">
                       {selectedLog.details}
                    </div>
                 </div>

                 {selectedLog.metadata && (
                    <div className="border-t border-slate-100 pt-4">
                       <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Technikai Metaadatok (JSON)</span>
                       <div className="bg-slate-900 p-4 rounded-xl font-mono text-[11px] text-blue-300 overflow-x-auto">
                          <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                       </div>
                    </div>
                 )}

                 <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setSelectedLog(null)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition"
                    >
                       Bezárás
                    </button>
                    <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center">
                       <FileJson size={18} className="mr-2" /> Napló Másolása
                    </button>
                 </div>

              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AuditLog;
