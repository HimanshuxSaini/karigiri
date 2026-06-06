import { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * RecommendedProducts
 * Shows 8–10 randomly shuffled in-stock products,
 * excluding the current product + anything already shown in SimilarProducts.
 * Re-shuffles every time the page is opened (fresh random each mount).
 */
const RecommendedProducts = ({ title = "You May Also Like", excludeProductIds = [], limit = 10, className = "" }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProducts();
        setAllProducts(res ? res.filter(p => p && (p._id || p.id)) : []);
      } catch (err) {
        console.error("Recommendation loading failed", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recommendations = useMemo(() => {
    if (!allProducts.length) return [];

    const excludeSet = new Set(excludeProductIds);

    const pool = allProducts.filter(
      p => !excludeSet.has(p._id || p.id) && p.inStock !== false
    );

    // Fisher-Yates shuffle — different every page visit
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return up to `limit` items (default 10, min shown = 8 if available)
    return shuffled.slice(0, Math.min(shuffled.length, limit));
  }, [allProducts, excludeProductIds, limit]);

  if (loading || recommendations.length === 0) return null;

  return (
    <section className={`py-16 ${className}`}>
      <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-[var(--secondary)]/30 p-2 rounded-xl">
            <Sparkles className="text-[var(--primary)]" size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
              {title}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Handpicked for you
            </p>
          </div>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {recommendations.length} item{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {recommendations.map((product, idx) => (
          <motion.div
            key={product._id || product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedProducts;
