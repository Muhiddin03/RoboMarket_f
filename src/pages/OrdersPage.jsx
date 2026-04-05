import { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, RefreshCw, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import BackButton from '../components/ui/BackButton';
import { maskPhone, isValidPhone } from '../utils/phone';

const STATUS = {
  new:        { label: 'Yangi',         color: 'text-blue-400   bg-blue-900/20   border-blue-800/40',   icon: Clock },
  processing: { label: 'Jarayonda',     color: 'text-amber-400  bg-amber-900/20  border-amber-800/40',  icon: RefreshCw },
  shipped:    { label: "Yo'lda",        color: 'text-violet-400 bg-violet-900/20 border-violet-800/40', icon: Truck },
  delivered:  { label: 'Yetkazildi',    color: 'text-green-400  bg-green-900/20  border-green-800/40',  icon: CheckCircle },
  cancelled:  { label: 'Bekor qilindi', color: 'text-rose-400   bg-rose-900/20   border-rose-800/40',   icon: XCircle },
};

const fmt   = (n) => Number(n || 0).toLocaleString('uz-UZ');
const fmtDt = (d) => new Date(d).toLocaleDateString('uz-UZ', {
  timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric'
});

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const st = STATUS[order.status] || STATUS.new;
  const Icon = st.icon;

  return (
    <div className="card border border-slate-800 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-violet-900/30 border border-violet-800/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-violet-400" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-white text-sm">{order.order_number}</div>
            <div className="text-xs text-slate-500 mt-0.5">{fmtDt(order.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
            <Icon size={11} />{st.label}
          </span>
          <div className="font-black text-white text-sm">{fmt(order.total)} so'm</div>
          {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-800 p-4 space-y-3">
          <div className="space-y-2">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0" />
                  <span className="text-sm text-slate-300 truncate">{item.name}</span>
                  <span className="text-xs text-slate-600 flex-shrink-0">× {item.qty}</span>
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0">{fmt(item.total)} so'm</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-1.5">
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chegirma</span>
                <span className="text-green-400 font-bold">-{fmt(order.discount_amount)} so'm</span>
              </div>
            )}
            {order.delivery_cost > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Yetkazish</span>
                <span className="text-slate-300">{fmt(order.delivery_cost)} so'm</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black">
              <span className="text-slate-400">Jami</span>
              <span className="text-white">{fmt(order.total)} so'm</span>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${st.color}`}>
            <Icon size={14} />
            {order.status === 'new'        && "Zakaz qabul qilindi, operator ko'rib chiqmoqda"}
            {order.status === 'processing' && 'Zakaz tayyorlanmoqda'}
            {order.status === 'shipped'    && "Zakaz yo'lda, tez orada yetib keladi"}
            {order.status === 'delivered'  && 'Zakaz muvaffaqiyatli yetkazildi!'}
            {order.status === 'cancelled'  && 'Zakaz bekor qilindi'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [phone, setPhone]       = useState('+998 ');
  const [orders, setOrders]     = useState([]);
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]       = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) { setError("+998 XX XXX XX XX formatida kiriting"); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.get('/customer-orders', { params: { phone: phone.trim() } });
      const list = res.data.orders || [];
      setOrders(list);
      if (list.length > 0) setName(list[0].customer_name);
      setSearched(true);
    } catch { setError('Xato yuz berdi, qayta urining'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white font-display">Mening zakazlarim</h1>
        <p className="text-slate-500 text-sm mt-1">Zakazlaringiz holatini kuzating</p>
      </div>

      <form onSubmit={handleSearch} className="card p-5 mb-6">
        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Telefon raqamingiz</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9 w-full" placeholder="+998 90 123 45 67"
              value={phone} onChange={e => { setPhone(maskPhone(e.target.value)); setSearched(false); }}
              maxLength={17} type="tel" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-5 flex-shrink-0">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Qidirish'}
          </button>
        </div>
        {error && <p className="text-rose-400 text-xs mt-2 font-bold">{error}</p>}
        <p className="text-slate-600 text-xs mt-2">Zakaz berayotganda kiritgan raqamingizni kiriting</p>
      </form>

      {searched && (
        orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-slate-600" />
            </div>
            <h3 className="font-black text-white mb-1">Zakaz topilmadi</h3>
            <p className="text-slate-500 text-sm">Bu raqam bilan zakaz berilmagan</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="font-black text-white">{name}</h2>
              <p className="text-slate-500 text-sm">{orders.length} ta zakaz</p>
            </div>
            <div className="space-y-3">
              {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          </>
        )
      )}
    </div>
  );
}