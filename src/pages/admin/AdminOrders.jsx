import { useState, useEffect } from 'react';
import { fmtDate, fmtDateTime } from '../../utils/date';
import { Eye, Trash2, X, ChevronDown, TrendingUp } from 'lucide-react';
import { ordersApi } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = [
  { v: '', label: 'Barchasi' },
  { v: 'new', label: 'Yangi', cls: 'bg-sky-900/40 text-sky-400 border-sky-800/50' },
  { v: 'processing', label: 'Jarayonda', cls: 'bg-amber-900/40 text-amber-400 border-amber-800/50' },
  { v: 'shipped', label: "Yo'lda", cls: 'bg-purple-900/40 text-purple-400 border-purple-800/50' },
  { v: 'delivered', label: 'Yetkazildi', cls: 'bg-violet-900/40 text-violet-400 border-violet-800/50' },
  { v: 'cancelled', label: 'Bekor', cls: 'bg-rose-900/40 text-rose-400 border-rose-800/50' },
];
const scls = (s) => STATUSES.find(o => o.v === s)?.cls || 'bg-slate-800 text-slate-500 border-slate-700';
const slbl = (s) => STATUSES.find(o => o.v === s)?.label || s;
const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [orderProfit, setOrderProfit] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await ordersApi.getAll({ status: filter, limit: 100 });
      setOrders(r.data.orders || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const openOrder = async (o) => {
    setSelected(o);
    setOrderProfit(null);
    // Zakazdan foyda hisoblash
    try {
      const token = localStorage.getItem('admin_token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const r = await fetch(`${API_URL}/orders/${o.id}/profit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) {
        const d = await r.json();
        setOrderProfit(d.profit);
      }
    } catch {}
  };

  const updateStatus = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success('Holat yangilandi');
      load();
      if (selected?.id === id) setSelected(p => ({ ...p, status }));
    } catch { toast.error('Xato'); }
  };

  const del = async (id) => {
    if (!window.confirm("O'chirasizmi?")) return;
    try { await ordersApi.delete(id); toast.success("O'chirildi"); setSelected(null); load(); }
    catch { toast.error('Xato'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Zakazlar</h1>
          <p className="text-slate-500 text-sm">{total} ta zakaz</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="card p-3 flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s.v} onClick={() => setFilter(s.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all
              ${filter === s.v ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 text-xs text-slate-600 border-b border-slate-800">
              <tr>
                {['Zakaz #', 'Mijoz', 'Tel', 'Yetkazish', 'Jami', 'Sana', 'Holat', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-600 py-12">Zakazlar yo'q</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-black text-violet-500">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-300">{o.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{o.customer_phone}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{o.delivery_type === 'pickup' ? 'Olib ketish' : 'Yetkazish'}</td>
                  <td className="px-4 py-3 text-sm font-black text-white whitespace-nowrap">{fmt(o.total)} so'm</td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                        className={`text-xs font-bold pl-2.5 pr-5 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none ${scls(o.status)}`}>
                        {STATUSES.slice(1).map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openOrder(o)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-600 hover:text-violet-400 transition-colors"><Eye size={14} /></button>
                      <button onClick={() => del(o.id)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-3xl">
              <div>
                <h2 className="text-lg font-black text-white font-display">{selected.order_number}</h2>
                <p className="text-xs text-slate-600">{fmtDateTime(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm space-y-2">
                <h3 className="font-black text-slate-500 text-xs uppercase tracking-wide mb-3">Mijoz</h3>
                {[['Ism', selected.customer_name], ['Tel', selected.customer_phone],
                  ['Yetkazish', selected.delivery_type === 'pickup' ? 'Olib ketish' : 'Yetkazib berish'],
                  ['Viloyat', selected.customer_city], ['Manzil', selected.customer_address],
                  ["To'lov", selected.payment_method], ['Izoh', selected.note]
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-600 w-20 flex-shrink-0 font-semibold">{k}:</span>
                    <span className="font-bold text-slate-300">{v}</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-black text-slate-500 text-xs uppercase tracking-wide mb-3">Mahsulotlar</h3>
                <div className="space-y-2">
                  {(selected.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 text-sm">
                      <span className="text-slate-400 font-semibold">{item.name} <span className="text-slate-600">×{item.qty}</span></span>
                      <span className="font-black text-white">{fmt(item.total)} so'm</span>
                    </div>
                  ))}
                  {selected.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-violet-400 font-bold">
                      <span>Chegirma:</span><span>-{fmt(selected.discount_amount)} so'm</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Yetkazish:</span>
                    <span>{selected.delivery_cost === 0 ? 'Bepul / Olib ketish' : `${fmt(selected.delivery_cost)} so'm`}</span>
                  </div>
                  <div className="flex justify-between font-black text-base pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Jami:</span>
                    <span className="text-violet-400">{fmt(selected.total)} so'm</span>
                  </div>
                  {orderProfit !== null && (
                    <div className="flex justify-between font-black text-sm pt-1">
                      <span className="flex items-center gap-1 text-slate-500"><TrendingUp size={14} />Bu zakazdan foyda:</span>
                      <span className={orderProfit >= 0 ? 'text-violet-400' : 'text-rose-400'}>
                        {orderProfit >= 0 ? '+' : ''}{fmt(orderProfit)} so'm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/50 rounded-2xl p-4">
                <span className="text-sm font-black text-slate-500 flex-shrink-0">Holat:</span>
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} className="select flex-1">
                  {STATUSES.slice(1).map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
