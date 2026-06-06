import { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

/**
 * SimilarProducts
 *
 * Priority order:
 *  1. Same category + same subCategory (e.g. "men" + "sweater")
 *  2. Fallback: same category only (e.g. just "men") — when < 2 subcategory matches
 *
 * Reports shown IDs to parent via onLoaded so Recommended can exclude them.
 */
const SimilarProducts = ({ product, limit = 8, className = '', onLoaded }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProducts();
        setAllProducts(res ? res.filter(p => p && (p._id || p.id)) : []);
      } catch (err) {
        console.error('Similar products fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { similar, matchLabel } = useMemo(() => {
    if (!allProducts.length || !product) return { similar: [], matchLabel: '' };

    const currentId   = product._id || product.id;
    const currentCat  = String(product.category    || '').toLowerCase().trim();
    const currentSub  = String(product.subCategory || product.subcategory || '').toLowerCase().trim();

    const pool = allProducts.filter(
      p => (p._id || p.id) !== currentId && p.inStock !== false
    );

    const norm = (p, field) =>
      String(p[field] || '').toLowerCase().trim();

    // Step 1: exact subcategory + category match
    if (currentSub) {
      const subMatches = pool.filter(
        p =>
          norm(p, 'category') === currentCat &&
          norm(p, 'subCategory') === currentSub
      );

      if (subMatches.length >= 2) {
        return {
          similar: subMatches.slice(0, limit),
          matchLabel: `More in ${currentSub}`,
        };
      }
    }

    // Step 2: fallback to same category only
    const catMatches = pool.filter(p => norm(p, 'category') === currentCat);

    return {
      similar: catMatches.slice(0, limit),
      matchLabel: currentCat ? `More in ${currentCat}` : 'Similar Items',
    };
  }, [allProducts, product, limit]);

  // Notify parent which IDs are shown → RecommendedProducts can exclude them
  useEffect(() => {
    if (!loading && onLoaded) {
      onLoaded(similar.map(p => p._id || p.id));
    }
  }, [similar, loading, onLoaded]);

  if (loading || similar.length === 0) return null;

  return (
    <section className={`py-16 border-t border-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="bg-[var(--secondary)]/30 p-2 rounded-xl">
            <LayoutGrid className="text-[var(--primary)]" size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
              Similar Products
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5 capitalize">
              {matchLabel}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {similar.length} item{similar.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {similar.map((p, idx) => (
          <motion.div
            key={p._id || p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.07 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;
