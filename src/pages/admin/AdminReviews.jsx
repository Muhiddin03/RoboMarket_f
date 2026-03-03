import { useState, useEffect, useCallback } from 'react';
import { fmtDate, fmtDateTime } from '../../utils/date';
import { Check, Trash2, Star, RefreshCw } from 'lucide-react';
import { reviewsApi } from '../../utils/api';
import toast from 'react-hot-toast';

const FILTERS = [
  { v: 'pending',  label: 'Kutmoqda' },
  { v: 'approved', label: 'Tasdiqlangan' },
  { v: 'all',      label: 'Barchasi' },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await reviewsApi.getAdmin();
      // r.data massivini tekshirish
      const data = Array.isArray(r.data) ? r.data : [];
      setReviews(data);
    } catch {
      toast.error('Sharhlar yuklanmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    try {
      await reviewsApi.approve(id);
      // Lokal state ni yangilash — sahifani qayta yuklamaslik
      setReviews(prev =>
        prev.map(r => r.id === id ? { ...r, is_approved: true } : r)
      );
      toast.success('Sharh tasdiqlandi ✓');
    } catch {
      toast.error('Tasdiqlab bo\'lmadi');
    }
  };

  const del = async (id) => {
    if (!window.confirm("Sharhni o'chirasizmi?")) return;
    try {
      await reviewsApi.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success("O'chirildi");
    } catch {
      toast.error("O'chirib bo'lmadi");
    }
  };

  // Filterlash — is_approved aniq boolean ekanligiga ishonch hosil qilish
  const filtered = reviews.filter(r => {
    const approved = r.is_approved === true || r.is_approved === 1;
    if (filter === 'pending')  return !approved;
    if (filter === 'approved') return approved;
    return true;
  });

  const pendingCount = reviews.filter(r =>
    r.is_approved !== true && r.is_approved !== 1
  ).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Sharhlar</h1>
          <p className="text-slate-500 text-sm">
            {reviews.length} ta sharh
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-900/40 text-amber-400 border border-amber-800/40 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount} ta kutmoqda
              </span>
            )}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-outline text-sm py-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Yangilash
        </button>
      </div>

      {/* Filter */}
      <div className="card p-3 flex gap-2 flex-wrap">
        {FILTERS.map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              filter === v
                ? 'bg-violet-600 text-white'
                : 'text-slate-500 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {label}
            {v === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ro'yxat */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-600 font-semibold">
          {filter === 'pending' ? "✅ Barcha sharhlar ko'rib chiqilgan!" : "Sharh yo'q"}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const approved = r.is_approved === true || r.is_approved === 1;
            return (
              <div
                key={r.id}
                className={`card p-4 flex gap-4 items-start transition-all ${
                  !approved ? 'border-amber-800/40 bg-amber-900/5' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-black text-white text-sm">{r.author}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star
                          key={i}
                          size={12}
                          className={i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
                        />
                      ))}
                    </div>
                    {r.product_name && (
                      <span className="text-xs text-violet-400 bg-violet-900/20 border border-violet-800/30 px-2 py-0.5 rounded-full">
                        {r.product_name}
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      approved
                        ? 'bg-violet-900/30 text-violet-400 border-violet-800/40'
                        : 'bg-amber-900/30 text-amber-400 border-amber-800/40'
                    }`}>
                      {approved ? 'Tasdiqlangan' : 'Kutmoqda'}
                    </span>
                  </div>

                  {/* Matn */}
                  <p className="text-slate-400 text-sm leading-relaxed">{r.text}</p>
                  <div className="text-xs text-slate-600 mt-1.5">
                    {fmtDateTime(r.created_at)}
                  </div>
                </div>

                {/* Amallar */}
                <div className="flex gap-2 flex-shrink-0 mt-1">
                  {!approved && (
                    <button
                      onClick={() => approve(r.id)}
                      title="Tasdiqlash"
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-900/30 border border-violet-800/40 hover:bg-violet-800/50 text-violet-400 transition-colors"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => del(r.id)}
                    title="O'chirish"
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-900/20 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
