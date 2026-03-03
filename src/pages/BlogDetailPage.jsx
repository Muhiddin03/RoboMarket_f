import { useState, useEffect } from 'react';
import { fmtDate, fmtDateTime } from '../utils/date';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/ui/BackButton';
import { Calendar, Eye, ArrowLeft, Youtube, Copy, Check, ExternalLink, Download, File, Code2, BookOpen } from 'lucide-react';
import { blogApi } from '../utils/api';
import toast from 'react-hot-toast';

const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s]+)/);
  return m ? m[1] : null;
};

const FILE_ICONS = { pdf:'📄',zip:'📦',rar:'📦',ino:'⚡',py:'🐍',js:'🟡',cpp:'🔵',c:'🔵',h:'🔵',txt:'📝',md:'📝',json:'📋' };
const getFileIcon = t => FILE_ICONS[t] || '📎';

const renderContent = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-black text-white mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-black text-white mt-7 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-black text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-300 italic">$1</em>')
    .replace(/`([^`\n]+?)`/g, '<code class="bg-slate-800 text-violet-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```(\w*)\n?([\s\S]*?)```/gm, (_, lang, code) => `<div class="code-block relative my-4"><div class="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 rounded-t-xl"><span class="text-xs text-slate-500 font-mono font-bold">${lang || 'code'}</span><button class="copy-btn text-xs text-violet-500 hover:text-violet-300 font-bold" data-code="${encodeURIComponent(code.trim())}"><span class="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Nusxa</span></button></div><pre class="bg-slate-900 border border-slate-700 border-t-0 rounded-b-xl p-4 overflow-x-auto"><code class="text-violet-300 text-sm font-mono whitespace-pre">${code.trim().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')}</code></pre></div>`)
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 text-slate-400 mb-1"><span class="text-violet-500 mt-1.5 text-xs flex-shrink-0">▸</span><span>$1</span></li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, '<ul class="my-3 space-y-0.5">$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-slate-400 mb-1 ml-5 list-decimal">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline underline-offset-2">$1</a>')
    .replace(/^(?!<[h123uola]).+$/gm, m => m.trim() ? `<p class="text-slate-400 leading-relaxed mb-3">${m}</p>` : '')
    .replace(/<p[^>]*><\/p>/g, '');
};

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    blogApi.getOne(id).then(r => setPost(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Copy code block handler
  useEffect(() => {
    const handleCopy = (e) => {
      const btn = e.target.closest('.copy-btn');
      if (!btn) return;
      const code = decodeURIComponent(btn.dataset.code || '');
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = '<span class="flex items-center gap-1 text-violet-300"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Nusxa olindi</span>';
        setTimeout(() => { btn.innerHTML = '<span class="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Nusxa</span>'; }, 2000);
      });
    };
    document.addEventListener('click', handleCopy);
    return () => document.removeEventListener('click', handleCopy);
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="h-7 skeleton rounded-xl w-3/4"/>
      <div className="h-48 skeleton rounded-2xl"/>
      {[...Array(6)].map((_, i) => <div key={i} className="h-4 skeleton rounded-full" style={{width:`${70+Math.random()*30}%`}}/>)}
    </div>
  );

  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <BookOpen size={40} className="mx-auto mb-4 text-slate-700"/>
      <h2 className="text-xl font-black text-white mb-4">Maqola topilmadi</h2>
      <Link to="/blog" className="btn-primary">Yangiliklarga qaytish</Link>
    </div>
  );

  const ytId = getYoutubeId(post.video_url);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <BackButton label="Yangiliklarga qaytish" to="/blog" />
      {/* Back */}
      <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-400 transition-colors text-sm font-bold mb-5">
        <ArrowLeft size={15}/> Yangiliklarga qaytish
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-violet-900/30 text-violet-400 border border-violet-800/40 px-2.5 py-1 rounded-full font-bold">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">{post.title}</h1>

      {/* Description */}
      {post.description && (
        <p className="text-slate-400 text-base leading-relaxed mb-4 pb-4 border-b border-slate-800/60">
          {post.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-600 mb-6">
        <div className="flex items-center gap-1.5"><Calendar size={12}/>{fmtDate(post.created_at)}</div>
        <div className="flex items-center gap-1.5"><Eye size={12}/>{post.views} ko'rib</div>
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800/60">
          <img src={post.cover_image} alt={post.title} className="w-full max-h-80 object-cover"/>
        </div>
      )}

      {/* Main YouTube video */}
      {ytId && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800/60 aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={post.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {/* Content */}
      {post.content && (
        <div className="prose-content mb-6"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}/>
      )}

      {/* Extra media */}
      {post.media?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-violet-900/40 rounded flex items-center justify-center text-violet-400 text-xs">▶</span>
            Qo'shimcha media
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {post.media.map((m, i) => m.type === 'image' ? (
              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                <img src={m.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"/>
              </div>
            ) : getYoutubeId(m.url) ? (
              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-800">
                <iframe src={`https://www.youtube.com/embed/${getYoutubeId(m.url)}`}
                  title={`video-${i}`} allowFullScreen className="w-full h-full"/>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Links */}
      {post.links?.length > 0 && (
        <div className="mb-6 card p-4">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <ExternalLink size={15} className="text-violet-400"/> Foydali havolalar
          </h3>
          <div className="space-y-2">
            {post.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-violet-900/20 hover:border-violet-800/40 border border-transparent transition-all group">
                <div className="w-7 h-7 bg-violet-900/30 border border-violet-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={13} className="text-violet-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">{l.label || l.url}</div>
                  <div className="text-xs text-slate-500 truncate">{l.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Downloadable files */}
      {post.files?.length > 0 && (
        <div className="mb-6 card p-4">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <Download size={15} className="text-violet-400"/> Yuklab olish
          </h3>
          <div className="space-y-2">
            {post.files.map((f, i) => (
              <a key={i} href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-violet-900/20 border border-transparent hover:border-violet-800/40 transition-all group">
                <span className="text-xl flex-shrink-0">{getFileIcon(f.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">{f.name}</div>
                  <div className="text-xs text-slate-500">{f.type?.toUpperCase()} {f.size ? `· ${(f.size/1024).toFixed(0)} KB` : ''}</div>
                </div>
                <div className="flex items-center gap-1.5 bg-violet-900/30 border border-violet-800/30 text-violet-400 text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-violet-900/50 transition-colors flex-shrink-0">
                  <Download size={12}/> Yuklab
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="border-t border-slate-800/60 pt-5 mt-5">
        <Link to="/blog" className="btn-outline">
          <ArrowLeft size={15}/> Barcha maqolalar
        </Link>
      </div>
    </div>
  );
}
