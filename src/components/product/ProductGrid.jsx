import { Search } from 'lucide-react';
import ProductCard from './ProductCard';

const SkeletonCard = () => (
  <div className="bg-[#100d1a] rounded-xl overflow-hidden border border-slate-800/80">
    <div className="aspect-square skeleton" />
    <div className="p-2.5 space-y-2">
      <div className="h-2.5 skeleton rounded-full w-1/3" />
      <div className="h-3.5 skeleton rounded-full w-5/6" />
      <div className="h-3.5 skeleton rounded-full w-4/6" />
      <div className="h-5 skeleton rounded-full w-1/2 mt-1" />
      <div className="h-8 skeleton rounded-lg mt-1" />
    </div>
  </div>
);

export default function ProductGrid({ products, loading, cols = 5 }) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

  if (loading) return (
    <div className={`grid ${colClass} gap-2.5`}>
      {[...Array(Math.min(cols * 2, 10))].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!products?.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
      <Search size={36} className="mb-3 text-slate-700" />
      <p className="font-semibold text-sm">Mahsulot topilmadi</p>
    </div>
  );

  return (
    <div className={`grid ${colClass} gap-2.5`}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
