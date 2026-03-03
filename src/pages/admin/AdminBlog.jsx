import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Link2, Eye, EyeOff, Youtube, FileText, Save, ExternalLink, File, Download, Code2 } from 'lucide-react';
import { blogApi } from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { title: '', description: '', content: '', video_url: '', tags: '', is_published: '1' };

const FILE_ICONS = {
  pdf: '📄', zip: '📦', rar: '📦',
  ino: '⚡', py: '🐍', js: '🟡', cpp: '🔵', c: '🔵', h: '🔵',
  txt: '📝', md: '📝', json: '📋',
};
const getFileIcon = (type) => FILE_ICONS[type] || '📎';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // existing files in post
  const [pendingFiles, setPendingFiles] = useState([]); // new files to upload
  const [links, setLinks] = useState([]); // [{label, url}]
  const [linkInput, setLinkInput] = useState({ label: '', url: '' });
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const coverRef = useRef();
  const mediaRef = useRef();
  const filesRef = useRef();

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const r = await blogApi.getAdminAll();
      setPosts(r.data || []);
    } catch { toast.error('Xato'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null); setForm(empty); setCoverFile(null); setCoverPreview(''); setCoverUrl('');
    setMediaFiles([]); setMediaPreviews([]); setExistingMedia([]); setLinks([]);
    setUploadedFiles([]); setPendingFiles([]); setVideoUrlInput(''); setLinkInput({ label: '', url: '' });
    setModal(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description || '', content: p.content || '', video_url: p.video_url || '', tags: (p.tags || []).join(', '), is_published: p.is_published ? '1' : '0' });
    setCoverFile(null); setCoverPreview(p.cover_image || ''); setCoverUrl(p.cover_image || '');
    setExistingMedia(p.media || []); setMediaFiles([]); setMediaPreviews([]);
    setLinks(p.links || []);
    setUploadedFiles(p.files || []);
    setPendingFiles([]); setVideoUrlInput(''); setLinkInput({ label: '', url: '' });
    setModal(true);
  };

  const handleCoverFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setCoverFile(f); setCoverUrl('');
    const r = new FileReader(); r.onload = ev => setCoverPreview(ev.target.result); r.readAsDataURL(f);
  };

  const handleMediaFiles = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const r = new FileReader(); r.onload = ev => setMediaPreviews(prev => [...prev, ev.target.result]); r.readAsDataURL(f);
    });
  };

  const handlePendingFiles = (e) => {
    setPendingFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const addLink = () => {
    if (!linkInput.url.trim()) return;
    setLinks(prev => [...prev, { label: linkInput.label || linkInput.url, url: linkInput.url }]);
    setLinkInput({ label: '', url: '' });
  };

  const addVideoToMedia = () => {
    if (!videoUrlInput.trim()) return;
    setExistingMedia(prev => [...prev, { type: 'video', url: videoUrlInput.trim() }]);
    setVideoUrlInput('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Sarlavha majburiy');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('content', form.content.trim());
      fd.append('video_url', form.video_url.trim());
      fd.append('tags', form.tags);
      fd.append('is_published', form.is_published);
      fd.append('links', JSON.stringify(links));

      if (coverFile) { fd.append('cover', coverFile); }
      else if (coverUrl) { fd.append('cover_url', coverUrl); }
      else { fd.append('cover_url', ''); }

      mediaFiles.forEach(f => fd.append('media_images', f));
      const videoMedia = existingMedia.filter(m => m.type === 'video');
      if (videoMedia.length > 0 || existingMedia.filter(m => m.type === 'image' && !mediaPreviews.find(p => p === m.url)).length > 0) {
        fd.append('media_json', JSON.stringify(existingMedia.filter(m => m.type === 'video')));
      }
      if (editId) {
        const removedMedia = [];
        fd.append('remove_media', JSON.stringify(removedMedia));
      }

      let savedPost;
      if (editId) {
        const r = await blogApi.update(editId, fd);
        savedPost = r.data;
      } else {
        const r = await blogApi.create(fd);
        savedPost = r.data;
      }

      // Upload pending files
      if (pendingFiles.length > 0 && savedPost?.id) {
        setUploadingFiles(true);
        const fileFd = new FormData();
        pendingFiles.forEach(f => fileFd.append('files', f));
        await blogApi.uploadFiles(savedPost.id, fileFd);
      }

      toast.success(editId ? 'Yangilandi' : 'Nashr etildi');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato');
    } finally {
      setSaving(false); setUploadingFiles(false);
    }
  };

  const removeUploadedFile = async (postId, fileUrl) => {
    try {
      await blogApi.removeFile(postId, fileUrl);
      setUploadedFiles(prev => prev.filter(f => f.url !== fileUrl));
      toast.success("Fayl o'chirildi");
    } catch { toast.error('Xato'); }
  };

  const del = async (id) => {
    if (!window.confirm("Maqolani o'chirasizmi?")) return;
    try { await blogApi.delete(id); toast.success("O'chirildi"); load(); }
    catch { toast.error('Xato'); }
  };

  
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Yangiliklar</h1>
          <p className="text-slate-500 text-sm">{posts.length} ta maqola</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16}/> Yangi maqola</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl"/>)}</div>
      ) : posts.length === 0 ? (
        <div className="card p-16 text-center text-slate-600">
          <FileText size={40} className="mx-auto mb-3 text-slate-700"/>
          <p className="font-bold">Maqolalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map(p => (
            <div key={p.id} className="card p-4 flex items-start gap-4 hover:border-violet-800/30 transition-colors">
              {p.cover_image && (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={p.cover_image} alt="" className="w-full h-full object-cover"/>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${p.is_published ? 'bg-violet-900/30 text-violet-400 border-violet-800/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {p.is_published ? 'Nashr' : 'Qoralama'}
                  </span>
                  {p.video_url && <span className="text-xs text-red-400 flex items-center gap-1"><Youtube size={11}/> Video</span>}
                  {p.files?.length > 0 && <span className="text-xs text-amber-400 flex items-center gap-1"><File size={11}/> {p.files.length} fayl</span>}
                </div>
                <h3 className="font-black text-white text-sm line-clamp-1">{p.title}</h3>
                {p.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>}
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                  <span>{fmtDate(p.created_at)}</span>
                  <span>{p.views} ko'rish</span>
                  {p.tags?.length > 0 && <span className="text-violet-600">{p.tags.slice(0,2).join(', ')}</span>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <a href={`/blog/${p.id}`} target="_blank" rel="noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-600 hover:text-violet-400 transition-colors">
                  <Eye size={14}/>
                </a>
                <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-violet-400 transition-colors">
                  <Pencil size={14}/>
                </button>
                <button onClick={() => del(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-[#0d0b18] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-[#0d0b18] z-10 rounded-t-3xl">
              <h2 className="text-lg font-black text-white">{editId ? 'Maqolani tahrirlash' : 'Yangi maqola'}</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500">
                <X size={16}/>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Publish toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <button type="button"
                  onClick={() => sf('is_published', form.is_published === '1' ? '0' : '1')}
                  className={`flex items-center gap-2 text-sm font-bold transition-colors ${form.is_published === '1' ? 'text-violet-400' : 'text-slate-500'}`}>
                  {form.is_published === '1' ? <Eye size={15}/> : <EyeOff size={15}/>}
                  {form.is_published === '1' ? 'Nashr etilgan' : 'Qoralama'}
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Sarlavha *</label>
                <input className="input" placeholder="Maqola sarlavhasi..." value={form.title} onChange={e => sf('title', e.target.value)}/>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Qisqacha tavsif</label>
                <textarea className="input resize-none" rows={2}
                  placeholder="Ro'yxatda ko'rinadigan qisqacha tavsif (2-3 jumla)..."
                  value={form.description} onChange={e => sf('description', e.target.value)}/>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Muqova rasmi</label>
                {coverPreview && (
                  <div className="relative mb-2 h-36 rounded-xl overflow-hidden border border-slate-700">
                    <img src={coverPreview} alt="" className="w-full h-full object-cover"/>
                    <button type="button" onClick={() => { setCoverPreview(''); setCoverFile(null); setCoverUrl(''); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-rose-600">
                      <X size={13}/>
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => coverRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-violet-600 hover:text-violet-400 text-xs font-bold transition-all">
                    <Upload size={13}/> Kompyuterdan
                  </button>
                  <div className="relative">
                    <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                    <input className="input pl-7 text-xs" placeholder="Rasm URL..."
                      value={coverUrl} onChange={e => { setCoverUrl(e.target.value); setCoverPreview(e.target.value); setCoverFile(null); }}/>
                  </div>
                </div>
                <input type="file" ref={coverRef} accept="image/*" className="hidden" onChange={handleCoverFile}/>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Teglar</label>
                <input className="input" placeholder="arduino, sensor, loyiha (vergul bilan)"
                  value={form.tags} onChange={e => sf('tags', e.target.value)}/>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Matn (Markdown)</label>
                <textarea className="input resize-y font-mono text-sm text-violet-300 leading-relaxed" rows={10}
                  placeholder={'# Sarlavha\n## Bo\'lim\n\nOdatiy matn...\n\n**Qalin** va *kursiv*\n\n```cpp\nvoid setup() {\n  // kod\n}\n```\n\n- ro\'yxat elementi'}
                  value={form.content} onChange={e => sf('content', e.target.value)}/>
              </div>

              {/* Video (main) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Asosiy YouTube Video</label>
                <div className="relative">
                  <Youtube size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500"/>
                  <input className="input pl-8" placeholder="https://youtube.com/watch?v=..."
                    value={form.video_url} onChange={e => sf('video_url', e.target.value)}/>
                </div>
              </div>

              {/* Extra media (images + extra videos) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Qo'shimcha rasmlar va videolar</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingMedia.map((m, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                      {m.type === 'image'
                        ? <img src={m.url} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center"><Youtube size={18} className="text-red-400"/></div>}
                      <button type="button" onClick={() => setExistingMedia(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white text-[10px]">
                        <X size={9}/>
                      </button>
                    </div>
                  ))}
                  {mediaPreviews.map((p, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-violet-800">
                      <img src={p} alt="" className="w-full h-full object-cover"/>
                      <button type="button" onClick={() => { setMediaFiles(f => f.filter((_, j) => j !== i)); setMediaPreviews(prev => prev.filter((_, j) => j !== i)); }}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white">
                        <X size={9}/>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => mediaRef.current?.click()}
                    className="flex items-center justify-center gap-1 p-2.5 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-violet-600 hover:text-violet-400 text-xs font-bold transition-all">
                    <Upload size={12}/> Rasm qo'shish
                  </button>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Youtube size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-red-500"/>
                      <input className="input pl-7 text-xs py-2" placeholder="YouTube URL..." value={videoUrlInput} onChange={e => setVideoUrlInput(e.target.value)}/>
                    </div>
                    <button type="button" onClick={addVideoToMedia} className="btn-outline text-xs px-2.5 py-2">+</button>
                  </div>
                </div>
                <input type="file" ref={mediaRef} accept="image/*" multiple className="hidden" onChange={handleMediaFiles}/>
              </div>

              {/* Links */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Foydali havolalar (websayt, manba...)</label>
                {links.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {links.map((l, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
                        <ExternalLink size={12} className="text-violet-500 flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{l.label}</div>
                          <div className="text-xs text-slate-500 truncate">{l.url}</div>
                        </div>
                        <button type="button" onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))}
                          className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0">
                          <X size={13}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input className="input text-xs" placeholder="Sarlavha (ixtiyoriy)"
                    value={linkInput.label} onChange={e => setLinkInput(p => ({ ...p, label: e.target.value }))}/>
                  <input className="input text-xs" placeholder="https://..."
                    value={linkInput.url} onChange={e => setLinkInput(p => ({ ...p, url: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}/>
                  <button type="button" onClick={addLink} className="btn-outline text-xs px-3 whitespace-nowrap">+ Qo'sh</button>
                </div>
              </div>

              {/* Code / File uploads */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Kodlar va fayllar (yuklab olish uchun)</label>
                {/* Existing files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
                        <span className="text-base">{getFileIcon(f.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{f.name}</div>
                          <div className="text-xs text-slate-500">{f.type?.toUpperCase()} {f.size ? `· ${(f.size/1024).toFixed(0)} KB` : ''}</div>
                        </div>
                        {editId && (
                          <button type="button" onClick={() => removeUploadedFile(editId, f.url)}
                            className="text-slate-600 hover:text-rose-400 transition-colors">
                            <X size={13}/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Pending new files */}
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-violet-900/20 border border-violet-800/30 rounded-lg px-2.5 py-1.5">
                        <span className="text-sm">{getFileIcon(f.name.split('.').pop())}</span>
                        <span className="text-xs text-violet-300 font-semibold max-w-[100px] truncate">{f.name}</span>
                        <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                          className="text-violet-600 hover:text-rose-400"><X size={11}/></button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => filesRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-violet-600 hover:text-violet-400 text-xs font-bold transition-all">
                  <Code2 size={14}/> Fayl yuklash (.ino, .py, .zip, .pdf, .cpp...)
                </button>
                <input type="file" ref={filesRef} multiple className="hidden"
                  accept=".ino,.py,.js,.cpp,.c,.h,.json,.txt,.md,.pdf,.zip,.rar"
                  onChange={handlePendingFiles}/>
                <p className="text-xs text-slate-700 mt-1">Ruxsat etilgan: kod, PDF, ZIP fayllar. Max: 20MB</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploadingFiles} className="btn-primary flex-1 justify-center py-3">
                  <Save size={15}/>{saving ? 'Saqlanmoqda...' : uploadingFiles ? 'Fayllar yuklanmoqda...' : editId ? 'Yangilash' : 'Nashr etish'}
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
