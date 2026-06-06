import { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

/**
 * SimilarProducts
 * Shows in-stock products from the same category as `product`.
 * Falls back to same brand if fewer than 2 category matches are found.
 */
const SimilarProducts = ({ product, limit = 4, className = '' }) => {
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

  const similar = useMemo(() => {
    if (!allProducts.length || !product) return [];

    const currentId = product._id || product.id;
    const currentCategory = String(product.category || '').toLowerCase().trim();
    const currentBrand = String(product.brand || '').toLowerCase().trim();

    const pool = allProducts.filter(
      p => (p._id || p.id) !== currentId && p.inStock !== false
    );

    // Primary: same category
    let matches = pool.filter(
      p => String(p.category || '').toLowerCase().trim() === currentCategory
    );

    // Fallback: same brand if we don't have enough
    if (matches.length < 2 && currentBrand) {
      const brandMatches = pool.filter(
        p =>
          String(p.brand || '').toLowerCase().trim() === currentBrand &&
          !matches.find(m => (m._id || m.id) === (p._id || p.id))
      );
      matches = [...matches, ...brandMatches];
    }

    return matches.slice(0, limit);
  }, [allProducts, product, limit]);

  if (loading || similar.length === 0) return null;

  return (
    <section className={`py-16 border-t border-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="bg-[var(--secondary)]/30 p-2 rounded-xl">
            <LayoutGrid className="text-[var(--primary)]" size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            Similar Products
          </h2>
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
            transition={{ duration: 0.45, delay: idx * 0.08 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;
