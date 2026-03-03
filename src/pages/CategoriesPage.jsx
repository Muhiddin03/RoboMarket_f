import { useState, useEffect } from 'react';
import BackButton from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import { categoriesApi } from '../utils/api';

const COLORS = [
  'from-purple-900 to-purple-700',
  'from-indigo-900 to-indigo-700',
  'from-slate-800 to-slate-600',
  'from-amber-900 to-amber-700',
  'from-orange-900 to-orange-700',
  'from-rose-900 to-rose-700',
  'from-purple-900 to-purple-700',
  'from-sky-900 to-sky-700',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      <BackButton />
      <div className="flex items-center gap-3 mb-6">
        <Grid3X3 size={22} className="text-violet-400" />
        <h1 className="text-2xl font-black text-white font-display">Kategoriyalar</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-[4/3] skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`}
              className="relative overflow-hidden rounded-2xl group aspect-[4/3] border border-slate-800 hover:border-violet-700/50 transition-all">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${COLORS[i % COLORS.length]}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="font-bold text-white leading-tight">{cat.name}</div>
                {cat.description && <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cat.description}</div>}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-500">{cat.product_count || 0} ta mahsulot</span>
                  <ChevronRight size={14} className="text-violet-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
