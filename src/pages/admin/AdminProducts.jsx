import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, Upload, Link2, Package, AlertTriangle, ChevronDown } from 'lucide-react';
import { productsApi, categoriesApi } from '../../utils/api';
import toast from 'react-hot-toast';

const BADGES = ['', 'new', 'hot', 'sale', 'popular'];
const BL = { '': "Yo'q", new: 'Yangi', hot: 'Ommabop', sale: 'Chegirma', popular: 'Popular' };
const empty = { name: '', description: '', price: '', old_price: '', cost_price: '', stock: '', category_id: '', badge: '', specs: [{ key: '', val: '' }], image_urls: '' };
const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');

const discountPercent = (price, old_price) => {
  if (!old_price || !price || old_price <= price) return null;
  return Math.round(((old_price - price) / old_price) * 100);
};
const profitCalc = (price, cost_price) => {
  if (!price || !cost_price) return null;
  return Number(price) - Number(cost_price);
};

function CategoryPicker({ product, categories, onSave }) {
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const pick = async (cat) => {
    setOpen(false);
    if (cat.id === product.category_id) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',        product.name);
      fd.append('price',       product.price);
      fd.append('stock',       product.stock);
      fd.append('category_id', cat.id || '');
      if (product.description) fd.append('description', product.description);
      if (product.old_price)   fd.append('old_price',   product.old_price);
      if (product.cost_price)  fd.append('cost_price',  product.cost_price);
      if (product.badge)       fd.append('badge',       product.badge);
      fd.append('specs', JSON.stringify(product.specs || []));
      if (product.images?.length) {
        product.images.map(i => i.url).filter(Boolean).forEach(u => fd.append('image_urls', u));
      }
      await productsApi.update(product.id, fd);
      toast.success(`Kategoriya: ${cat.name}`);
      onSave();
    } catch { toast.error('Xato'); }
    finally { setSaving(false); }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} disabled={saving}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition-colors group">
        {saving
          ? <span className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
          : <span className="group-hover:underline">{product.category_name || '—'}</span>
        }
        {!saving && <ChevronDown size={11} className="text-slate-600 group-hover:text-violet-400" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 min-w-44 overflow-hidden">
          <div className="py-1 max-h-64 overflow-y-auto">
            <button onClick={() => pick({ id: null, name: 'Kategoriyasiz' })}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors
                ${!product.category_id ? 'text-violet-400 font-bold' : 'text-slate-400'}`}>
              — Kategoriyasiz
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => pick(c)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors
                  ${product.category_id === c.id ? 'text-violet-400 font-bold bg-violet-900/20' : 'text-slate-300'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [modal, setModal]               = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(empty);
  const [files, setFiles]               = useState([]);
  const [previews, setPreviews]         = useState([]);
  const [existingImgs, setExistingImgs] = useState([]);
  const [saving, setSaving]             = useState(false);
  const fileRef   = useRef();
  const scrollRef = useRef(0);

  const load = useCallback(async (keepScroll = false) => {
    if (keepScroll) scrollRef.current = window.scrollY;
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([
        productsApi.getAll({ search, category: catFilter, limit: 500 }),
        categoriesApi.getAll(),
      ]);
      setProducts(Array.isArray(pr.data?.products) ? pr.data.products : []);
      setTotal(pr.data?.total || 0);
      setCategories(Array.isArray(cr.data) ? cr.data : []);
    } catch { toast.error('Xato'); }
    finally {
      setLoading(false);
      if (keepScroll) setTimeout(() => window.scrollTo({ top: scrollRef.current }), 50);
    }
  }, [search, catFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null); setForm(empty); setFiles([]);
    setPreviews([]); setExistingImgs([]); setModal(true);
  };

  const openEdit = (p) => {
    scrollRef.current = window.scrollY;
    setEditId(p.id);
    setForm({
      name: p.name, description: p.description || '',
      price: p.price, old_price: p.old_price || '',
      cost_price: p.cost_price || '', stock: p.stock,
      category_id: p.category_id || '', badge: p.badge || '',
      specs: p.specs?.length ? p.specs : [{ key: '', val: '' }],
      image_urls: ''
    });
    setExistingImgs(p.images || []); setFiles([]); setPreviews([]);
    setModal(true);
  };

  const handleFiles = (e) => {
    const sel = Array.from(e.target.files);
    setFiles(prev => [...prev, ...sel]);
    sel.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPreviews(p => [...p, ev.target.result]);
      r.readAsDataURL(f);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Nom va narx majburiy');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      fd.append('price', form.price);
      fd.append('stock', form.stock || '0');
      if (form.old_price)   fd.append('old_price',   form.old_price);
      if (form.cost_price)  fd.append('cost_price',  form.cost_price);
      if (form.category_id) fd.append('category_id', form.category_id);
      if (form.badge)       fd.append('badge',       form.badge);
      fd.append('specs', JSON.stringify(form.specs.filter(s => s.key && s.val)));
      files.forEach(f => fd.append('images', f));
      if (form.image_urls.trim()) {
        form.image_urls.split('\n').filter(u => u.trim()).forEach(u => fd.append('image_urls', u.trim()));
      }
      if (editId) {
        const orig = products.find(p => p.id === editId);
        const rmImages = (orig?.images || []).filter(i => !existingImgs.find(e => e.url === i.url));
        const rmIds = rmImages.map(i => i.fileId || i.filename).filter(Boolean);
        if (rmIds.length) fd.append('remove_images', JSON.stringify(rmIds));
        await productsApi.update(editId, fd);
        toast.success('Yangilandi');
      } else {
        await productsApi.create(fd);
        toast.success('Yaratildi');
      }
      setModal(false);
      load(true);
    } catch (err) { toast.error(err.response?.data?.error || 'Xato'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("O'chirasizmi?")) return;
    scrollRef.current = window.scrollY;
    try { await productsApi.delete(id); toast.success("O'chirildi"); load(true); }
    catch (err) { toast.error(err.response?.data?.error || 'Xato'); }
  };

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addSpec = () => setForm(p => ({ ...p, specs: [...p.specs, { key: '', val: '' }] }));
  const rmSpec  = (i) => setForm(p => ({ ...p, specs: p.specs.filter((_, j) => j !== i) }));

  const previewProfit   = profitCalc(form.price, form.cost_price);
  const previewDiscount = discountPercent(form.price, form.old_price);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Mahsulotlar</h1>
          <p className="text-slate-500 text-sm">{total} ta mahsulot</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Yangi mahsulot</button>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
          <input className="input pl-9 py-2 text-sm" placeholder="Qidiruv..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select py-2 text-sm w-48" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Barcha kategoriya</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 text-xs text-slate-600 border-b border-slate-800">
              <tr>
                {['Rasm','Nom','Narx','Sotib olish','Foyda','Stok','Kategoriya',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-600 py-12">Mahsulotlar yo'q</td></tr>
              ) : products.map(p => {
                const dp = discountPercent(p.price, p.old_price);
                const profit = profitCalc(p.price, p.cost_price);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                        {p.images?.[0]?.url
                          ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          : <Package size={16} className="m-auto mt-2.5 text-slate-600" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-slate-200 max-w-48 line-clamp-1">{p.name}</div>
                      {dp && <div className="text-xs text-rose-400">-{dp}% chegirma</div>}
                    </td>
                    <td className="px-4 py-3 text-sm font-black text-white whitespace-nowrap">
                      {fmt(p.price)}
                      {p.old_price && <div className="text-xs text-slate-600 line-through">{fmt(p.old_price)}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {p.cost_price ? fmt(p.cost_price) : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                      {profit !== null
                        ? <span className={profit >= 0 ? 'text-violet-400' : 'text-rose-400'}>{profit >= 0 ? '+' : ''}{fmt(profit)}</span>
                        : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-black ${p.stock === 0 ? 'text-rose-400' : p.stock <= 5 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {p.stock}{p.stock <= 5 && p.stock > 0 && <AlertTriangle size={12} className="inline ml-0.5" />}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryPicker product={p} categories={categories} onSave={() => load(true)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-600 hover:text-violet-400 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => del(p.id)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="card rounded-3xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 rounded-t-3xl z-10">
              <h2 className="text-lg font-black text-white font-display">{editId ? 'Tahrirlash' : 'Yangi mahsulot'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mahsulot nomi *</label>
                <input className="input" placeholder="Arduino Uno R3" value={form.name} onChange={e => sf('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tavsif</label>
                <textarea className="input resize-none" rows={2} placeholder="Mahsulot haqida..."
                  value={form.description} onChange={e => sf('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Sotish narxi * (so'm)</label>
                  <input className="input" type="number" placeholder="89000" value={form.price} onChange={e => sf('price', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Eski narx (chegirma uchun)</label>
                  <input className="input" type="number" placeholder="120000" value={form.old_price} onChange={e => sf('old_price', e.target.value)} />
                  {previewDiscount && <p className="text-xs text-rose-400 mt-1">Chegirma: -{previewDiscount}%</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Sotib olish narxi <span className="text-slate-600 normal-case font-normal">— faqat admin</span></label>
                  <input className="input" type="number" placeholder="65000" value={form.cost_price} onChange={e => sf('cost_price', e.target.value)} />
                  {previewProfit !== null && (
                    <p className={`text-xs mt-1 font-bold ${previewProfit >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                      Foyda: {previewProfit >= 0 ? '+' : ''}{fmt(previewProfit)} so'm
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stok (dona)</label>
                  <input className="input" type="number" placeholder="100" value={form.stock} onChange={e => sf('stock', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kategoriya</label>
                  <select className="select" value={form.category_id} onChange={e => sf('category_id', e.target.value)}>
                    <option value="">Tanlang...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Badge</label>
                  <select className="select" value={form.badge} onChange={e => sf('badge', e.target.value)}>
                    {BADGES.map(b => <option key={b} value={b}>{BL[b]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Rasmlar (max 5 ta)</label>
                {existingImgs.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {existingImgs.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingImgs(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {previews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {previews.map((p, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-violet-800">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setFiles(f => f.filter((_, j) => j !== i)); setPreviews(p => p.filter((_, j) => j !== i)); }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-rose-600 transition-colors">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-violet-600 hover:text-violet-400 transition-all text-sm font-semibold">
                    <Upload size={15} /> Fayl yuklash
                  </button>
                  <div className="relative">
                    <Link2 size={14} className="absolute left-3 top-3.5 text-slate-600" />
                    <textarea className="input pl-8 text-xs resize-none" rows={2} placeholder={"URL (har qator alohida)\nhttps://..."}
                      value={form.image_urls} onChange={e => sf('image_urls', e.target.value)} />
                  </div>
                </div>
                <input type="file" ref={fileRef} accept="image/*" multiple className="hidden" onChange={handleFiles} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Texnik xususiyatlar</label>
                  <button type="button" onClick={addSpec} className="text-xs text-violet-400 font-bold hover:text-violet-300">+ Qo'shish</button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input text-xs py-2 flex-1" placeholder="Xususiyat nomi" value={s.key}
                        onChange={e => { const sp = [...form.specs]; sp[i].key = e.target.value; sf('specs', sp); }} />
                      <input className="input text-xs py-2 flex-1" placeholder="Qiymati" value={s.val}
                        onChange={e => { const sp = [...form.specs]; sp[i].val = e.target.value; sf('specs', sp); }} />
                      <button type="button" onClick={() => rmSpec(i)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-700 hover:bg-rose-900/30 text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0 mt-0.5">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saqlanmoqda...' : editId ? 'Yangilash' : 'Yaratish'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-outline">Bekor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}