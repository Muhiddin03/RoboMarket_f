import { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { maskPhone, isValidPhone } from '../utils/phone';
import { Package, Clock, CheckCircle, XCircle, Truck, RefreshCw,
         ChevronDown, ChevronUp, LogOut, User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import BackButton from '../components/ui/BackButton';
import toast from 'react-hot-toast';
import { MessageSquare, PackageX } from 'lucide-react';

const STATUS = {
  new:        { label: 'Yangi',         color: 'text-blue-400   bg-blue-900/20   border-blue-800/40',  icon: Clock },
  processing: { label: 'Jarayonda',     color: 'text-amber-400  bg-amber-900/20  border-amber-800/40', icon: RefreshCw },
  shipped:    { label: "Yo'lda",        color: 'text-violet-400 bg-violet-900/20 border-violet-800/40',icon: Truck },
  delivered:  { label: 'Yetkazildi',    color: 'text-green-400  bg-green-900/20  border-green-800/40', icon: CheckCircle },
  cancelled:  { label: 'Bekor qilindi', color: 'text-rose-400   bg-rose-900/20   border-rose-800/40',  icon: XCircle },
};

const fmt   = n => Number(n||0).toLocaleString('uz-UZ');
const fmtDt = d => new Date(d).toLocaleDateString('uz-UZ', {
  timeZone:'Asia/Tashkent', day:'2-digit', month:'2-digit', year:'numeric'
});

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const st = STATUS[order.status] || STATUS.new;
  const Icon = st.icon;
  return (
    <div className="card border border-slate-800 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-violet-900/30 border border-violet-800/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-violet-400" />
          </div>
          <div>
            <div className="font-black text-white text-sm">{order.order_number}</div>
            <div className="text-xs text-slate-500">{fmtDt(order.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`hidden sm:flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${st.color}`}>
            <Icon size={10}/>{st.label}
          </span>
          <Icon size={15} className={`sm:hidden ${st.color.split(' ')[0]}`}/>
          <span className="font-black text-white text-sm">{fmt(order.total)} so'm</span>
          {open ? <ChevronUp size={15} className="text-slate-500"/> : <ChevronDown size={15} className="text-slate-500"/>}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-800 p-4 space-y-3">
          <div className="space-y-2">
            {(order.items||[]).map((item,i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0"/>
                  <span className="text-sm text-slate-300 truncate">{item.name}</span>
                  <span className="text-xs text-slate-600 flex-shrink-0">×{item.qty}</span>
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0">{fmt(item.total)} so'm</span>
              </div>
            ))}
            
          </div>
          <div className="border-t border-slate-800 pt-3 space-y-1">
            {order.discount_amount>0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chegirma</span>
                <span className="text-green-400 font-bold">-{fmt(order.discount_amount)} so'm</span>
              </div>
            )}
            {order.delivery_cost>0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Yetkazish</span>
                <span className="text-slate-300">{fmt(order.delivery_cost)} so'm</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-1">
              <span className="text-slate-400">Jami</span>
              <span className="text-white">{fmt(order.total)} so'm</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${st.color}`}>
            <Icon size={13}/>
            {order.status==='new'        && "Qabul qilindi, operator ko'rib chiqmoqda"}
            {order.status==='processing' && 'Tayyorlanmoqda'}
            {order.status==='shipped'    && "Yo'lda, tez orada yetib keladi"}
            {order.status==='delivered'  && 'Muvaffaqiyatli yetkazildi!'}
            {order.status==='cancelled'  && "Bekor qilindi. Operator bilan bog'laning"}
          </div>
        </div>
      )}
      {/* Admin javob */}
{order.admin_note && (
  <div className="flex items-start gap-2 p-3 bg-violet-900/20 border border-violet-800/40 rounded-xl">
    <MessageSquare size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
    <div>
      <div className="text-xs font-bold text-violet-400 mb-1">Do'kondan javob:</div>
      <div className="text-xs text-slate-300">{order.admin_note}</div>
    </div>
  </div>
)}

{/* Tugagan mahsulotlar */}
{order.out_of_stock_items?.length > 0 && (
  <div className="flex items-start gap-2 p-3 bg-rose-900/20 border border-rose-800/40 rounded-xl">
    <PackageX size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
    <div>
      <div className="text-xs font-bold text-rose-400 mb-1">Omborda tugagan:</div>
      {order.out_of_stock_items.map((name, i) => (
        <div key={i} className="text-xs text-slate-400 line-through">{name}</div>
      ))}
    </div>
  </div>
)}
    </div>
  );
}

function LoginForm() {
  const { loginWithPin } = useCustomer();
  const [phone, setPhone] = useState('+998 ');
  const [pin, setPin]     = useState('');
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!isValidPhone(phone)) { setErr("To'g'ri telefon kiriting"); return; }
    if (pin.length < 4)       { setErr('PIN kamida 4 ta raqam'); return; }
    if (!loginWithPin(phone, pin)) setErr("Telefon yoki PIN noto'g'ri");
    else setErr('');
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-violet-900/30 border border-violet-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User size={28} className="text-violet-400"/>
        </div>
        <h1 className="text-2xl font-black text-white">Profilga kirish</h1>
        <p className="text-slate-500 text-sm mt-1">Telefon va PIN kodingizni kiriting</p>
      </div>
      <form onSubmit={submit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input className="input pl-9 w-full" value={phone}
              onChange={e => { setPhone(maskPhone(e.target.value)); setErr(''); }}
              maxLength={17} type="tel" placeholder="+998 90 123 45 67"/>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">PIN kod</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input className="input pl-9 pr-10 w-full tracking-widest" value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g,'').slice(0,6)); setErr(''); }}
              type={show ? 'text' : 'password'} placeholder="••••" maxLength={6}/>
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {show ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </div>
        {err && <p className="text-rose-400 text-xs font-bold">{err}</p>}
        <button type="submit" className="btn-primary w-full justify-center py-3">Kirish</button>
        <p className="text-slate-600 text-xs text-center">PIN unutdingizmi? Yangi zakaz qilib, yangi PIN o'rnating</p>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { customer, orders, loading, logout, refresh } = useCustomer();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <BackButton/>
      {!customer ? (
        <LoginForm/>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-900/40 border border-violet-800/50 rounded-2xl flex items-center justify-center">
                <User size={22} className="text-violet-400"/>
              </div>
              <div>
                <h1 className="font-black text-white text-lg">{customer.name}</h1>
                <p className="text-slate-500 text-sm">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} disabled={loading}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-violet-400 transition-colors">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
              </button>
              <button onClick={() => { logout(); toast.success('Chiqildi'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 text-sm font-bold transition-colors">
                <LogOut size={14}/> Chiqish
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-white">Zakazlar tarixi</h2>
            <span className="text-xs text-slate-600 font-bold">{orders.length} ta</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 card">
              <Package size={32} className="text-slate-700 mx-auto mb-3"/>
              <p className="font-bold text-slate-500">Hali zakaz yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => <OrderCard key={o.id} order={o}/>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}