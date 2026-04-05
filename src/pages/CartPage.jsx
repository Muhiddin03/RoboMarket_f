import { useState } from 'react';
import { maskPhone, isValidPhone, handlePhoneChange } from '../utils/phone';
import BackButton from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, CheckCircle, Truck, Store, CreditCard, Banknote, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../utils/api';
import toast from 'react-hot-toast';
import { useCustomer } from '../context/CustomerContext';
import PinSetupModal from '../components/ui/PinSetupModal';

const CITIES = [
  'Toshkent shahri','Toshkent viloyati','Andijon','Buxoro',"Farg'ona",
  'Jizzax','Namangan','Navoiy','Qashqadaryo',"Qoraqalpog'iston",
  'Samarqand','Sirdaryo','Surxondaryo','Xorazm',
];

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart, subtotal, deliveryCost, FREE_DELIVERY } = useCart();
   const { customer, setupProfile } = useCustomer();
const [showPin, setShowPin] = useState(false);
const [pendingInfo, setPendingInfo] = useState(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('cash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
 

  const dc = deliveryType === 'pickup' ? 0 : (subtotal >= FREE_DELIVERY ? 0 : deliveryCost);
  const totalAmount = subtotal + dc;

  const discount = cart.reduce((acc, item) => {
    if (item.old_price && item.old_price > item.price) {
      return acc + (item.old_price - item.price) * item.qty;
    }
    return acc;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimName = (name || '').trim();
    const trimPhone = (phone || '').trim();

    if (!trimName) { toast.error('Ismingizni kiriting'); return; }
    if (!isValidPhone(trimPhone)) { toast.error("Telefon: +998 XX XXX XX XX formatida kiriting"); return; }
    if (deliveryType === 'delivery' && !city) { toast.error('Viloyatni tanlang'); return; }
    if (deliveryType === 'delivery' && !address.trim()) { toast.error('Manzilni kiriting'); return; }

//     setSubmitting(true);
//     try {
//       const payload = {
//         customer_name: trimName,
//         customer_phone: trimPhone,
//         delivery_type: deliveryType,
//         customer_city: deliveryType === 'delivery' ? city : null,
//         customer_address: deliveryType === 'delivery' ? address.trim() : null,
//         payment_method: payment,
//         note: note.trim() || null,
//         items: cart.map(i => ({ product_id: i.id, qty: i.qty })),
//       };

//       const res = await ordersApi.create(payload);
//       setSuccessOrder(res.data.order);
//       clearCart();
//       setStep(2);
// if (!customer) {
//   setPendingInfo({ name: trimName, phone: trimPhone });
//   setShowPin(true);
// }
      
//     } catch (err) {
//       console.error('Order error:', err.response?.data);
//       toast.error(err.response?.data?.error || 'Xato yuz berdi, qayta urining');
//     } finally {
//       setSubmitting(false);
//     }
//   };

setSubmitting(true);
    try {
      const payload = {
        customer_name: trimName,
        customer_phone: trimPhone,
        delivery_type: deliveryType,
        customer_city: deliveryType === 'delivery' ? city : null,
        customer_address: deliveryType === 'delivery' ? address.trim() : null,
        payment_method: payment,
        note: note.trim() || null,
        items: cart.map(i => ({ product_id: i.id, qty: i.qty })),
      };

      const res = await ordersApi.create(payload);
      
      // 1. Ma'lumotlarni saqlash va savatchani tozalash
      setSuccessOrder(res.data.order);
      clearCart();

      // 2. PIN so'rash yoki keyingi qadamga o'tish mantiqi
      if (!customer) {
        setPendingInfo({ name: trimName, phone: trimPhone });
        setShowPin(true);
        // Bu yerda setStep(2) bo'lmasligi kerak, 
        // aks holda modal ochilmay sahifa o'zgarib ketadi
      } else {
        // Agar foydalanuvchi tizimda bo'lsa, to'g'ridan-to'g'ri 2-qadamga
        setStep(2);
      }

    } catch (err) {
      console.error('Order error:', err.response?.data);
      toast.error(err.response?.data?.error || 'Xato yuz berdi, qayta urining');
    } finally {
      setSubmitting(false);
    }
  };

  // Success — scroll top ishlaydi (ScrollToTop bor App.jsx da)
  if (step === 2 && successOrder) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="card p-8">
        <div className="w-20 h-20 bg-violet-900/40 border-2 border-violet-700 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-violet-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 font-display">Zakaz qabul qilindi!</h2>
        <p className="text-slate-500 mb-1 text-sm">Zakaz raqami:</p>
        <p className="text-3xl font-black text-violet-400 mb-3">{successOrder.order_number}</p>
        <p className="text-slate-500 text-sm mb-6">Operator tez orada siz bilan bog'lanadi</p>
       <div className="flex flex-col gap-3">
  <div className="flex flex-col gap-3">
  <Link to="/profile" className="btn-primary w-full justify-center py-3">
    Zakazimni kuzatish
  </Link>
  <Link to="/" className="btn-outline w-full justify-center py-2.5">
    Bosh sahifaga qaytish
  </Link>
</div>
</div>
      </div>
    </div>
  );

  if (cart.length === 0 && step !== 2) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-left"><BackButton /></div>
      <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-slate-700">
        <ShoppingCart size={40} className="text-slate-600" />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Savat bo'sh</h2>
      <p className="text-slate-500 mb-6">Hali hech narsa qo'shilmagan</p>
      <Link to="/products" className="btn-primary">Mahsulotlarni ko'rish</Link>
    </div>
  );

 {showPin && pendingInfo && (
  <PinSetupModal
    onSetup={pin => { setupProfile(pendingInfo.name, pendingInfo.phone, pin); setShowPin(false); }}
    onSkip={() => setShowPin(false)}
  />
)}

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BackButton />
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {step === 1 && (
          <button onClick={() => setStep(0)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors text-slate-400">
            <ArrowLeft size={16} />
          </button>
        )}
        <h1 className="text-2xl font-black text-white font-display">
          {step === 0 ? 'Savat' : 'Buyurtma berish'}
        </h1>
        {step === 0 && <span className="text-slate-600 text-sm font-semibold">({cart.length} ta)</span>}
      </div>

      {/* STEP 0 — Cart list */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-slate-600" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`} className="font-bold text-slate-200 text-sm hover:text-violet-400 line-clamp-2 block">{item.name}</Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-violet-400 font-black text-sm">{Number(item.price).toLocaleString('uz-UZ')} so'm</span>
                    {item.old_price && item.old_price > item.price && (
                      <span className="text-xs text-slate-600 line-through">{Number(item.old_price).toLocaleString('uz-UZ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 text-slate-400 transition-colors"><Minus size={13} /></button>
                  <span className="w-8 text-center text-sm font-black text-white">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 text-slate-400 transition-colors"><Plus size={13} /></button>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="font-black text-sm text-white">{Number(item.price * item.qty).toLocaleString('uz-UZ')}</div>
                  <div className="text-xs text-slate-600">so'm</div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit lg:sticky lg:top-20">
            <h3 className="font-black text-white mb-4 font-display">Xulosa</h3>
            <div className="space-y-2 text-sm">
              {discount > 0 && (
                <div className="flex justify-between text-violet-400 font-bold">
                  <span>Tejashingiz:</span>
                  <span>-{Number(discount).toLocaleString('uz-UZ')} so'm</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-slate-800">
                <span className="text-slate-400">Jami:</span>
                <span className="text-white">{Number(subtotal).toLocaleString('uz-UZ')} so'm</span>
              </div>
              <p className="text-xs text-slate-600">* Yetkazib berish keyingi qadamda</p>
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full justify-center py-3 mt-4 text-base">
              Buyurtma berish <ArrowLeft size={16} className="rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 1 — Order form */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">

            {/* Contact */}
            <div className="card p-5">
              <h3 className="font-black text-white mb-4 font-display flex items-center gap-2">
                Shaxsiy ma'lumotlar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ism Familiya *</label>
                  <input className="input" placeholder="Jasur Toshmatov"
                    value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon *</label>
                  <input className="input" placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={e => handlePhoneChange(e, setPhone)}maxLength={17}
                    type="tel" autoComplete="tel" />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="card p-5">
              <h3 className="font-black text-white mb-4 font-display">Yetkazib berish</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { v: 'pickup', label: "O'zi olib ketish", sub: "Do'kondan bepul", Icon: Store },
                  { v: 'delivery', label: "Yetkazib berish", sub: "Butun O'zbekiston", Icon: Truck },
                ].map(({ v, label, sub, Icon }) => (
                  <button key={v} type="button" onClick={() => setDeliveryType(v)}
                    className={`p-4 rounded-xl border-2 text-left transition-all
                      ${deliveryType === v
                        ? 'border-violet-600 bg-violet-900/20'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}`}>
                    <Icon size={20} className={deliveryType === v ? 'text-violet-400' : 'text-slate-500'} />
                    <div className={`font-bold text-sm mt-2 ${deliveryType === v ? 'text-violet-300' : 'text-slate-300'}`}>{label}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Viloyat *</label>
                    <select className="select" value={city} onChange={e => setCity(e.target.value)}>
                      <option value="">Viloyatni tanlang...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">To'liq manzil *</label>
                    <textarea className="input resize-none" rows={2}
                      placeholder="Ko'cha nomi, uy raqami..."
                      value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h3 className="font-black text-white mb-4 font-display">To'lov usuli</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'cash', label: "Naqd pul", Icon: Banknote },
                  { v: 'card', label: "Plastik karta", Icon: CreditCard },
                ].map(({ v, label, Icon }) => (
                  <button key={v} type="button" onClick={() => setPayment(v)}
                    className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all
                      ${payment === v
                        ? 'border-violet-600 bg-violet-900/20'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}`}>
                    <Icon size={20} className={payment === v ? 'text-violet-400' : 'text-slate-500'} />
                    <span className={`font-bold text-sm ${payment === v ? 'text-violet-300' : 'text-slate-300'}`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="card p-5">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Izoh (ixtiyoriy)</label>
              <textarea className="input resize-none" rows={2}
                placeholder="Qo'shimcha xohishlar..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="card p-5 h-fit lg:sticky lg:top-20">
            <h3 className="font-black text-white mb-4 font-display">Buyurtma</h3>
            <div className="space-y-2 text-sm mb-4 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between gap-2 text-slate-500">
                  <span className="line-clamp-1 flex-1 text-slate-400">{item.name} <span className="text-slate-600">×{item.qty}</span></span>
                  <span className="font-bold flex-shrink-0 text-white">{Number(item.price * item.qty).toLocaleString('uz-UZ')}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-slate-800 pt-3">
              {discount > 0 && (
                <div className="flex justify-between text-violet-400 font-bold">
                  <span>Chegirma:</span><span>-{Number(discount).toLocaleString('uz-UZ')} so'm</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Yetkazish:</span>
                <span className={dc === 0 ? 'text-violet-400 font-bold' : 'text-white'}>
                  {deliveryType === 'pickup' ? "O'zi olib ketish" : dc === 0 ? 'Bepul' : `${Number(dc).toLocaleString('uz-UZ')} so'm`}
                </span>
              </div>
              {deliveryType === 'delivery' && dc > 0 && (
                <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 rounded-xl p-2">
                  Yana {Number(FREE_DELIVERY - subtotal).toLocaleString('uz-UZ')} so'mlik mahsulot olsangiz yetkazib berish bepul bo'ladi!
                </p>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-slate-800">
                <span className="text-slate-400">JAMI:</span>
                <span className="text-violet-400">{Number(totalAmount).toLocaleString('uz-UZ')} so'm</span>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 mt-4 text-sm">
              {submitting ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
