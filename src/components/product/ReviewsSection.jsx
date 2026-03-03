import { useState, useEffect, useCallback } from 'react';
import { fmtDate, fmtDateTime } from '../../utils/date';
import { Star, Send, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { reviewsApi } from '../../utils/api';
import toast from 'react-hot-toast';

const Stars = ({ value, onChange, size = 18 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => onChange?.(i)}
        className={`transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
        />
      </button>
    ))}
  </div>
);

export default function ReviewsSection({ productId }) {
  const [reviews,    setReviews]    = useState([]);
  const [stats,      setStats]      = useState({ count: 0, avg_rating: 0 });
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [author,     setAuthor]     = useState('');
  const [rating,     setRating]     = useState(5);
  const [text,       setText]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  // Sharhlarni yuklash
  const loadReviews = useCallback(async (showLoader = false) => {
    if (!productId) return;
    if (showLoader) setRefreshing(true);
    try {
      const r = await reviewsApi.getByProduct(productId);
      setReviews(r.data.reviews || []);
      setStats({
        count:      r.data.stats?.count      || 0,
        avg_rating: r.data.stats?.avg_rating || 0,
      });
    } catch {
      // tarmoq xatosi — jimgina o'tib ketamiz
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    loadReviews();
  }, [loadReviews]);

  // Sharh yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim())                   return toast.error('Ismingizni kiriting');
    if (text.trim().length < 5)           return toast.error('Sharh kamida 5 ta belgi');

    setSubmitting(true);
    try {
      await reviewsApi.create({
        product_id: productId,
        author:     author.trim(),
        rating,
        text:       text.trim(),
      });
      setSubmitted(true);
      setAuthor(''); setText(''); setRating(5);
      toast.success('Sharh qabul qilindi!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato yuz berdi. Qayta urining.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-slate-800/60">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <MessageSquare size={19} className="text-violet-400 flex-shrink-0" />
        <h2 className="text-xl font-black text-white">Mijozlar sharhlari</h2>

        {stats.count > 0 && (
          <div className="flex items-center gap-1.5">
            <Stars value={Math.round(stats.avg_rating)} size={13} />
            <span className="text-sm text-slate-500 font-semibold">
              {Number(stats.avg_rating).toFixed(1)} ({stats.count} ta)
            </span>
          </div>
        )}

        {/* Yangilash tugmasi */}
        <button
          onClick={() => loadReviews(true)}
          disabled={refreshing}
          title="Sharhlarni yangilash"
          className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sharhlar ro'yxati */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 skeleton rounded-xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="card p-10 text-center">
              <Star size={30} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-semibold">
                Hali sharh yo'q. Birinchi bo'ling!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-violet-900/40 border border-violet-800/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-violet-400">
                          {r.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-sm">{r.author}</div>
                        <Stars value={r.rating} size={12} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">
                      {fmtDate(r.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sharh yozish formasi */}
        <div className="card p-5">
          <h3 className="font-black text-white mb-4 text-sm">Sharh qoldirish</h3>

          {submitted ? (
            <div className="text-center py-6">
              <CheckCircle size={34} className="text-violet-400 mx-auto mb-3" />
              <p className="font-bold text-white text-sm mb-1">Qabul qilindi!</p>
              <p className="text-xs text-slate-500 mb-4">
                Admin tasdiqlashidan keyin ko'rinadi
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline text-xs py-2 px-4"
              >
                Yana yozish
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Ismingiz *
                </label>
                <input
                  className="input text-sm"
                  placeholder="Ali T."
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Baho
                </label>
                <Stars value={rating} onChange={setRating} size={22} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Sharh *
                </label>
                <textarea
                  className="input resize-none text-sm"
                  rows={3}
                  placeholder="Mahsulot haqida fikringiz..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={1000}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center text-sm py-2.5"
              >
                <Send size={13} />
                {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
              <p className="text-xs text-slate-600 text-center">
                Moderatsiyadan keyin ko'rinadi
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
