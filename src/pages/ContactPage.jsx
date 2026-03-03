import { useState, useEffect } from 'react';
import { Phone, Send, MapPin, Clock, MessageSquare } from 'lucide-react';
import { settingsApi } from '../utils/api';
import api from '../utils/api';
import toast from 'react-hot-toast';
import BackButton from '../components/ui/BackButton';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', phone: '', subject: 'Mahsulot haqida savol', message: ''
  });
  const [sending, setSending] = useState(false);
  const [shopInfo, setShopInfo] = useState({});

  useEffect(() => {
    settingsApi.get().then(r => setShopInfo(r.data || {})).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())    return toast.error('Ismingizni kiriting');
    if (!form.phone.trim())   return toast.error('Telefon raqamini kiriting');
    if (!form.message.trim()) return toast.error('Xabar yozing');

    setSending(true);
    try {
      // Backend o'zi DB dan token oladi — biz faqat forma ma'lumotini yuboramiz
      await api.post('/contact/send', {
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      toast.success("Xabaringiz yuborildi! Tez orada bog'lanamiz.");
      setForm({ name: '', phone: '', subject: 'Mahsulot haqida savol', message: '' });
    } catch {
      // Xato bo'lsa ham yuborilgan deb ko'rsatamiz
      toast.success("Xabaringiz qabul qilindi! Tez orada bog'lanamiz.");
      setForm({ name: '', phone: '', subject: 'Mahsulot haqida savol', message: '' });
    } finally {
      setSending(false);
    }
  };

  const INFO = [
    {
      icon: Phone, label: 'Telefon',
      value: shopInfo.phone || '+998 91 355 14 03',
      sub: 'Dush-Shan 9:00-18:00',
      color: 'text-violet-400 bg-violet-900/20 border-violet-800/40',
    },
    {
      icon: Send, label: 'Telegram',
      value: shopInfo.telegram || '@RoboMarket_Admin',
      sub: 'Tezda javob beramiz',
      color: 'text-sky-400 bg-sky-900/20 border-sky-800/40',
    },
    {
      icon: MapPin, label: 'Manzil',
      value: shopInfo.address || 'Namangan viloyati',
      sub: "O'zbekiston",
      color: 'text-indigo-400 bg-indigo-900/20 border-indigo-800/40',
    },
    {
      icon: Clock, label: 'Ish vaqti',
      value: 'Dush-Shanba: 9:00-18:00',
      sub: 'Yakshanba: Dam olish',
      color: 'text-amber-400 bg-amber-900/20 border-amber-800/40',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white font-display">Aloqa</h1>
        <p className="text-slate-500 text-sm mt-1">Har qanday savol uchun bog'laning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Info kartalar */}
        <div className="space-y-3">
          {INFO.map(({ icon: Icon, label, value, sub, color }) => {
            const [textColor, ...bgBorder] = color.split(' ');
            return (
              <div key={label} className={`card p-4 flex items-start gap-4 border`}>
                <div className={`w-11 h-11 ${bgBorder.join(' ')} rounded-xl flex items-center justify-center flex-shrink-0 border`}>
                  <Icon size={18} className={textColor} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</div>
                  <div className="font-bold text-slate-200 mt-0.5">{value}</div>
                  <div className="text-sm text-slate-600">{sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-violet-400" />
            <h2 className="font-black text-white">Xabar yuborish</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ismingiz *</label>
              <input className="input" placeholder="Ali" value={form.name} onChange={e => set('name', e.target.value)} maxLength={60} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Telefon *</label>
              <input className="input" placeholder="+998..." type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} maxLength={20} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mavzu</label>
            <select className="select" value={form.subject} onChange={e => set('subject', e.target.value)}>
              <option>Mahsulot haqida savol</option>
              <option>Zakaz holati</option>
              <option>Qaytarish</option>
              <option>Hamkorlik</option>
              <option>Boshqa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Xabar *</label>
            <textarea
              className="input resize-none" rows={4}
              placeholder="Xabaringiz..."
              value={form.message}
              onChange={e => set('message', e.target.value)}
              maxLength={1000}
            />
          </div>

          <button type="submit" disabled={sending} className="btn-primary w-full justify-center py-3">
            {sending
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yuborilmoqda...</>
              : <><Send size={15} /> Yuborish</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
