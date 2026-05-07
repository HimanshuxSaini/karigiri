import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCartStore, useWishlistStore, useAuthStore } from '../store/useStore';
import { ShoppingBag, Heart, Star, Truck, RotateCcw, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchProductById } from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isAdmin = user?.email === 'himanshu0481@gmail.com' || user?.email === 'admin@karigiri.com';

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('One Size');
      }
    }
  }, [product]);

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        // Try Firestore first
        const data = await fetchProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Product fetch failed:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500 font-bold">Product not found.</p>
    </div>
  );

  const isWishlisted = isInWishlist(product._id || product.id);

  const optimizeImage = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_800,q_auto:eco,f_auto/');
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-32 pb-44 md:pb-24 max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Image Gallery */}
          <div className="lg:w-3/5">
            <div className="flex lg:grid lg:grid-cols-2 gap-4 overflow-x-auto snap-x no-scrollbar mask-fade-right -mx-4 px-4 md:mx-0 md:px-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[85vw] md:min-w-0 aspect-[3/4] bg-gray-50 flex items-center justify-center rounded overflow-hidden snap-center">
                  <motion.img
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                    src={optimizeImage(product.image)} className="max-w-full max-h-full object-contain transition-all duration-700 hover:scale-110" alt={`Product ${i}`}
                    loading={i === 1 ? "eager" : "lazy"}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-2/5">
            <div className="flex justify-between items-start mt-8 md:mt-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">{product.brand}</h2>
                <h3 className="text-lg md:text-xl text-slate-500 mb-4">{product.name}</h3>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  state={{ editProduct: product }}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                >
                  <Edit3 size={12} />
                  <span>Edit</span>
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-2 border rounded p-2 w-fit mb-6">
              <span className="font-bold border-r pr-2 flex items-center space-x-1">
                <span>4.5</span>
                <Star size={16} className="fill-green-600 text-green-600" />
              </span>
              <span className="text-slate-400 pl-1 text-sm font-bold">2.4k Ratings</span>
            </div>

            <hr className="mb-6" />

            <div className="flex items-baseline space-x-4 mb-8">
              <span className="text-3xl font-black text-slate-900">₹{(product.price || 0).toLocaleString('en-IN')}</span>
              <span className="text-xl text-slate-400 line-through">₹{((product.price || 0) + 1000).toLocaleString('en-IN')}</span>
              <span className="text-xl text-[var(--primary)] font-bold">(₹1,000 OFF)</span>
            </div>

            <p className="text-[var(--accent)] font-black text-sm mb-8 uppercase tracking-wider">inclusive of all taxes</p>

            {product.sizeType !== 'none' && product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-sm uppercase tracking-widest">Select Size</h4>
                  <button className="text-[var(--primary)] font-black text-xs uppercase hover:underline">Size Chart ›</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-12 px-4 rounded-full border-2 font-bold text-sm transition-all flex items-center justify-center ${selectedSize === size
                          ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--secondary)]/20'
                          : 'border-slate-200 text-slate-900 hover:border-slate-900'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="hidden md:flex space-x-4 mb-12">
              <button
                onClick={() => addItem({ ...product, size: selectedSize })}
                className="flex-grow bg-[var(--primary)] text-white py-5 rounded font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:opacity-90 shadow-xl"
              >
                <ShoppingBag size={20} />
                <span>Add to Bag</span>
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`px-8 py-5 border-2 rounded font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all ${isWishlisted ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-slate-200 text-slate-900 hover:border-slate-900'
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
                  <h5 className="font-bold text-sm">
                    {product.deliveryCharge > 0 ? `Delivery Charge: ₹${product.deliveryCharge}` : 'Free Delivery Pan-India'}
                  </h5>
                  <p className="text-xs text-slate-400">
                    {product.deliveryCharge > 0 ? 'Individual delivery charge applicable for this handcrafted product' : 'On all prepaid orders over ₹1,000'}
                  </p>
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

      {/* Mobile Sticky Actions */}
      <div className="md:hidden fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex items-center space-x-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => toggleWishlist(product)}
          className={`h-14 w-14 shrink-0 border rounded-xl flex items-center justify-center transition-all ${isWishlisted ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-gray-200 text-gray-400'
            }`}
        >
          <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <button
          onClick={() => addItem({ ...product, size: selectedSize })}
          className="min-h-14 flex-grow bg-[var(--primary)] px-4 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg"
        >
          <ShoppingBag size={20} />
          <span className="whitespace-nowrap">Add to Bag</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;

