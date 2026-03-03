import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Link2, ImageIcon } from 'lucide-react';
import { categoriesApi } from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { name: '', description: '', image_url: '' };

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const r = await categoriesApi.getAll();
      setCats(r.data || []);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null); setForm(empty); setFile(null); setPreview(''); setUrlInput(''); setModal(true);
  };
  const openEdit = (c) => {
    setEditId(c.id);
    setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '' });
    setFile(null);
    setPreview(c.image_url || '');
    setUrlInput(c.image_url || '');
    setModal(true);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
    setUrlInput('');
    setForm(p => ({ ...p, image_url: '' }));
  };

  const handleUrlChange = (val) => {
    setUrlInput(val);
    setForm(p => ({ ...p, image_url: val }));
    if (val.trim()) {
      setPreview(val.trim());
      setFile(null);
    }
  };

  const clearImage = () => {
    setPreview(''); setFile(null); setUrlInput('');
    setForm(p => ({ ...p, image_url: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nom majburiy');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description || '');

      if (file) {
        fd.append('image', file);
      } else if (urlInput.trim()) {
        // URL ni to'g'ri field nomi bilan yuborish
        fd.append('image_url', urlInput.trim());
      } else {
        fd.append('image_url', '');
      }

      if (editId) {
        await categoriesApi.update(editId, fd);
        toast.success('Yangilandi');
      } else {
        await categoriesApi.create(fd);
        toast.success('Yaratildi');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Kategoriyani o'chirasizmi?")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("O'chirildi");
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Kategoriyalar</h1>
          <p className="text-slate-500 text-sm">{cats.length} ta kategoriya</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Yangi</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-36 skeleton rounded-2xl" />)}
        </div>
      ) : cats.length === 0 ? (
        <div className="card p-12 text-center text-slate-600">Kategoriyalar yo'q</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cats.map(c => (
            <div key={c.id} className="card overflow-hidden group">
              <div className="relative h-28 bg-slate-800 overflow-hidden">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={e => { e.target.style.display='none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-slate-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <div className="font-bold text-white text-sm">{c.name}</div>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{c.product_count || 0} ta mahsulot</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-violet-400 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => del(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-[#100d1a] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-lg font-black text-white">{editId ? 'Tahrirlash' : 'Yangi kategoriya'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Nom *</label>
                <input className="input" placeholder="Kategoriya nomi" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tavsif</label>
                <textarea className="input resize-none" rows={2} placeholder="Qisqacha tavsif..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Orqa fon rasmi</label>
                {preview && (
                  <div className="relative mb-3 h-28 rounded-xl overflow-hidden border border-slate-700">
                    <img src={preview} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.src = ''; setPreview(''); }} />
                    <button type="button" onClick={clearImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-rose-600 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {/* URL input */}
                  <div className="relative">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      className="input pl-8 text-sm"
                      placeholder="Rasm URL manzili: https://..."
                      value={urlInput}
                      onChange={e => handleUrlChange(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-xs text-slate-600">yoki</span>
                    <div className="flex-1 h-px bg-slate-800" />
                  </div>
                  {/* File upload */}
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-violet-600 hover:text-violet-400 transition-all text-sm font-semibold">
                    <Upload size={15} /> Kompyuterdan yuklash
                  </button>
                </div>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFile} />
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
