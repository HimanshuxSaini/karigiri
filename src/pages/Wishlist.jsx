import Navbar from '../components/Navbar';
import { useWishlistStore } from '../store/useStore';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist } = useWishlistStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-48 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">YOUR WISHLIST IS EMPTY</h2>
          <p className="text-gray-500 mb-8">Add items that you like to your wishlist. Review them anytime and easily move them to bag.</p>
          <img src="https://constant.myntassets.com/checkout/assets/img/empty-bag.webp" alt="Empty Wishlist" className="w-48 mb-10 opacity-20" />
          <Link to="/shop" className="px-12 py-4 border-2 border-gray-300 font-bold text-gray-700 hover:border-gray-800 transition-all rounded">CONTINUE SHOPPING</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-xl font-bold text-gray-800">My Wishlist <span className="font-normal text-gray-500">({wishlist.length} Items)</span></h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {wishlist.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
