import { Link } from 'react-router-dom';
import { ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const BADGE = {
  new: ['badge-new', 'Yangi'],
  sale: ['badge-sale', 'Chegirma'],
  hot: ['badge-hot', 'Ommabop'],
  popular: ['badge-popular', 'Popular'],
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const inStock = product.stock > 0;
  const badge = BADGE[product.badge];
  const imgUrl = product.images?.[0]?.url;

  const discount = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!inStock) return;
    addToCart({ id: product.id, name: product.name, price: product.price, old_price: product.old_price, image: imgUrl || null });
    toast.success('Savatga qo\'shildi');
  };

  return (
    <Link to={`/products/${product.id}`}
      className="group bg-[#100d1a] rounded-xl border border-slate-800/80 hover:border-violet-700/40 hover:shadow-xl hover:shadow-violet-900/10 transition-all duration-200 flex flex-col overflow-hidden">
      <div className="relative aspect-square bg-slate-800/50 overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={36} className="text-slate-700" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badge && <span className={badge[0]}>{badge[1]}</span>}
          {discount && <span className="badge-sale">-{discount}%</span>}
        </div>
        {!inStock && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <span className="bg-slate-800 border border-slate-600 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">Mavjud emas</span>
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1 gap-1.5">
        {product.category_name && (
          <span className="text-xs text-violet-500 font-bold uppercase tracking-wide">{product.category_name}</span>
        )}
        <h3 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2 group-hover:text-violet-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-sm font-black text-white">
            {Number(product.price).toLocaleString('uz-UZ')}
            <span className="text-xs font-semibold text-slate-600 ml-0.5">so'm</span>
          </span>
          {product.old_price && product.old_price > product.price && (
            <span className="text-xs text-slate-600 line-through">{Number(product.old_price).toLocaleString('uz-UZ')}</span>
          )}
        </div>
        {inStock && product.stock === 1 && (
          <div className="flex items-center gap-1 text-xs text-orange-400 font-bold">
            <AlertTriangle size={11} /> Faqat 1 ta qoldi!
          </div>
        )}
        <button onClick={handleAdd} disabled={!inStock}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all mt-1
            ${inStock
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 active:scale-95 shadow-sm shadow-violet-900/40'
              : 'bg-slate-800/80 text-slate-600 cursor-not-allowed border border-slate-700'}`}>
          <ShoppingCart size={13} />
          {inStock ? 'Savatga qo\'shish' : 'Mavjud emas'}
        </button>
      </div>
    </Link>
  );
}
