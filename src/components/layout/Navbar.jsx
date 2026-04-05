import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Cpu, Package, Grid3X3, Phone, BookOpen, Settings, Home, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../utils/api';

const NAV_LINKS = [
  { to: '/',           label: 'Asosiy',      icon: Home },
  { to: '/products',   label: 'Mahsulotlar', icon: Package },
  { to: '/categories', label: 'Kategoriya',  icon: Grid3X3 },
  { to: '/blog',       label: 'Yangilik',    icon: BookOpen },
  { to: '/contact',    label: 'Aloqa',       icon: Phone },
];

function SearchBox({ className = '' }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await productsApi.getAll({ search: val.trim(), limit: 6 });
        setResults(res.data.products || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    setQ(''); setOpen(false); setResults([]);
  };

  const go = (id) => {
    navigate(`/products/${id}`);
    setQ(''); setOpen(false); setResults([]);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={q}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Mahsulot qidirish..."
            className="w-full pl-8 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
          {q && (
            <button type="button" onClick={() => { setQ(''); setResults([]); setOpen(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={13} />
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-[100]">
          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-500">Qidirilmoqda...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500">Topilmadi</div>
          ) : (
            <>
              {results.map(p => {
                const img = p.images?.[0]?.url;
                return (
                  <button key={p.id} onClick={() => go(p.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 transition-colors text-left">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                      {img
                        ? <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        : <Package size={16} className="text-slate-600 m-auto mt-1.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                      <div className="text-xs text-violet-400 font-bold">{Number(p.price).toLocaleString('uz-UZ')} so'm</div>
                    </div>
                  </button>
                );
              })}
              <button onClick={handleSubmit}
                className="w-full text-center text-xs text-violet-400 font-bold py-2.5 border-t border-slate-800 hover:bg-slate-800 transition-colors">
                Barcha natijalar →
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

  const tapCount = useRef(0);
  const tapTimer = useRef(null);

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
      {/* DESKTOP */}
      <header className="hidden md:block bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <button onClick={handleLogoClick} className="flex items-center gap-2 flex-shrink-0 group select-none">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:opacity-90 transition-opacity">
                <Cpu size={16} className="text-white" />
              </div>
              <span className="font-black text-white text-base">Robo<span className="text-gradient">Market</span></span>
            </button>

            <SearchBox className="flex-1 max-w-sm ml-3" />

            <nav className="flex items-center gap-0.5 ml-auto">
              {NAV_LINKS.filter(n => n.to !== '/').map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                    ${isActive(to) ? 'bg-violet-900/40 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isAuthenticated && (
                <Link to="/robomarket-dashboard-2025"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-900/30 border border-violet-700/50 hover:bg-violet-800/40 transition-colors text-violet-400">
                  <Settings size={15} />
                </Link>
              )}
              <Link to="/cart"
                className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-600 hover:bg-violet-900/20 transition-all text-slate-400 hover:text-violet-400">
                <ShoppingCart size={16} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MOBIL TOP */}
      <header className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center h-12 px-3 gap-2">
          <button onClick={handleLogoClick} className="flex items-center gap-1.5 flex-shrink-0 select-none">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-sm">Robo<span className="text-gradient">Market</span></span>
          </button>

          <SearchBox className="flex-1" />

          {isAuthenticated && (
            <Link to="/robomarket-dashboard-2025"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-900/30 border border-violet-700/50 text-violet-400 flex-shrink-0">
              <Settings size={14} />
            </Link>
          )}
        </div>
      </header>

      {/* MOBIL PASTKI NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-xl border-t border-slate-800/80">
        <div className="flex items-end justify-between px-6 pt-2 pb-3">

          <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-violet-400' : 'text-slate-500'}`}>
            <Home size={22} strokeWidth={isActive('/') ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold">Asosiy</span>
          </Link>

          <Link to="/products" className={`flex flex-col items-center gap-1 transition-all ${isActive('/products') ? 'text-violet-400' : 'text-slate-500'}`}>
            <Package size={22} strokeWidth={isActive('/products') ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold">Mahsulot</span>
          </Link>

          {/* O'rta katta tugma */}
          <Link to="/categories" className="flex flex-col items-center gap-1 -mt-6 transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all
              ${isActive('/categories') ? 'bg-violet-500' : 'bg-gradient-to-br from-violet-600 to-indigo-600'} shadow-violet-900/50`}>
              <Grid3X3 size={26} className="text-white" strokeWidth={2} />
            </div>
            <span className={`text-[10px] font-bold ${isActive('/categories') ? 'text-violet-400' : 'text-slate-500'}`}>Kategoriya</span>
          </Link>

          <Link to="/blog" className={`flex flex-col items-center gap-1 transition-all ${isActive('/blog') ? 'text-violet-400' : 'text-slate-500'}`}>
            <BookOpen size={22} strokeWidth={isActive('/blog') ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold">Yangilik</span>
          </Link>

          <Link to="/cart" className={`flex flex-col items-center gap-1 transition-all relative ${isActive('/cart') ? 'text-violet-400' : 'text-slate-500'}`}>
            <div className="relative">
              <ShoppingCart size={22} strokeWidth={isActive('/cart') ? 2.5 : 1.8} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-violet-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Savat</span>
          </Link>

        </div>
      </nav>

      <div className="md:hidden h-20" />
    </>
  );
}