import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Cpu, Package, Grid3X3, Phone, BookOpen, Settings, Home } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/',           label: 'Asosiy',       icon: Home },
  { to: '/products',   label: 'Mahsulotlar',  icon: Package },
  { to: '/categories', label: 'Kategoriyalar', icon: Grid3X3 },
  { to: '/blog',       label: 'Yangiliklar',  icon: BookOpen },
  { to: '/contact',    label: 'Aloqa',        icon: Phone },
];

export default function Navbar() {
  const { totalItems }      = useCart();
  const { isAuthenticated } = useAuth();
  const [q, setQ]           = useState('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/products?search=${encodeURIComponent(q.trim())}`);
      setQ('');
    }
  };

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <header className="hidden md:block bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <button onClick={handleLogoClick}
              className="flex items-center gap-2 flex-shrink-0 group select-none">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:opacity-90 transition-opacity">
                <Cpu size={16} className="text-white" />
              </div>
              <span className="font-black text-white text-base">
                Robo<span className="text-gradient">Market</span>
              </span>
            </button>

            <form onSubmit={handleSearch} className="flex flex-1 ml-3">
              <div className="relative w-full">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Qidirish..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-all" />
              </div>
            </form>

            <nav className="flex items-center gap-0.5">
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
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg px-1">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBIL TOP BAR ── */}
      <header className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center h-12 px-3 gap-2">
          <button onClick={handleLogoClick} className="flex items-center gap-1.5 flex-shrink-0 select-none">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-sm">
              Robo<span className="text-gradient">Market</span>
            </span>
          </button>

          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="Mahsulot qidirish..."
                className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500" />
            </div>
          </form>

          {isAuthenticated && (
            <Link to="/robomarket-dashboard-2025"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-900/30 border border-violet-700/50 text-violet-400 flex-shrink-0">
              <Settings size={14} />
            </Link>
          )}
        </div>
      </header>

      {/* ── MOBIL PASTKI NAVBAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
        <div className="flex items-center justify-around px-1 py-1.5">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all
                ${isActive(to) ? 'text-violet-400' : 'text-slate-600'}`}>
              <Icon size={20} strokeWidth={isActive(to) ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          ))}
          <Link to="/cart"
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative
              ${isActive('/cart') ? 'text-violet-400' : 'text-slate-600'}`}>
            <div className="relative">
              <ShoppingCart size={20} strokeWidth={isActive('/cart') ? 2.5 : 1.8} />
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

      {/* Pastki navbar uchun joy */}
      <div className="md:hidden h-16" />
    </>
  );
}