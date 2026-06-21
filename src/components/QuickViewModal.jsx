import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../store/useStore';
import { getOptimizedImage } from '../utils/imageHelpers';
import { WHATSAPP } from '../config/constants';

const QuickViewModal = ({ product, onClose }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.length ? product.sizes[0] : 'One Size'
  );
  const [added, setAdded] = useState(false);

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);
  const isOutOfStock = product.inStock === false;

  const handleAddToBag = () => {
    if (isOutOfStock) return;
    addItem({ ...product, size: selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWhatsApp = () => {
    const priceText = product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'N/A';
    const message = `Hello PrathamKarigiri!\n\nI am interested in:\n- *${product.name}*\n- Price: *${priceText}*\n- Size: *${selectedSize}*\n\nPlease share more details!`;
    window.open(`${WHATSAPP.chatUrl}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick View</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-2/5 aspect-square bg-gray-50 flex items-center justify-center p-6">
              <img
                src={getOptimizedImage(product.image, { width: 400, quality: 'auto:eco' })}
                alt={product.name}
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
            </div>

            {/* Details */}
            <div className="md:w-3/5 p-5 md:p-6 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">
                  {product.brand || 'PrathamKarigiri'}
                </p>
                <h3 className="text-lg font-black text-slate-900 leading-snug">{product.name}</h3>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900">
                  ₹{(product.price || 0).toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-emerald-600 font-black">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Size selector */}
              {product.sizeType !== 'none' && product.sizes?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 h-10 px-3 rounded-full border-2 text-xs font-bold transition-all ${
                          selectedSize === size
                            ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--secondary)]/20'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-auto">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={isOutOfStock}
                  onClick={handleAddToBag}
                  className={`flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 hover:brightness-110'
                  }`}
                >
                  {added ? <CheckCircle size={16} /> : <ShoppingBag size={16} strokeWidth={2.5} />}
                  <span>{isOutOfStock ? 'Out of Stock' : added ? 'Added!' : 'Add to Bag'}</span>
                </motion.button>

                <button
                  onClick={handleWhatsApp}
                  className="h-12 w-12 rounded-xl bg-[#22C55E] text-white flex items-center justify-center shadow-lg hover:bg-[#16a34a] transition-colors"
                >
                  <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isWishlisted
                      ? 'border-rose-400 text-rose-500 bg-rose-50'
                      : 'border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
                </button>
              </div>

              {product.description && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
