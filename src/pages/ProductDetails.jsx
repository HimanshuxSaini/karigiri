import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useCartStore, useWishlistStore } from '../store/useStore';
import { ShoppingBag, Heart, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { allProducts } from '../data/products';

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('M');
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const product = allProducts.find(p => p.id === parseInt(id)) || allProducts[0];
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Image Gallery */}
          <div className="lg:w-3/5 grid grid-cols-2 gap-4">
             <motion.img 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               src={product.image} className="w-full h-auto object-cover rounded shadow-sm" alt="Product 1" 
             />
             <motion.img 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
               src={product.image} className="w-full h-auto object-cover rounded shadow-sm brightness-95" alt="Product 2" 
             />
             <motion.img 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
               src={product.image} className="w-full h-auto object-cover rounded shadow-sm contrast-110" alt="Product 3" 
             />
             <motion.img 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
               src={product.image} className="w-full h-auto object-cover rounded shadow-sm saturate-50" alt="Product 4" 
             />
          </div>

          {/* Product Info */}
          <div className="lg:w-2/5">
            <h2 className="text-2xl font-black text-slate-900 mb-1">{product.brand}</h2>
            <h3 className="text-xl text-slate-500 mb-4">{product.name}</h3>

            <div className="flex items-center space-x-2 border rounded p-2 w-fit mb-6">
               <span className="font-bold border-r pr-2 flex items-center space-x-1">
                 <span>4.5</span>
                 <Star size={16} className="fill-green-600 text-green-600" />
               </span>
               <span className="text-slate-400 pl-1 text-sm font-bold">2.4k Ratings</span>
            </div>

            <hr className="mb-6" />

            <div className="flex items-baseline space-x-4 mb-8">
               <span className="text-3xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
               <span className="text-xl text-slate-400 line-through">₹{(product.price + 1000).toLocaleString('en-IN')}</span>
               <span className="text-xl text-[var(--primary)] font-bold">(₹1,000 OFF)</span>
            </div>

            <p className="text-[var(--accent)] font-black text-sm mb-8 uppercase tracking-wider">inclusive of all taxes</p>

            <div className="mb-10">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-sm uppercase tracking-widest">Select Size</h4>
                  <button className="text-[var(--primary)] font-black text-xs uppercase hover:underline">Size Chart ›</button>
               </div>
               <div className="flex space-x-4">
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border-2 font-bold text-sm transition-all flex items-center justify-center ${
                        selectedSize === size 
                        ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--secondary)]/20' 
                        : 'border-slate-200 text-slate-900 hover:border-slate-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex space-x-4 mb-12">
               <button 
                 onClick={() => addItem(product)}
                 className="flex-grow bg-[var(--primary)] text-white py-5 rounded font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:opacity-90 shadow-xl"
               >
                 <ShoppingBag size={20} />
                 <span>Add to Bag</span>
               </button>
               <button 
                 onClick={() => toggleWishlist(product)}
                 className={`px-8 py-5 border-2 rounded font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${
                   isWishlisted ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-slate-200 text-slate-900 hover:border-slate-900'
                 }`}
               >
                 <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                 <span>Wishlist</span>
               </button>
            </div>

            <div className="space-y-6 mb-12">
               <div className="flex items-start space-x-4">
                  <Truck className="text-slate-400" size={24} />
                  <div>
                    <h5 className="font-bold text-sm">Free Delivery Pan-India</h5>
                    <p className="text-xs text-slate-400">On all prepaid orders over ₹1,000</p>
                  </div>
               </div>
               <div className="flex items-start space-x-4">
                  <RotateCcw className="text-slate-400" size={24} />
                  <div>
                    <h5 className="font-bold text-sm">30 Days Return</h5>
                    <p className="text-xs text-slate-400">Easy returns and exchanges</p>
                  </div>
               </div>
            </div>

            <hr className="mb-8" />
            
            <div className="space-y-8">
               <div>
                  <h4 className="font-black text-sm uppercase tracking-widest mb-4">Product Details</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>
               </div>

               <div className="grid grid-cols-2 gap-y-6">
                  <div>
                     <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Material</h4>
                     <p className="text-sm font-bold text-slate-800">100% Merino Wool</p>
                  </div>
                  <div>
                     <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Fit</h4>
                     <p className="text-sm font-bold text-slate-800">Regular Fit</p>
                  </div>
                  <div>
                     <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Pattern</h4>
                     <p className="text-sm font-bold text-slate-800">Solid / Handcrafted</p>
                  </div>
                  <div>
                     <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Occasion</h4>
                     <p className="text-sm font-bold text-slate-800">Casual / Winter Wear</p>
                  </div>
               </div>

                <div className="bg-[var(--background)] p-6 rounded">
                  <h4 className="font-black text-sm uppercase tracking-widest mb-4">Care Instructions</h4>
                  <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                     <li>Dry Clean only for long-lasting softness.</li>
                     <li>Do not bleach or tumble dry.</li>
                     <li>Store flat; avoid hanging to maintain shape.</li>
                     <li>Iron at low temperature if necessary.</li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
