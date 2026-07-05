import { useState, memo } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore, useWishlistStore } from '../store/useStore';
import { getOptimizedImage } from '../utils/imageHelpers';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product, priority = false }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [showQuickView, setShowQuickView] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);
  const isOutOfStock = product.inStock === false;

  // Discount calculation
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Badge — 'new' | 'bestseller' (set by admin)
  const badge = product.badge?.toLowerCase();

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className={`bg-white overflow-hidden group h-full flex flex-col relative rounded-sm border border-transparent hover:border-gray-100 transition-all ${isOutOfStock ? 'opacity-80' : ''}`}
      >
        {/* Image container */}
        <Link to={`/product/${productId}`} className="relative aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
          <img
            src={getOptimizedImage(product.image, { width: 400, quality: 'auto:eco' })}
            alt={product.name}
            loading={priority ? undefined : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.src = '/placeholder.png';
            }}
          />

          {/* Badges Container (Top Left) */}
          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1.5">
            {/* Out of Stock badge */}
            {isOutOfStock ? (
              <div className="bg-red-600/95 backdrop-blur-sm text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                Out of Stock
              </div>
            ) : hasDiscount ? (
              <div className="bg-emerald-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                {discountPct}% OFF
              </div>
            ) : null}

            {/* New / Bestseller badge */}
            {badge === 'new' && (
              <div className="bg-sky-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                New
              </div>
            )}
            {badge === 'bestseller' && (
              <div className="bg-amber-500 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm">
                🔥 Best
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white rounded-full shadow-sm transition-all duration-300 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className="md:w-[18px] md:h-[18px]" />
          </button>

          {/* Quick View button — visible on hover (desktop) */}
          <button
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            className="hidden lg:flex absolute bottom-24 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 items-center gap-1.5 bg-white/95 backdrop-blur z-20 text-slate-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-full shadow-md hover:bg-white"
          >
            <Eye size={12} strokeWidth={2.5} />
            Quick View
          </button>

          {/* Add to Cart hover panel (Desktop) */}
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur lg:block hidden">
            <button
              disabled={isOutOfStock}
              onClick={(e) => { e.preventDefault(); if (!isOutOfStock) addItem(product); }}
              className={`w-full py-2 text-[10px] md:text-sm font-bold rounded uppercase tracking-wider transition-colors ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[var(--primary)] text-white hover:opacity-90'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>
          </div>

          {/* Mobile Quick Add */}
          {!isOutOfStock && (
            <button
              onClick={(e) => { e.preventDefault(); addItem(product); }}
              className="lg:hidden absolute bottom-2 right-2 p-2 bg-[var(--primary)] text-white rounded-full shadow-lg"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </Link>

        <div className="py-2 md:py-4 px-1">
          <Link to={`/product/${productId}`}>
            <h3 className="font-bold text-[10px] md:text-sm text-gray-900 truncate">{product.brand || 'PrathamKarigiri'}</h3>
            <p className="text-[10px] md:text-xs text-gray-500 truncate mb-1">{product.name}</p>
          </Link>
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <span className="font-bold text-xs md:text-sm text-gray-900">₹{(product.price || 0).toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <span className="text-[8px] md:text-[10px] text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {hasDiscount && (
              <span className="text-[8px] md:text-[10px] text-emerald-500 font-bold">({discountPct}% OFF)</span>
            )}
            {!hasDiscount && (
              <span className="text-[8px] md:text-[10px] text-gray-400 line-through">₹{((product.price || 0) + 500).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
};

export default memo(ProductCard);
