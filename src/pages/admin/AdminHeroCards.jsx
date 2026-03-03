import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Link2, X, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { heroCardsApi } from '../../utils/api';
import toast from 'react-hot-toast';

const ICONS = ['CircuitBoard', 'Wifi', 'Layers', 'Wrench', 'Package', 'Cpu', 'Bot', 'Cog', 'Star', 'Zap'];

const DEFAULT_CARDS = [
  { id: 1, title: 'Arduino Uno R3', subtitle: '89,000 so\'m', image_url: '', icon: 'CircuitBoard' },
  { id: 2, title: 'ESP32 WiFi', subtitle: '65,000 so\'m', image_url: '', icon: 'Wifi' },
  { id: 3, title: 'Sensor Kit', subtitle: '185,000 so\'m', image_url: '', icon: 'Layers' },
  { id: 4, title: 'Servo SG90', subtitle: '25,000 so\'m', image_url: '', icon: 'Wrench' },
];

export default function AdminHeroCards() {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    heroCardsApi.get()
      .then(r => { if (r.data?.length) setCards(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (i, field, val) => {
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const handleFile = (i, file) => {
    if (!file) return;
    // Upload via settings upload endpoint
    const fd = new FormData();
    fd.append('image', file);
    const token = localStorage.getItem('admin_token');
    const _APIURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      fetch(`${_APIURL}/settings/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          update(i, 'image_url', data.url);
          toast.success('Rasm yuklandi');
        } else {
          toast.error(data.error || 'Xato');
        }
      })
      .catch(() => toast.error('Upload xatosi'));
  };

  const save = async () => {
    setSaving(true);
    try {
      await heroCardsApi.update(cards);
      toast.success('Hero kartochkalar saqlandi!');
    } catch {
      toast.error('Xato');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (window.confirm("Default holatga qaytarasizmi?")) {
      setCards(DEFAULT_CARDS);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl"/>)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Hero Kartochkalar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Bosh sahifadagi 4 ta suzuvchi kartochka</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-ghost text-slate-500 hover:text-slate-300">
            <RefreshCw size={14}/> Reset
          </button>
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={15}/> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <div key={card.id} className="card p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-violet-900/50 border border-violet-700/40 rounded-lg flex items-center justify-center">
                <span className="text-violet-400 font-black text-xs">{i + 1}</span>
              </div>
              <span className="text-sm font-bold text-slate-300">Kartochka #{i + 1}</span>
            </div>

            {/* Preview */}
            <div className="relative h-24 rounded-xl overflow-hidden bg-gradient-to-br from-violet-950 to-indigo-950 border border-violet-800/30">
              {card.image_url && (
                <img src={card.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40"/>
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <div className="text-white font-bold text-sm">{card.title || 'Sarlavha'}</div>
                <div className="text-white/50 text-xs">{card.subtitle || 'Tavsif'}</div>
              </div>
            </div>

            {/* Fields */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Sarlavha</label>
              <input className="input text-sm" placeholder="Arduino Uno R3"
                value={card.title} onChange={e => update(i, 'title', e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Tavsif / Narx</label>
              <input className="input text-sm" placeholder="89,000 so'm"
                value={card.subtitle} onChange={e => update(i, 'subtitle', e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">Icon</label>
              <select className="select text-sm" value={card.icon} onChange={e => update(i, 'icon', e.target.value)}>
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Orqa fon rasmi</label>
              <div className="space-y-2">
                <div className="relative">
                  <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"/>
                  <input className="input pl-8 text-sm pr-8" placeholder="https://... rasm URL"
                    value={card.image_url} onChange={e => update(i, 'image_url', e.target.value)}/>
                  {card.image_url && (
                    <button type="button" onClick={() => update(i, 'image_url', '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-rose-400 transition-colors">
                      <X size={13}/>
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => fileRefs[i]?.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-violet-600 hover:text-violet-400 transition-all text-xs font-bold">
                  <Upload size={13}/> Kompyuterdan yuklash
                </button>
                <input type="file" ref={fileRefs[i]} accept="image/*" className="hidden"
                  onChange={e => handleFile(i, e.target.files[0])}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 border-violet-800/20 bg-violet-900/10">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="text-violet-400 font-bold">Eslatma:</span> Bu kartochkalar faqat katta ekranlarda (desktop) ko'rinadi. Rasm qo'shmasangiz — gradiyent fon ko'rinadi. Saqlash tugmasini bosing!
        </p>
      </div>
    </div>
  );
}
