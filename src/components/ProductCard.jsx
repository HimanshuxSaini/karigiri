import { ShoppingCart, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore, useWishlistStore } from '../store/useStore';

const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isWishlisted = isInWishlist(product.id);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white overflow-hidden group h-full flex flex-col relative rounded-sm border border-transparent hover:border-gray-100 transition-all"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Rating badge */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded flex items-center space-x-1 text-[8px] md:text-[10px] font-bold">
           <span>4.2</span>
           <Star size={10} className="fill-orange-400 text-orange-400" />
           <span className="text-gray-400 border-l pl-1">1.2k</span>
        </div>

        {/* Add to Wishlist Button */}
        <button 
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white rounded-full shadow-sm transition-all duration-300 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className="md:w-[18px] md:h-[18px]" />
        </button>

        {/* Add to Cart - Visible on hover (Desktop) and always available (Mobile via a small icon or similar) */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur lg:block hidden">
           <button 
              onClick={(e) => { e.preventDefault(); addItem(product); }}
              className="w-full py-2 bg-[var(--primary)] text-white text-[10px] md:text-sm font-bold rounded uppercase tracking-wider"
           >
             Add to Bag
           </button>
        </div>
        
        {/* Mobile Quick Add */}
        <button 
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="lg:hidden absolute bottom-2 right-2 p-2 bg-[var(--primary)] text-white rounded-full shadow-lg"
        >
          <ShoppingCart size={16} />
        </button>
      </Link>
      
      <div className="py-2 md:py-4 px-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-[10px] md:text-sm text-gray-900 truncate">{product.brand || "KARIGIRI"}</h3>
          <p className="text-[10px] md:text-xs text-gray-500 truncate mb-1">{product.name}</p>
        </Link>
        <div className="flex flex-wrap items-center gap-1 md:gap-2">
          <span className="font-bold text-xs md:text-sm text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          <span className="text-[8px] md:text-[10px] text-gray-400 line-through">₹{(product.price + 500).toLocaleString('en-IN')}</span>
          <span className="text-[8px] md:text-[10px] text-orange-400 font-bold whitespace-nowrap">(40% OFF)</span>
        </div>
      </div>
    </motion.div>
  );
};


export default ProductCard;
