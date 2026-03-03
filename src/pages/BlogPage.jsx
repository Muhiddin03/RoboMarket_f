import { useState, useEffect } from 'react';
import { fmtDate, fmtDateTime } from '../utils/date';
import BackButton from '../components/ui/BackButton';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Tag, ArrowRight, BookOpen, Youtube, Code2 } from 'lucide-react';
import { blogApi } from '../utils/api';

const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s]+)/);
  return m ? m[1] : null;
};

const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="h-44 skeleton"/>
    <div className="p-4 space-y-2.5">
      <div className="h-3 skeleton rounded-full w-1/3"/>
      <div className="h-5 skeleton rounded-full w-5/6"/>
      <div className="h-3.5 skeleton rounded-full w-full"/>
      <div className="h-3.5 skeleton rounded-full w-4/5"/>
    </div>
  </div>
);

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getAll({ limit: 30 })
      .then(r => setPosts(r.data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BackButton />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-white"/>
          </div>
          <h1 className="text-2xl font-black text-white">So'ngi Yangiliklar</h1>
        </div>
        <p className="text-slate-500 text-sm">Robototexnika, Arduino loyihalari va yangi qurilmalar haqida</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i}/>)}
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={40} className="text-slate-700 mx-auto mb-3"/>
          <p className="text-slate-500 font-bold">Hali maqola yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => {
            const ytId = getYoutubeId(post.video_url);
            const coverSrc = post.cover_image || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
            return (
              <div key={post.id} className="card overflow-hidden group hover:border-violet-700/50 transition-all flex flex-col">
                {/* Cover */}
                <div className="h-44 bg-slate-800/80 overflow-hidden relative flex-shrink-0">
                  {coverSrc ? (
                    <img src={coverSrc} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Code2 size={36} className="text-slate-700"/>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#100d1a]/80 to-transparent"/>
                  {/* Video badge */}
                  {post.video_url && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <Youtube size={13} className="text-red-400"/>
                      <span className="text-xs text-white font-bold">Video</span>
                    </div>
                  )}
                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-violet-900/80 text-violet-300 border border-violet-700/40 px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-black text-white text-sm leading-snug mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-3 flex-1">
                      {post.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-auto pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1">
                      <Calendar size={11}/>
                      {fmtDate(post.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={11}/> {post.views}
                    </div>
                  </div>
                  <Link to={`/blog/${post.id}`}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-violet-900/20 border border-violet-800/30 rounded-xl text-violet-400 text-xs font-bold hover:bg-violet-900/30 hover:border-violet-700/50 transition-all">
                    Ko'proq o'qish <ArrowRight size={13}/>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
