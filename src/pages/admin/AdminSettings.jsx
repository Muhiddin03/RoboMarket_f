import { useState, useEffect } from 'react';
import { settingsApi, authApi } from '../../utils/api';
import toast from 'react-hot-toast';
import { Save, Bot, Eye, EyeOff, TestTube } from 'lucide-react';

export default function AdminSettings() {
  const [s, setS] = useState({
    telegram_bot_token: '',
    telegram_chat_id: '',
    delivery_cost: '25000',
    free_delivery_from: '500000',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [hashResult, setHashResult] = useState('');

  useEffect(() => {
    settingsApi.get()
      .then(r => {
        if (r.data) setS(prev => ({ ...prev, ...r.data }));
      })
      .catch(() => toast.error('Yuklashda xato'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.update(s);
      toast.success('Sozlamalar saqlandi!');
    } catch (err) {
      toast.error('Xato: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleHash = async (e) => {
    e.preventDefault();
    if (newPass.length < 4) return toast.error('Kamida 4 ta belgi');
    try {
      const r = await authApi.setup(newPass);
      setHashResult(r.data.hash);
      toast.success('Hash tayyor! .env ga qo\'ying');
    } catch { toast.error('Xato'); }
  };

  const testBot = async () => {
    if (!s.telegram_bot_token || !s.telegram_chat_id) {
      toast.error('Avval token va chat ID kiriting va saqlang');
      return;
    }
    try {
      const r = await fetch(`https://api.telegram.org/bot${s.telegram_bot_token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: s.telegram_chat_id, text: 'RoboMarket bot ishlayapti!' }),
      });
      const d = await r.json();
      d.ok ? toast.success('Xabar yuborildi!') : toast.error('Bot xato: ' + d.description);
    } catch { toast.error('Ulanishda xato'); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Sozlamalar</h1>
        <p className="text-slate-500 text-sm">Telegram bot va yetkazib berish</p>
      </div>

      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Bot size={18} className="text-violet-400" />
          <h2 className="font-black text-white">Telegram Bot</h2>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-400">
          Yangi zakaz va aloqa xabarlarini olish uchun bot sozlang.<br />
          Bot yaratish: <strong className="text-white">@BotFather</strong> → /newbot<br />
          Chat ID olish: <strong className="text-white">@userinfobot</strong>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Bot Token</label>
          <input className="input" placeholder="1234567890:ABCdef..."
            value={s.telegram_bot_token || ''} onChange={e => set('telegram_bot_token', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Chat ID</label>
          <input className="input" placeholder="123456789"
            value={s.telegram_chat_id || ''} onChange={e => set('telegram_chat_id', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Yetkazish narxi (so'm)</label>
            <input className="input" type="number" placeholder="25000"
              value={s.delivery_cost || ''} onChange={e => set('delivery_cost', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Bepul yetkazish (so'm)</label>
            <input className="input" type="number" placeholder="500000"
              value={s.free_delivery_from || ''} onChange={e => set('free_delivery_from', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={15} />{saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <button type="button" onClick={testBot} className="btn-outline">
            <TestTube size={15} /> Test xabar
          </button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handleHash} className="card p-5 space-y-4">
        <h2 className="font-black text-white font-display">Admin parolini o'zgartirish</h2>
        <p className="text-sm text-slate-500">
          Hash olgandan keyin <code className="bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-violet-400">backend/.env</code> ga qo'ying va backend ni restart qiling.
        </p>
        <div className="relative">
          <input className="input pr-10" type={showPass ? 'text' : 'password'}
            placeholder="Yangi parol (kamida 4 ta belgi)"
            value={newPass} onChange={e => setNewPass(e.target.value)} autoComplete="new-password" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <button type="submit" className="btn-outline">Hash olish</button>
        {hashResult && (
          <div className="bg-violet-900/20 border border-violet-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-violet-400 mb-2">backend/.env ga qo'ying:</p>
            <code className="text-xs break-all bg-slate-800 border border-slate-700 rounded-xl p-3 block select-all font-mono text-slate-300">
              ADMIN_PASSWORD_HASH={hashResult}
            </code>
            <p className="text-xs text-slate-500 mt-2">Keyin: backend terminali → Ctrl+C → npm run dev</p>
          </div>
        )}
      </form>
    </div>
  );
}
