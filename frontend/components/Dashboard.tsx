import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { AlertTriangle, TrendingUp, Droplet, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const dataProduction = [
  { name: 'Hét', milk: 4000, cheese: 2400 },
  { name: 'Ked', milk: 3000, cheese: 1398 },
  { name: 'Sze', milk: 2000, cheese: 9800 },
  { name: 'Csü', milk: 2780, cheese: 3908 },
  { name: 'Pén', milk: 1890, cheese: 4800 },
  { name: 'Szo', milk: 2390, cheese: 3800 },
  { name: 'Vas', milk: 3490, cheese: 4300 },
];

const dataProfit = [
  { name: 'Jan', profit: 4000 },
  { name: 'Feb', profit: 3000 },
  { name: 'Már', profit: 2000 },
  { name: 'Ápr', profit: 2780 },
  { name: 'Máj', profit: 1890 },
  { name: 'Jún', profit: 2390 },
];

const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('dash.collection_vol')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">12,450 L</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Droplet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-medium">+5.2%</span>
            <span className="text-slate-400 ml-2">{t('dash.vs_yesterday')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('dash.stock_finished')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">8,320 kg</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-500">
            <AlertTriangle size={16} className="mr-1" />
            <span className="font-medium">2 LOT</span>
            <span className="text-slate-400 ml-2">{t('dash.lot_near_expiry')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('dash.production_today')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">94%</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-400">
            <span>{t('dash.capacity_usage')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('dash.margin_ytd')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">18.4%</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <BarChart size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-medium">+1.2%</span>
            <span className="text-slate-400 ml-2">{t('dash.vs_prev_month')}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('dash.chart_vol')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataProduction}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="milk" name={t('dash.chart_milk')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cheese" name={t('dash.chart_cheese')} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('dash.chart_profit')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataProfit}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section - Responsive Layout */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-4">
        <div className="bg-red-100 p-2 rounded-full text-red-600 flex-shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-red-800">{t('dash.alert_title')}</h4>
          <p className="text-red-700 text-sm mt-1 mb-2">
            {t('dash.alert_desc')}
          </p>
          <button className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition">
            {t('dash.alert_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;