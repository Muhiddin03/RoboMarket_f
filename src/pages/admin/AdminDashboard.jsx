import { useState, useEffect } from 'react';
import { fmtDate, fmtDateTime } from '../../utils/date';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, ChevronRight, DollarSign, Zap, BarChart3, Download } from 'lucide-react';
import { ordersApi } from '../../utils/api';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_CLS = {
  new: 'bg-sky-900/40 text-sky-400 border-sky-800/50',
  processing: 'bg-amber-900/40 text-amber-400 border-amber-800/50',
  shipped: 'bg-purple-900/40 text-purple-400 border-purple-800/50',
  delivered: 'bg-violet-900/40 text-violet-400 border-violet-800/50',
  cancelled: 'bg-rose-900/40 text-rose-400 border-rose-800/50',
};
const STATUS_LBL = { new: 'Yangi', processing: 'Jarayonda', shipped: "Yo'lda", delivered: 'Yetkazildi', cancelled: 'Bekor' };
const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('weekly');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      ordersApi.getStats(),
      ordersApi.getAll({ limit: 8 }),
      api.get('/orders/low-stock'),
    ]).then(([s, r, ls]) => {
      setStats(s.data);
      setRecent(r.data.orders || []);
      setLowStock(ls.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/report?type=${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Hisobot generatsiya qilishda xato');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `robomarket_hisobot_${reportType}_${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Hisobot yuklab olindi!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
    </div>
  );

  const cards = [
    { icon: Package, label: 'Mahsulotlar', value: stats?.total_products || 0, sub: `${stats?.out_of_stock || 0} ta tugagan`, color: 'bg-amber-900/20', ic: 'text-amber-400', border: 'border-amber-800/30' },
    { icon: ShoppingCart, label: 'Zakazlar', value: stats?.total_orders || 0, sub: `${stats?.new_orders || 0} ta yangi`, color: 'bg-sky-900/20', ic: 'text-sky-400', border: 'border-sky-800/30' },
    { icon: TrendingUp, label: 'Daromad', value: `${fmt(stats?.total_revenue)}`, sub: 'so\'m — yetkazilgan', color: 'bg-indigo-900/20', ic: 'text-indigo-400', border: 'border-indigo-800/30' },
    { icon: DollarSign, label: 'Foyda', value: `${fmt(stats?.total_profit)}`, sub: 'so\'m — sof foyda', color: 'bg-violet-900/20', ic: 'text-violet-400', border: 'border-violet-800/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Dashboard</h1>
          <p className="text-slate-500 text-sm">Umumiy ko'rsatkichlar</p>
        </div>
        {/* Report download */}
        <div className="flex items-center gap-2">
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="select text-sm py-2 w-32">
            <option value="weekly">Haftalik</option>
            <option value="monthly">Oylik</option>
          </select>
          <button onClick={generateReport} disabled={generating} className="btn-primary text-sm py-2">
            <Download size={15} />{generating ? 'Yuklanmoqda...' : 'PDF hisobot'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, sub, color, ic, border }) => (
          <div key={label} className={`card p-4 border ${border}`}>
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={ic} />
            </div>
            <div className="text-xl font-black text-white leading-tight">{value}</div>
            <div className="text-sm font-semibold text-slate-400 mt-0.5">{label}</div>
            <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-violet-400" />
              <h2 className="font-black text-white">Oxirgi zakazlar</h2>
            </div>
            <Link to="/robomarket-dashboard-2025/orders" className="text-violet-400 text-xs font-bold flex items-center gap-1 hover:text-violet-300">
              Hammasi <ChevronRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 text-xs text-slate-600 border-b border-slate-800">
                <tr>
                  {['Zakaz', 'Mijoz', 'Jami', 'Sana', 'Holat'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recent.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-slate-600 py-8 text-sm">Zakazlar yo'q</td></tr>
                ) : recent.map(o => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-black text-violet-500">{o.order_number}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-300">{o.customer_name}</td>
                    <td className="px-4 py-3 text-sm font-black text-white whitespace-nowrap">{fmt(o.total)} so'm</td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_CLS[o.status] || 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                        {STATUS_LBL[o.status] || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
            <AlertTriangle size={16} className="text-orange-400" />
            <h2 className="font-black text-white">Kam qolgan</h2>
          </div>
          <div className="divide-y divide-slate-800/50">
            {lowStock.length === 0 ? (
              <div className="text-center text-slate-600 py-8 text-sm">Hamma mahsulot yetarli</div>
            ) : lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                    : <Package size={14} className="m-auto mt-2.5 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-300 line-clamp-1">{p.name}</div>
                  <div className={`text-xs font-black flex items-center gap-1 ${p.stock === 0 ? 'text-rose-400' : 'text-orange-400'}`}>
                    <Zap size={10} />
                    {p.stock === 0 ? 'Tugagan' : `${p.stock} ta qoldi`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {lowStock.length > 0 && (
            <div className="p-3 border-t border-slate-800">
              <Link to="/robomarket-dashboard-2025/products" className="text-xs text-violet-400 font-bold hover:text-violet-300">
                Stokni yangilash →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
