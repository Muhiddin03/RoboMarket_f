import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Cpu, Package, Grid3X3, Phone, BookOpen, Settings } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/products',   label: 'Mahsulotlar',  icon: Package },
  { to: '/categories', label: 'Kategoriyalar', icon: Grid3X3 },
  { to: '/blog',       label: 'Yangiliklar',   icon: BookOpen },
  { to: '/contact',    label: 'Aloqa',         icon: Phone },
];

export default function Navbar() {
  const { totalItems }      = useCart();
  const { isAuthenticated } = useAuth();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ]                   = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();

  // Logo tap logikasi:
  //   1 marta bosish  → bosh sahifaga (/)
  //   5 marta tez bosish → /robomarket-dashboard-2025/login
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

    // 700ms ichida yana bosilmasa — bosh sahifaga
    tapTimer.current = setTimeout(() => {
      if (tapCount.current === 1) {
        navigate('/');
      }
      tapCount.current = 0;
    }, 700);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/products?search=${encodeURIComponent(q.trim())}`);
      setQ(''); setMenuOpen(false); setSearchOpen(false);
    }
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 flex-shrink-0 group select-none"
            title="Bosh sahifa"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:opacity-90 transition-opacity">
              <Cpu size={16} className="text-white" />
            </div>
            <span className="font-black text-white text-base">
              Robo<span className="text-gradient">Market</span>
            </span>
          </button>

          {/* Qidiruv — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 ml-3">
            <div className="relative w-full">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Qidirish..."
                className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>
          </form>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-0.5 ml-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                  ${isActive(to) ? 'bg-violet-900/40 text-gradient' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                {label}
              </Link>
            ))}
          </nav>

          {/* O'ng ikonlar */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">

            {/* Qidiruv — mobil */}
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
              <Search size={16} />
            </button>

            {/* Admin icon — faqat login bo'lganda */}
            {isAuthenticated && (
              <Link to="/robomarket-dashboard-2025" title="Admin panel"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-900/30 border border-violet-700/50 hover:bg-violet-800/40 transition-colors text-violet-400">
                <Settings size={15} />
              </Link>
            )}

            {/* Savat */}
            <Link to="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 hover:border-violet-600 hover:bg-violet-900/20 transition-all text-slate-400 hover:text-violet-400">
              <ShoppingCart size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg px-1">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Burger — mobil */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobil qidiruv */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Mahsulot qidirish..." autoFocus
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500" />
              </div>
            </form>
          </div>
        )}

        {/* Mobil menyu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 py-2 space-y-0.5">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                  ${isActive(to) ? 'bg-violet-900/40 text-gradient' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Icon size={15} />{label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/robomarket-dashboard-2025" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-violet-400 hover:bg-violet-900/20 transition-colors">
                <Settings size={15} />Admin panel
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
