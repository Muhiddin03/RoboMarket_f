import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Cpu, Package, Grid3X3, BookOpen, Home, MessageCircle, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';

const BOTTOM_NAV = [
  { to: '/',           label: 'Asosiy',     icon: Home },
  { to: '/products',   label: 'Mahsulot',   icon: Package },
  { to: '/categories', label: 'Kategoriya', icon: Grid3X3 },
  { to: '/blog',       label: 'Yangilik',   icon: BookOpen },
  { to: '/contact',    label: 'Aloqa',      icon: MessageCircle },
];

function SearchBar({ isMobile }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative">
        <Search size={isMobile ? 12 : 14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={isMobile ? "Qidirish..." : "Mahsulot qidirish..."}
          className={`w-full pl-8 pr-2 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-all ${isMobile ? 'text-[11px]' : 'text-sm'}`}
        />
      </div>
    </form>
  );
}

export default function Navbar() {
  const { totalItems } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
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
      {/* ── DESKTOP HEADER ── */}
      <header className="hidden md:block bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            <button onClick={handleLogoClick} className="flex items-center gap-2 flex-shrink-0 group select-none">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:scale-105 transition-transform">
                <Cpu size={18} className="text-white" />
              </div>
              <span className="font-black text-white text-lg">Robo<span className="text-violet-500">Market</span></span>
            </button>

            <div className="flex-1 max-w-xs mx-4">
              <SearchBar />
            </div>

            <nav className="flex items-center gap-1 ml-auto">
              {BOTTOM_NAV.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all
                    ${isActive(to) ? 'bg-violet-900/40 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
              <Link to="/profile" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/profile') ? 'bg-violet-900/40 text-violet-400' : 'text-slate-400 hover:text-white'}`}>
                <User size={18} />
                <span className="max-w-[70px] truncate">{customer ? customer.name.split(' ')[0] : 'Kabinet'}</span>
              </Link>
              <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE TOP HEADER (Hamma elementlar bir qatorda) ── */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center h-14 px-3 gap-2">
          {/* Logo + Text */}
          <button onClick={handleLogoClick} className="flex items-center gap-1 flex-shrink-0 select-none">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-[13px] leading-tight">Robo<br/><span className="text-violet-500">Market</span></span>
          </button>

          {/* Qidiruv (Input qisqartirildi) */}
          <div className="flex-1 min-w-0 max-w-[140px]">
            <SearchBar isMobile />
          </div>

          {/* O'ng tarafdagi tugmalar */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Link to="/profile" className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isActive('/profile') ? 'bg-violet-900/40 border-violet-500/50 text-violet-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <User size={16} />
            </Link>

            <Link to="/cart" className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
              <ShoppingCart size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-slate-900">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION (Interaktiv sakrash effekti bilan) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50">
        <div className="flex items-center justify-around px-1 py-2">
          {BOTTOM_NAV.map(({ to, label, icon: Icon }, idx) => {
            const active = isActive(to);
            const isMiddle = idx === 2;

            return (
              <Link key={to} to={to} className="relative flex flex-col items-center min-w-[60px]">
                {isMiddle ? (
                  <div className="flex flex-col items-center -mt-9">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 transform 
                      ${active ? 'bg-white text-violet-600 -translate-y-2 scale-110 shadow-violet-500/50' : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-violet-900/60'}`}>
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] font-bold mt-1 transition-colors ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                  </div>
                ) : (
                  <div className={`flex flex-col items-center transition-all duration-300 ${active ? '-translate-y-1.5' : 'translate-y-0'}`}>
                    <div className={`p-1 transition-colors duration-300 ${active ? 'text-violet-400' : 'text-slate-500'}`}>
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'animate-pulse' : ''} />
                    </div>
                    <span className={`text-[10px] font-bold transition-colors ${active ? 'text-violet-400' : 'text-slate-500'}`}>{label}</span>
                    {active && <div className="w-1 h-1 bg-violet-400 rounded-full mt-0.5 shadow-[0_0_5px_#a78bfa]" />}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden h-20" />
    </>
  );
}