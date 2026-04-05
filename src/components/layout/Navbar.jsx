import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Cpu, Package, Grid3X3, BookOpen, Home, MessageCircle, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../utils/api';

const BOTTOM_NAV = [
  { to: '/',           label: 'Asosiy',     icon: Home },
  { to: '/products',   label: 'Mahsulot',   icon: Package },
  { to: '/categories', label: 'Kategoriya', icon: Grid3X3 },
  { to: '/contact',    label: 'Aloqa',      icon: MessageCircle },
  { to: '/blog',       label: 'Yangilik',   icon: BookOpen },
];

function SearchBar({ isMobile = false }) {
  const [q, setQ]           = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const navigate = useNavigate();
  const timer    = useRef(null);
  const box      = useRef(null);

  // Tashqariga bossa yopilsin
  useEffect(() => {
    const fn = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const onChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    setBusy(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await productsApi.getAll({ search: val.trim(), limit: 7 });
        const list = res.data?.products || [];
        setResults(list);
        setOpen(true);
      } catch { setResults([]); }
      finally { setBusy(false); }
    }, 250);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    setQ(''); setOpen(false); setResults([]);
  };

  const pick = (id) => {
    navigate(`/products/${id}`);
    setQ(''); setOpen(false); setResults([]);
  };

  const clear = () => { setQ(''); setResults([]); setOpen(false); };

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={onSubmit}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={q}
            onChange={onChange}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Mahsulot qidirish..."
            className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          {q && (
            <button type="button" onClick={clear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown natijalar */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e0b1a] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-[200]">
          {busy ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
              <span className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
              Qidirilmoqda...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500">Mahsulot topilmadi</div>
          ) : (
            <>
              {results.map(p => {
                const img = p.images?.[0]?.url;
                return (
                  <button key={p.id} onClick={() => pick(p.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/80 transition-colors border-b border-slate-800/60 last:border-0 text-left">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                      {img
                        ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        : <Package size={18} className="text-slate-600 m-auto mt-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">{p.name}</div>
                      <div className="text-xs text-violet-400 font-bold mt-0.5">
                        {Number(p.price).toLocaleString('uz-UZ')} so'm
                      </div>
                    </div>
                    {p.stock === 0 && (
                      <span className="text-[10px] text-slate-600 font-bold flex-shrink-0">Tugagan</span>
                    )}
                  </button>
                );
              })}
              <button onClick={onSubmit}
                className="w-full text-center text-xs text-violet-400 font-bold py-2.5 hover:bg-slate-800/50 transition-colors">
                Barcha natijalarni ko'rish →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { totalItems }      = useCart();
  const { isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const tapCount  = useRef(0);
  const tapTimer  = useRef(null);

  const handleLogoClick = useCallback(() => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      navigate('/robomarket-dashboard-2025/login');
      return;
    }
    tapTimer.current = setTimeout(() => {
      if (tapCount.current === 1) navigate('/');
      tapCount.current = 0;
    }, 700);
  }, [navigate]);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <>
      {/* ── DESKTOP ── */}
      <header className="hidden md:block bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">

            {/* Logo */}
            <button onClick={handleLogoClick} className="flex items-center gap-2 flex-shrink-0 group select-none">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:opacity-90 transition-opacity">
                <Cpu size={16} className="text-white" />
              </div>
              <span className="font-black text-white text-base">Robo<span className="text-gradient">Market</span></span>
            </button>

            {/* Search — desktop da keng */}
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>

            {/* Nav */}
            <nav className="flex items-center gap-0.5 ml-auto">
              {[
                { to: '/products',   label: 'Mahsulotlar' },
                { to: '/categories', label: 'Kategoriyalar' },
                { to: '/blog',       label: 'Yangiliklar' },
                { to: '/contact',    label: 'Aloqa' },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                    ${isActive(to) ? 'bg-violet-900/40 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Savat */}
            <Link to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-600 hover:bg-violet-900/20 transition-all text-slate-300 hover:text-violet-400 text-sm font-semibold flex-shrink-0">
              <ShoppingCart size={16} />
              Savat
              {totalItems > 0 && (
                <span className="min-w-[20px] h-5 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── MOBIL TOP ── */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center h-12 px-3 gap-2">

          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-1.5 flex-shrink-0 select-none">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-sm">Robo<span className="text-gradient">Market</span></span>
          </button>

          {/* Search — mobilida ham keng */}
          <div className="flex-1">
            <SearchBar isMobile />
          </div>

          {/* Savat icon */}
          <Link to="/cart"
            className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400">
            <ShoppingCart size={17} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-violet-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ── MOBIL PASTKI NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800">
        <div className="flex items-end justify-around px-2 pt-2 pb-3">
          {BOTTOM_NAV.map(({ to, label, icon: Icon }, idx) => {
            const active  = isActive(to);
            const isMiddle = idx === 2;
            return isMiddle ? (
              <Link key={to} to={to} className="flex flex-col items-center gap-0.5 -mt-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all
                  ${active ? 'bg-violet-500' : 'bg-gradient-to-br from-violet-600 to-indigo-600'} shadow-violet-900/60`}>
                  <Icon size={24} className="text-white" strokeWidth={2} />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${active ? 'text-violet-400' : 'text-slate-500'}`}>{label}</span>
              </Link>
            ) : (
              <Link key={to} to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all
                  ${active ? 'text-violet-400' : 'text-slate-500'}`}>
                <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-bold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden h-20" />
    </>
  );
}