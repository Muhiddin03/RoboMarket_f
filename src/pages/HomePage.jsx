import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones, ChevronRight, Cpu, Package, Star, CircuitBoard, Wifi, Layers, Wrench, Bot, Cog } from 'lucide-react';
import { productsApi, categoriesApi, visitorsApi, heroCardsApi } from '../utils/api';
import ProductGrid from '../components/product/ProductGrid';

const ICON_MAP = { CircuitBoard, Wifi, Layers, Wrench, Package, Cpu, Bot, Cog, Star, Zap };

const CircuitSVG = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <line x1="0" y1="120" x2="1400" y2="120" stroke="#8b5cf6" strokeWidth="1"/>
    <line x1="0" y1="280" x2="1400" y2="280" stroke="#8b5cf6" strokeWidth="1"/>
    <line x1="180" y1="0" x2="180" y2="520" stroke="#8b5cf6" strokeWidth="1"/>
    <line x1="480" y1="0" x2="480" y2="520" stroke="#8b5cf6" strokeWidth="1"/>
    <line x1="800" y1="0" x2="800" y2="520" stroke="#8b5cf6" strokeWidth="1"/>
    <line x1="1100" y1="0" x2="1100" y2="520" stroke="#8b5cf6" strokeWidth="1"/>
    <circle cx="180" cy="120" r="5" fill="#8b5cf6"/>
    <circle cx="480" cy="280" r="5" fill="#8b5cf6"/>
    <circle cx="800" cy="120" r="7" fill="#8b5cf6"/>
    <circle cx="1100" cy="280" r="5" fill="#8b5cf6"/>
    <rect x="473" y="113" width="14" height="14" fill="none" stroke="#8b5cf6" strokeWidth="1"/>
    <rect x="1093" y="273" width="14" height="14" fill="none" stroke="#8b5cf6" strokeWidth="1"/>
  </svg>
);

const CARD_GRADS = [
  { bg: 'from-violet-950/90 to-violet-900/80', border: 'border-violet-700/40' },
  { bg: 'from-indigo-950/90 to-indigo-900/80', border: 'border-indigo-700/40' },
  { bg: 'from-purple-950/90 to-purple-900/80', border: 'border-purple-700/40' },
  { bg: 'from-fuchsia-950/90 to-fuchsia-900/80', border: 'border-fuchsia-800/40' },
];

const FEATURES = [
  { icon: Truck, label: 'Tez yetkazish', desc: "O'zbekiston bo'ylab", col: 'text-violet-400 bg-violet-900/20 border-violet-800/30' },
  { icon: Shield, label: 'Kafolat', desc: 'Tekshirilgan mahsulotlar', col: 'text-indigo-400 bg-indigo-900/20 border-indigo-800/30' },
  { icon: Zap, label: '300+ mahsulot', desc: 'Katta assortiment', col: 'text-amber-400 bg-amber-900/20 border-amber-800/30' },
  { icon: Headphones, label: 'Yordam', desc: 'Dush-Shan 9-18', col: 'text-fuchsia-400 bg-fuchsia-900/20 border-fuchsia-800/30' },
];

const CAT_COLS = ['from-violet-900 to-violet-700','from-indigo-900 to-indigo-700','from-purple-900 to-purple-700','from-fuchsia-900 to-fuchsia-700','from-rose-900 to-rose-700','from-amber-900 to-amber-700','from-sky-900 to-sky-700','from-teal-900 to-teal-700'];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [heroCards, setHeroCards] = useState([]);
  const tracked = useRef(false);

  useEffect(() => {
    // Faqat bir marta track - sessionStorage orqali
    if (!tracked.current) {
      tracked.current = true;
      const alreadyTracked = sessionStorage.getItem('rm_visited');
      if (!alreadyTracked) {
        sessionStorage.setItem('rm_visited', '1');
        visitorsApi.track()
          .then(r => setTotalVisitors(r.data?.total || 0))
          .catch(() => {});
      } else {
        visitorsApi.getTotal()
          .then(r => setTotalVisitors(r.data?.total || 0))
          .catch(() => {});
      }
    }

    Promise.all([
      productsApi.getAll({ badge: 'hot', limit: 10 }),
      productsApi.getAll({ badge: 'new', limit: 5 }),
      categoriesApi.getAll(),
      productsApi.getAll({ limit: 1 }),
      heroCardsApi.get(),
    ]).then(([hr, nr, cr, all, hc]) => {
      setProducts(hr.data.products || []);
      setNewProducts(nr.data.products || []);
      setCategories(cr.data || []);
      setTotalProducts(all.data.total || 0);
      setHeroCards(hc.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#07050f] min-h-[480px] flex items-center">
        <CircuitSVG />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet-700/4 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-700/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-12 relative w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Text */}
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold px-4 py-2 rounded-full mb-5">
                <Cpu size={11} /> O'zbekistondagi Nr.1 Robototexnika Do'koni
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-4">
                Elektronika va<br />
                <span className="text-gradient">Robototexnika</span>
              </h1>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-md">
                Arduino, sensorlar, motorlar va komponentlar. Namangan viloyatidan butun O'zbekistonga yetkazib beramiz.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                <Link to="/products" className="btn-primary px-6 py-3">
                  Xarid qilish <ArrowRight size={15} />
                </Link>
                <Link to="/blog" className="btn-outline px-5 py-3">
                  Yangiliklar
                </Link>
              </div>
              <div className="flex items-center gap-5 mt-7 flex-wrap justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <div className="text-lg font-black text-white">{totalProducts > 0 ? `${totalProducts}+` : '—'}</div>
                  <div className="text-xs text-slate-600">Mahsulot</div>
                </div>
                <div className="w-px h-7 bg-slate-800" />
                <div className="text-center lg:text-left">
                  <div className="text-lg font-black text-white">{totalVisitors > 0 ? totalVisitors.toLocaleString('uz-UZ') : '—'}</div>
                  <div className="text-xs text-slate-600">Tashrif</div>
                </div>
                <div className="w-px h-7 bg-slate-800" />
                <div className="text-center lg:text-left">
                  <div className="text-lg font-black text-white">Namangan</div>
                  <div className="text-xs text-slate-600">Shahar</div>
                </div>
              </div>
            </div>

            {/* Hero cards */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {(heroCards.length > 0 ? heroCards : [
                { id:1, title:'Arduino Uno R3', subtitle:"89,000 so'm", icon:'CircuitBoard' },
                { id:2, title:'ESP32 WiFi', subtitle:"65,000 so'm", icon:'Wifi' },
                { id:3, title:'Sensor Kit', subtitle:"185,000 so'm", icon:'Layers' },
                { id:4, title:'Servo SG90', subtitle:"25,000 so'm", icon:'Wrench' },
              ]).slice(0,4).map((card, i) => {
                const g = CARD_GRADS[i % 4];
                const Icon = ICON_MAP[card.icon] || CircuitBoard;
                return (
                  <div key={card.id || i}
                    className={`bg-gradient-to-br ${g.bg} border ${g.border} rounded-2xl overflow-hidden shadow-lg relative`}
                    style={{ animation: `hcFloat ${2.8 + i * 0.35}s ease-in-out ${i * 0.2}s infinite alternate` }}>
                    {card.image_url && (
                      <img src={card.image_url} alt={card.title} className="absolute inset-0 w-full h-full object-cover opacity-25" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    <div className="relative p-5">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center mb-3 border border-white/10">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="font-bold text-white text-sm leading-snug">{card.title}</div>
                      <div className="text-xs text-white/50 mt-1">{card.subtitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <style>{`@keyframes hcFloat{from{transform:translateY(0)}to{transform:translateY(-8px)}}`}</style>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc, col }) => (
            <div key={label} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${col}`}>
              <Icon size={17} className="flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-white leading-tight">{label}</div>
                <div className="text-xs text-slate-600 mt-0.5 hidden sm:block">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Kategoriyalar</h2>
            <Link to="/categories" className="text-violet-400 text-sm font-bold flex items-center gap-1 hover:text-violet-300 transition-colors">
              Hammasi <ChevronRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
            {categories.slice(0, 8).map((cat, i) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`}
                className="relative overflow-hidden rounded-xl group aspect-square">
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  : <div className={`absolute inset-0 bg-gradient-to-br ${CAT_COLS[i % CAT_COLS.length]}`} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <div className="text-white font-bold text-[9px] leading-tight line-clamp-2">{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hot products */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Zap size={17} className="text-amber-400" /><h2 className="section-title">Ommabop mahsulotlar</h2></div>
          <Link to="/products?badge=hot" className="text-violet-400 text-sm font-bold flex items-center gap-1 hover:text-violet-300 transition-colors">Ko'proq <ChevronRight size={13} /></Link>
        </div>
        <ProductGrid products={products} loading={loading} cols={5} />
      </section>

      {/* New products */}
      {(newProducts.length > 0 || loading) && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Star size={17} className="text-violet-400" /><h2 className="section-title">Yangi mahsulotlar</h2></div>
            <Link to="/products?badge=new" className="text-violet-400 text-sm font-bold flex items-center gap-1 hover:text-violet-300 transition-colors">Ko'proq <ChevronRight size={13} /></Link>
          </div>
          <ProductGrid products={newProducts} loading={loading} cols={5} />
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border border-violet-800/25 p-7 md:p-10">
          <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'linear-gradient(#8b5cf6 1px,transparent 1px),linear-gradient(90deg,#8b5cf6 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
          <div className="relative max-w-xl">
            <div className="text-violet-400 text-sm font-bold mb-3 flex items-center gap-2"><Package size={14}/> 500+ mahsulot mavjud</div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-4">Loyihangiz uchun kerakli komponentlarni toping</h2>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products" className="btn-primary">Xarid qilish <ArrowRight size={14}/></Link>
              <Link to="/blog" className="btn-outline">Loyiha g'oyalari</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
