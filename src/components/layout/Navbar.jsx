import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// LayoutDashboard ikonkasini qo'shdik
import { ShoppingCart, Search, Cpu, Package, Grid3X3, BookOpen, Home, MessageCircle, User, X, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';

const BOTTOM_NAV = [
  { to: '/',           label: 'Asosiy',     icon: Home },
  { to: '/products',   label: 'Mahsulot',   icon: Package },
  { to: '/categories', label: 'Kategoriya', icon: Grid3X3 },
  { to: '/blog',       label: 'Yangilik',   icon: BookOpen },
  { to: '/contact',    label: 'Aloqa',      icon: MessageCircle },
];

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Admin huquqi bor-yo'qligini saqlash uchun state
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  
  const { totalItems } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // Sayt yuklanganda localStorage'dan adminlikni tekshirish
  useEffect(() => {
    const adminStatus = localStorage.getItem('isRoboAdmin');
    if (adminStatus === 'true') {
      setHasAdminAccess(true);
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          
          <button onClick={handleLogoClick} className="flex items-center gap-2 group mr-8">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-white text-xl tracking-tight">Robo<span className="text-violet-500">Market</span></span>
          </button>

          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qidirish..."
                className="w-full h-10 pl-10 pr-4 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-all"
              />
            </form>
          </div>

          <nav className="flex items-center gap-1 mx-6">
            {BOTTOM_NAV.filter((_, i) => i !== 2).map(({ to, label }) => (
              <Link key={to} to={to} className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive(to) ? 'bg-violet-900/40 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>{label}</Link>
            ))}
            <Link to="/categories" className={`px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive('/categories') ? 'bg-violet-900/40 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>Kategoriya</Link>
          </nav>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-6 ml-auto">
            {/* Desktop Admin Ikonkasi */}
            {hasAdminAccess && (
              <Link to="/robomarket-dashboard-2025" className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all mr-1" title="Admin Panel">
                <LayoutDashboard size={20} />
              </Link>
            )}

            <Link to="/profile" className={`flex items-center gap-2 px-3 h-10 rounded-xl border transition-all ${isActive('/profile') ? 'bg-violet-900/40 border-violet-500/50 text-violet-400' : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'}`}>
              <User size={18} />
              <span className="text-xs font-bold">Kabinet</span>
            </Link>
            <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-violet-400 transition-all">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── MOBILE TOP HEADER ── */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-16 overflow-hidden">
        <div className="relative w-full h-full flex items-center px-4">
          <div className={`flex items-center w-full transition-all duration-300 ${isSearchOpen ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <button onClick={handleLogoClick} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Cpu size={18} className="text-white" />
              </div>
              <span className="font-black text-white text-lg tracking-tighter">Robo<span className="text-violet-500">Market</span></span>
            </button>
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobil Admin Ikonkasi */}
              {hasAdminAccess && (
                <Link to="/robomarket-dashboard-2025" className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <LayoutDashboard size={20} />
                </Link>
              )}

              <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400"><Search size={20} /></button>
              <Link to="/profile" className={`w-10 h-10 flex items-center justify-center rounded-xl border ${isActive('/profile') ? 'bg-violet-900/40 border-violet-500/50 text-violet-400' : 'bg-slate-800/60 border-slate-700/50 text-slate-400'}`}><User size={20} /></Link>
              <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400">
                <ShoppingCart size={20} />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-slate-900">{totalItems}</span>}
              </Link>
            </div>
          </div>

          <div className={`absolute inset-0 px-4 bg-slate-900 flex items-center transition-all duration-300 ${isSearchOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mahsulot nomini yozing..."
                  className="w-full h-11 pl-10 pr-4 bg-slate-800 border border-violet-500/50 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>
              <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400"><X size={20} /></button>
            </form>
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      {/* ... (Bu qism o'zgarmadi, o'z holicha qoladi) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/50">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV.map(({ to, label, icon: Icon }, idx) => {
            const active = isActive(to);
            const isMiddle = idx === 2;
            return (
              <Link key={to} to={to} className="relative flex flex-col items-center min-w-[60px]">
                {isMiddle ? (
                  <div className="flex flex-col items-center -mt-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 transform ${active ? 'bg-white text-violet-600 rotate-[360deg] scale-110 ring-4 ring-violet-500/20' : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'}`}>
                      <Icon size={28} strokeWidth={2.5} className={active ? 'animate-bounce' : ''} />
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 transition-colors ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                  </div>
                ) : (
                  <div className={`flex flex-col items-center transition-all duration-300 ${active ? '-translate-y-2' : ''}`}>
                    <div className={`p-1.5 transition-all duration-300 ${active ? 'text-violet-400 scale-125' : 'text-slate-500'}`}>
                      <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-bold ${active ? 'text-violet-400' : 'text-slate-500'}`}>{label}</span>
                    {active && <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1 animate-pulse shadow-[0_0_10px_#a78bfa]" />}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden h-2" />
    </>
  );
}