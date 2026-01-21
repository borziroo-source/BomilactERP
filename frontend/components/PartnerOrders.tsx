
import React from 'react';
import { 
  Package, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle, 
  FileText 
} from 'lucide-react';

// Mock Orders
const MY_ORDERS = [
  { id: 'ORD-2310-001', date: '2023-10-25', status: 'SHIPPED', amount: 1850.50, items: 12 },
  { id: 'ORD-2310-005', date: '2023-10-18', status: 'DELIVERED', amount: 420.00, items: 4 },
  { id: 'ORD-2309-088', date: '2023-09-30', status: 'DELIVERED', amount: 2100.00, items: 25 },
  { id: 'ORD-2310-012', date: '2023-10-27', status: 'PROCESSING', amount: 890.00, items: 8 },
];

const PartnerOrders: React.FC = () => {
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PROCESSING': return { label: 'Feldolgozás', color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'SHIPPED': return { label: 'Szállítás alatt', color: 'bg-blue-100 text-blue-700', icon: Truck };
      case 'DELIVERED': return { label: 'Kézbesítve', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      default: return { label: status, color: 'bg-slate-100 text-slate-700', icon: Package };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Rendeléseim</h2>
        <p className="text-sm text-slate-500">Korábbi rendelések állapota és részletei</p>
      </div>

      <div className="space-y-4">
        {MY_ORDERS.map(order => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;

          return (
            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group cursor-pointer">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${statusInfo.color.replace('text-', 'bg-').replace('100', '50')} ${statusInfo.color}`}>
                    <StatusIcon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{order.id}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar size={14} className="mr-1" /> {order.date}
                      <span className="mx-2">•</span>
                      <Package size={14} className="mr-1" /> {order.items} tétel
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase">Végösszeg</div>
                    <div className="text-xl font-black text-slate-800">{order.amount.toLocaleString()} RON</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    <ChevronRight size={20} />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerOrders;
