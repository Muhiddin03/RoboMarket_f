import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ label = 'Orqaga', to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      className="flex items-center gap-2 text-slate-500 hover:text-violet-400 transition-colors text-sm font-semibold group mb-5"
    >
      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-violet-700/50 group-hover:bg-violet-900/20 transition-all">
        <ArrowLeft size={14} />
      </div>
      {label}
    </button>
  );
}
