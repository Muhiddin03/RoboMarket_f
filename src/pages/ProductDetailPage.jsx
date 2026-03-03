import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BackButton from '../components/ui/BackButton';
import { ShoppingCart, ArrowLeft, Package, Minus, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { productsApi } from '../utils/api';
import { useCart } from '../context/CartContext';
import ProductGrid from '../components/product/ProductGrid';
import ReviewsSection from '../components/product/ReviewsSection';
import toast from 'react-hot-toast';

const BADGE_CLS = { new: 'badge-new', sale: 'badge-sale', hot: 'badge-hot', popular: 'badge-popular' };
const BADGE_LBL = { new: 'Yangi', sale: 'Chegirma', hot: 'Ommabop', popular: 'Popular' };

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setRelated([]);
    setImgIdx(0);
    setQty(1);
    setAdded(false);
    window.scrollTo(0, 0);

    productsApi.getOne(id)
      .then(r => {
        const p = r.data;
        setProduct(p);
        if (p?.category_id) {
          productsApi.getAll({ category: p.category_slug, limit: 8 })
            .then(rr => setRelated((rr.data.products || []).filter(x => x.id !== p.id).slice(0, 5)))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product || product.stock < 1) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        old_price: product.old_price,
        image: product.images?.[0]?.url || null,
      });
    }
    setAdded(true);
    toast.success(`${qty} ta savatga qo'shildi!`);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square skeleton rounded-2xl" />
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-8 skeleton rounded-xl" />)}</div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <Package size={48} className="mx-auto mb-4 text-slate-700" />
      <h2 className="text-xl font-black text-white mb-4">Mahsulot topilmadi</h2>
      <Link to="/products" className="btn-primary">Mahsulotlarga qaytish</Link>
    </div>
  );

  const images = Array.isArray(product.images) ? product.images : [];
  const currentImg = images[imgIdx]?.url || null;
  const inStock = (product.stock || 0) > 0;
  const discount = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BackButton label="Mahsulotlarga qaytish" to="/products" />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-5 flex-wrap">
        <Link to="/" className="hover:text-violet-400 transition-colors">Bosh sahifa</Link>
        <span className="text-slate-700">/</span>
        <Link to="/products" className="hover:text-violet-400 transition-colors">Mahsulotlar</Link>
        {product.category_name && (
          <>
            <span className="text-slate-700">/</span>
            <Link to={`/products?category=${product.category_slug}`} className="hover:text-violet-400 transition-colors">{product.category_name}</Link>
          </>
        )}
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 truncate max-w-[180px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800/40 border border-slate-800 mb-3 flex items-center justify-center">
            {currentImg
              ? <img src={currentImg} alt={product.name} className="w-full h-full object-contain" />
              : <Package size={64} className="text-slate-700" />}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-violet-500' : 'border-slate-700 hover:border-slate-600'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {product.badge && BADGE_CLS[product.badge] && (
              <span className={BADGE_CLS[product.badge]}>{BADGE_LBL[product.badge]}</span>
            )}
            {discount && <span className="badge-sale">-{discount}%</span>}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{product.name}</h1>

          {product.category_name && (
            <Link to={`/products?category=${product.category_slug}`}
              className="text-sm text-violet-400 font-bold hover:text-violet-300 transition-colors w-fit">
              {product.category_name}
            </Link>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">
              {Number(product.price).toLocaleString('uz-UZ')}
              <span className="text-base font-semibold text-slate-500 ml-1">so'm</span>
            </span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-lg text-slate-600 line-through">
                {Number(product.old_price).toLocaleString('uz-UZ')} so'm
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-slate-400 leading-relaxed text-sm border-l-2 border-violet-800/50 pl-3">
              {product.description}
            </p>
          )}

          <div>
            {inStock
              ? <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-400"><CheckCircle size={15} /> Mavjud ({product.stock} ta)</span>
              : <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500"><AlertTriangle size={15} /> Tugagan</span>}
          </div>

          {inStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-700 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-400 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-black text-base text-white">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-800 text-slate-400 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-black text-sm transition-all ${added ? 'bg-green-800/70 text-green-300 border border-green-700' : 'btn-primary'}`}>
                {added
                  ? <><CheckCircle size={16} /> Qo'shildi!</>
                  : <><ShoppingCart size={16} /> Savatga qo'shish</>}
              </button>
            </div>
          )}

          {product.specs?.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="font-bold text-slate-500 mb-3 text-xs uppercase tracking-widest">Texnik xususiyatlar</h3>
              <div className="space-y-2">
                {product.specs.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-800/80 last:border-0">
                    <span className="text-slate-500">{s.key}</span>
                    <span className="font-bold text-slate-300">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} />

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title mb-5">O'xshash mahsulotlar</h2>
          <ProductGrid products={related} loading={false} cols={5} />
        </div>
      )}
    </div>
  );
}
