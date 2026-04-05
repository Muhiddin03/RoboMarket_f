import { useState, useEffect, useCallback } from 'react';
import BackButton from '../components/ui/BackButton';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { productsApi, categoriesApi } from '../utils/api';
import ProductGrid from '../components/product/ProductGrid';

// const SORT_OPTIONS = [
//   { v: 'id_desc', label: 'Yangi kelganlar' },
//   { v: 'name_asc', label: 'A-Z' },
// ];

export default function ProductsPage() {
  const [params, setParams]       = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);

  const search   = params.get('search')   || '';
  const category = params.get('category') || '';
  const badge    = params.get('badge')    || '';
  const sortRaw  = params.get('sort')     || 'id_desc';
  const [sortField, sortDir] = sortRaw.split('_');

  const sp = (k, v) => {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v); else n.delete(k);
    setParams(n);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([
        productsApi.getAll({ search, category, badge, sort: sortField, order: sortDir, limit: 500 }),
        categoriesApi.getAll(),
      ]);
      setProducts(Array.isArray(pr.data?.products) ? pr.data.products : []);
      setTotal(pr.data?.total || 0);
      setCategories(Array.isArray(cr.data) ? cr.data : []);
    } catch {}
    finally { setLoading(false); }
  }, [search, category, badge, sortField, sortDir]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <BackButton />

      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            {category ? (categories.find(c => c.slug === category)?.name || 'Mahsulotlar') : 'Barcha mahsulotlar'}
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">{total} ta mahsulot</p>
        </div>
        <div className="hidden md:flex gap-3 items-center">
          <select className="select pr-8 text-sm min-w-40 py-2" value={sortRaw} onChange={e => sp('sort', e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Desktop sidebar */}
        <aside className="w-48 flex-shrink-0 hidden md:block space-y-5">
          <div>
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide mb-2.5">Qidiruv</h3>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input className="input pl-8 text-sm py-2" placeholder="Mahsulot..." value={search}
                onChange={e => sp('search', e.target.value)} />
            </div>
          </div>
          <div>
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
          </div>
          {(search || category || badge) && (
            <button onClick={() => setParams({})} className="w-full text-xs text-rose-400 font-bold flex items-center gap-1 hover:text-rose-300">
              <X size={12} /> Tozalash
            </button>
          )}
        </aside>

        <div className="flex-1 min-w-0">
          {/* Mobil kategoriya — gorizontal scroll */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-3" style={{scrollbarWidth:'none'}}>
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