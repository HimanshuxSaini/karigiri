import { useState, useEffect, useMemo } from 'react';
import { useCartStore, useWishlistStore, useActivityStore } from '../store/useStore';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const RecommendedProducts = ({ title = "Curated For You", excludeProductIds = [], limit = 4, className = "" }) => {
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { visitedIds, searchTerms } = useActivityStore();
  
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProducts();
        // Filter for items that are valid products
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

    // Identify explicit cart products
    const cartIds = items.map(i => (i._id || i.id)).filter(Boolean);
    
    // Identify current interest domains (categories)
    const cartCategories = items.map(i => String(i.category || '').toLowerCase()).filter(Boolean);
    const wishlistCategories = wishlist.map(i => String(i.category || '').toLowerCase()).filter(Boolean);
    
    // Collect data for viewed products
    const visitedProducts = allProducts.filter(p => visitedIds.includes(p._id || p.id));
    const visitedCategories = visitedProducts.map(i => String(i.category || '').toLowerCase()).filter(Boolean);

    // Combine negative filters: don't recommend items already in cart or explicitly blacklisted (like current product detail item)
    const excludeSet = new Set([...excludeProductIds, ...cartIds]);

    const scoredProducts = allProducts
      .filter(p => !excludeSet.has(p._id || p.id) && p.inStock !== false) // Exclude items already chosen/out of stock
      .map(p => {
        let score = 0;
        const pId = p._id || p.id;
        const pCategory = String(p.category || '').toLowerCase();
        const pName = String(p.name || '').toLowerCase();
        const pDesc = String(p.description || '').toLowerCase();
        const pBrand = String(p.brand || '').toLowerCase();

        // Boost 1: Interest Overlap (Categories)
        if (cartCategories.includes(pCategory)) score += 15;
        if (wishlistCategories.includes(pCategory)) score += 12;
        if (visitedCategories.includes(pCategory)) score += 8;

        // Boost 2: Keyword matching on active search intent
        searchTerms.forEach(term => {
          const cleanedTerm = term.toLowerCase();
          if (pName.includes(cleanedTerm)) score += 20;
          if (pDesc.includes(cleanedTerm)) score += 10;
          if (pCategory.includes(cleanedTerm)) score += 15;
          if (pBrand.includes(cleanedTerm)) score += 20;
        });

        // Boost 3: Recency/Visit Reminder (Visited previously but didn't buy)
        const visitIndex = visitedIds.indexOf(pId);
        if (visitIndex !== -1) {
          // Higher boost if visited more recently (closer to index 0)
          score += (25 - Math.min(15, visitIndex));
        }

        // Boost 4: Wishlisted items that are NOT in cart yet should have MAXIMUM priority to prompt checkout
        const inWishlist = wishlist.some(wi => (wi._id || wi.id) === pId);
        if (inWishlist) {
          score += 35;
        }

        // Tie-breaker: Minor deterministic pseudo-randomness to not stay static forever
        const charSum = pName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        score += (charSum % 5);

        return { ...p, score };
      });

    // Get top scorers
    const topItems = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
      
    // If user has no history, just grab top 4 random products
    if (topItems.every(item => item.score <= 5)) {
        // Shuffle randomly
        return [...allProducts]
          .filter(p => !excludeSet.has(p._id || p.id) && p.inStock !== false)
          .sort(() => 0.5 - Math.random())
          .slice(0, limit);
    }
    
    return topItems;

  }, [allProducts, items, wishlist, visitedIds, searchTerms, excludeProductIds, limit]);

  if (loading || recommendations.length === 0) return null;

  return (
    <section className={`py-16 ${className}`}>
      <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-[var(--secondary)]/30 p-2 rounded-xl">
            <Sparkles className="text-[var(--primary)]" size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
            {title}
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
         {recommendations.map((product, idx) => (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
         ))}
      </div>
    </section>
  );
};

export default RecommendedProducts;
