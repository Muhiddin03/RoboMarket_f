import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

export default function PinSetupModal({ onSetup, onSkip }) {
  const [pin, setPin]   = useState('');
  const [pin2, setPin2] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr]   = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (pin.length < 4)  { setErr("PIN kamida 4 ta raqam bo'lsin"); return; }
    if (pin !== pin2)    { setErr('PIN kodlar mos kelmadi'); return; }
    onSetup(pin);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0e0b1a] border border-violet-800/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-violet-900/30 border border-violet-700/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Shield size={24} className="text-violet-400" />
          </div>
          <h3 className="font-black text-white text-lg">PIN kod o'rnating</h3>
          <p className="text-slate-500 text-sm mt-1">Keyingi safar zakazlaringizni PIN bilan ko'rasiz</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9 pr-10 w-full tracking-widest" value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g,'').slice(0,6)); setErr(''); }}
              type={show ? 'text' : 'password'} placeholder="PIN kod (4-6 raqam)" maxLength={6} />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {show ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9 w-full tracking-widest" value={pin2}
              onChange={e => { setPin2(e.target.value.replace(/\D/g,'').slice(0,6)); setErr(''); }}
              type={show ? 'text' : 'password'} placeholder="PIN kodni takrorlang" maxLength={6} />
          </div>
          {err && <p className="text-rose-400 text-xs font-bold">{err}</p>}
          <button type="submit" className="btn-primary w-full justify-center py-3">Saqlash</button>
          <button type="button" onClick={onSkip}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 py-2 transition-colors">
            O'tkazib yuborish
          </button>
        </form>
      </div>
    </div>
  );
}