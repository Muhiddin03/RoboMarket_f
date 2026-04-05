import { useState, useEffect, useCallback } from 'react';
import BackButton from '../components/ui/BackButton';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { productsApi, categoriesApi } from '../utils/api';
import ProductGrid from '../components/product/ProductGrid';

export default function ProductsPage() {
  const [params, setParams]         = useSearchParams();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);

  const search   = params.get('search')   || '';
  const category = params.get('category') || '';
  const badge    = params.get('badge')    || '';

  const sp = (k, v) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v); else n.delete(k);
    setParams(n);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([
        productsApi.getAll({ search, category, badge, sort: 'id', order: 'desc', limit: 500 }),
        categoriesApi.getAll(),
      ]);
      setProducts(Array.isArray(pr.data?.products) ? pr.data.products : []);
      setTotal(pr.data?.total || 0);
      setCategories(Array.isArray(cr.data) ? cr.data : []);
    } catch {}
    finally { setLoading(false); }
  }, [search, category, badge]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <BackButton />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            {search ? `"${search}" natijalari` : category ? (categories.find(c => c.slug === category)?.name || 'Mahsulotlar') : 'Barcha mahsulotlar'}
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">{total} ta mahsulot</p>
        </div>
        {(search || category || badge) && (
          <button onClick={() => setParams({})} className="flex items-center gap-1.5 text-xs text-rose-400 font-bold hover:text-rose-300">
            <X size={13} /> Tozalash
          </button>
        )}
      </div>

      <div className="flex gap-5">
        <aside className="w-44 flex-shrink-0 hidden md:block">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide mb-2.5">Kategoriya</h3>
          <div className="space-y-0.5">
            <button onClick={() => sp('category', '')}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors
                ${!category ? 'bg-violet-900/30 text-violet-400 border border-violet-800/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              Barchasi
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => sp('category', c.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${category === c.slug ? 'bg-violet-900/30 text-violet-400 border border-violet-800/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
                {c.name.split('&')[0].trim()}
                <span className="text-xs text-slate-700 ml-1">({c.product_count})</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => sp('category', '')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all
                ${!category ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              Barchasi
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => sp('category', c.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all
                  ${category === c.slug ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {c.name.split('&')[0].trim()}
              </button>
            ))}
          </div>
          <ProductGrid products={products} loading={loading} cols={5} />
        </div>
      </div>
    </div>
  );
}