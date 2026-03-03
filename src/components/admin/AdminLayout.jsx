import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tag, Settings, LogOut, Cpu, Menu, X, BookOpen, Star, LayoutTemplate } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const NAV = [
  { to: '/robomarket-dashboard-2025', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/robomarket-dashboard-2025/products', label: 'Mahsulotlar', icon: Package },
  { to: '/robomarket-dashboard-2025/orders', label: 'Zakazlar', icon: ShoppingCart },
  { to: '/robomarket-dashboard-2025/categories', label: 'Kategoriyalar', icon: Tag },
  { to: '/robomarket-dashboard-2025/blog', label: 'Yangiliklar', icon: BookOpen },
  { to: '/robomarket-dashboard-2025/reviews', label: 'Sharhlar', icon: Star },
  { to: '/robomarket-dashboard-2025/hero-cards', label: 'Hero Kartochkalar', icon: LayoutTemplate },
  { to: '/robomarket-dashboard-2025/settings', label: 'Sozlamalar', icon: Settings },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to, exact) => exact
    ? location.pathname === to
    : location.pathname.startsWith(to) && (to !== '/robomarket-dashboard-2025' || location.pathname === '/robomarket-dashboard-2025');

  const handleLogout = () => { logout(); navigate('/robomarket-dashboard-2025/login'); };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/60 group-hover:bg-violet-500 transition-colors">
            <Cpu size={18} className="text-white"/>
          </div>
          <div>
            <div className="font-black text-white text-sm font-display">RoboMarket</div>
            <div className="text-xs text-slate-600">Admin panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? 'bg-violet-900/30 text-violet-400 border border-violet-800/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={17}/>{label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-800 hover:text-rose-400 transition-all">
          <LogOut size={17}/> Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#07050f]">
      <aside className="hidden md:flex flex-col w-56 bg-[#09071a] border-r border-slate-800/60 fixed inset-y-0 left-0 z-30">
        <SidebarContent/>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)}/>
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
            <SidebarContent/>
          </aside>
        </div>
      )}

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-[#09071a] border-b border-slate-800/60 px-4 md:px-6 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button className="md:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-400"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={20}/>
          </button>
          <h2 className="font-black text-white font-display text-sm">
            {NAV.find(n => isActive(n.to, n.exact))?.label || 'Admin'}
          </h2>
          <Link to="/" className="ml-auto text-xs text-violet-400 font-bold hover:text-violet-400 hidden sm:block">
            Saytga o'tish →
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
