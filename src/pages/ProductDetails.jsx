import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useCartStore, useWishlistStore, useAuthStore, useActivityStore } from '../store/useStore';
import { ShoppingBag, Heart, Truck, RotateCcw, Edit3, MessageCircle, Share2, Copy, Check, Star, ChevronRight, ShieldCheck, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductById, fetchReviews, addReview } from '../services/api';
import RecommendedProducts from '../components/RecommendedProducts';
import SimilarProducts from '../components/SimilarProducts';
import { isAdminEmail, WHATSAPP } from '../config/constants';
import { trackViewItem, trackAddToCart, trackAddToWishlist } from '../utils/analytics';


const FREE_DELIVERY_THRESHOLD = 1000;

// Star rating component
const StarRating = ({ value, onChange, size = 20 }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange && onChange(star)}
        className={`transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
        />
      </button>
    ))}
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { trackProductVisit } = useActivityStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [similarIds, setSimilarIds] = useState([]);
  // Share
  const [copied, setCopied] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);


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
          trackViewItem({ product: data });
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
    if (id) {
      trackProductVisit(id);
    }
  }, [id, trackProductVisit]);

  // Stable callback — must be defined before any early returns (Rules of Hooks)
  const handleSimilarLoaded = useCallback((ids) => {
    setSimilarIds(ids);
  }, []);



  // Load reviews
  useEffect(() => {
    const pId = product?._id || product?.id;
    if (!pId) return;
    setReviewsLoading(true);
    fetchReviews(pId).then(data => {
      setReviews(data);
      setReviewsLoading(false);
    });
  }, [product]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-32 pb-24 max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Image Gallery Skeleton */}
          <div className="lg:w-3/5 space-y-4">
            <div className="w-full aspect-[3/4] shimmer-bg rounded-2xl"></div>
            <div className="flex gap-4 justify-center lg:justify-start">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 h-24 shimmer-bg rounded-xl"></div>
              ))}
            </div>
          </div>
          {/* Info Skeleton */}
          <div className="lg:w-2/5 space-y-6 pt-8 lg:pt-0">
            <div className="h-10 shimmer-bg rounded-lg w-1/3 animate-pulse"></div>
            <div className="h-6 shimmer-bg rounded-lg w-2/3 animate-pulse"></div>
            <div className="h-12 shimmer-bg rounded-lg w-1/2 animate-pulse"></div>
            <div className="h-48 shimmer-bg rounded-2xl w-full animate-pulse"></div>
            <div className="h-14 shimmer-bg rounded-xl w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500 font-bold">Product not found.</p>
    </div>
  );

  const isWishlisted = isInWishlist(product._id || product.id);
  const isOutOfStock = product.inStock === false;
  const isAdmin = isAdminEmail(user?.email);
  const productId = product._id || product.id;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem({ ...product, size: selectedSize });
      trackAddToCart({ product, quantity: 1 });
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (!isWishlisted) {
      trackAddToWishlist({ product });
    }
  };


  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const productUrl = window.location.href;
    const priceText = product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'N/A';
    const message = `Hello PrathamKarigiri!\n\nI am interested in this beautiful piece:\n- Product: *${product.name}*\n- Price: *${priceText}*\n- Selected Size: *${selectedSize || 'Standard'}*\n- Link: ${productUrl}\n\nCould you please help me with more details?`;
    window.open(`${WHATSAPP.chatUrl}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = await addReview({ productId, name: reviewName || 'Anonymous', rating: reviewRating, comment: reviewComment });
      setReviews(prev => [{ ...newReview, createdAt: { seconds: Date.now() / 1000 } }, ...prev]);
      setReviewComment('');
      setReviewName('');
      setReviewRating(5);
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (_) {}
    setSubmittingReview(false);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const optimizeImage = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_800,q_auto:eco,f_auto/');
    }
    return url;
  };

  const seoTitle = `${product.name} | Pratham Karigiri`;
  const seoDescription = product.description ? product.description.slice(0, 160) : `Buy ${product.name} online at Pratham Karigiri. Authentic handcrafted woolen products.`;
  const schemaImage = optimizeImage(product.image ? [product.image, ...(product.images || [])].filter(Boolean)[0] : 'https://prathamkarigiri.in/og-image.png');
  
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": schemaImage,
    "description": product.description || seoDescription,
    "sku": product._id || product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price || 0,
      "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  if (avgRating && reviews.length > 0) {
    schemaData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": reviews.length
    };
  }


  return (
    <div className="min-h-screen bg-white">
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={schemaImage} />
      <meta property="og:url" content={window.location.href} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={schemaImage} />
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>

      <Navbar />



      <div className="pt-32 pb-44 md:pb-24 max-w-[1440px] mx-auto px-4 md:px-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${product.category || ''}`} className="hover:text-slate-700 transition-colors capitalize">{product.category || 'Shop'}</Link>
          {product.subCategory && (
            <>
              <ChevronRight size={12} />
              <Link to={`/shop?category=${product.category}&sub=${product.subCategory}`} className="hover:text-slate-700 transition-colors capitalize">{product.subCategory}</Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-slate-800 normal-case font-black truncate max-w-[120px] md:max-w-xs">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Image Gallery */}
          <div className="lg:w-3/5">
            {/* Featured Image */}
            <div
              className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group"
            >
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={optimizeImage(product.image ? [product.image, ...(product.images || [])].filter(Boolean)[activeImageIndex] : '')}
                className={`max-w-full max-h-full object-contain ${isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''}`}
                alt={product.name}
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  e.target.src = "/placeholder.png";
                }}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-red-600/95 backdrop-blur-md px-8 py-3 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-sm md:text-base shadow-2xl">
                    Out of Stock
                  </div>
                </div>
              )}
            </div>

            {/* Sub Images / Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar py-2 justify-center lg:justify-start">
                {[product.image, ...(product.images || [])].filter(Boolean).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center ${
                      activeImageIndex === idx
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/10 scale-105 shadow-md'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={optimizeImage(img)}
                      className="max-w-full max-h-full object-contain p-1"
                      alt={`Thumbnail ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-2/5">
            <div className="flex justify-between items-start mt-8 md:mt-0">
              <div className="flex-1 min-w-0 pr-3">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-1">{product.brand}</h2>
                <h3 className="text-lg md:text-xl text-slate-500 mb-4">{product.name}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all"
                  title="Share product"
                >
                  {copied ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
                </button>
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
            </div>

            <hr className="mb-6" />

            <div className="flex items-baseline space-x-4 mb-8">
              <span className="text-3xl font-black text-slate-900">₹{(product.price || 0).toLocaleString('en-IN')}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xl text-[var(--primary)] font-bold">({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)</span>
                </>
              )}
            </div>

            <p className="text-[var(--accent)] font-black text-sm uppercase tracking-wider">inclusive of all taxes</p>

            {/* Low Stock Alert */}
            {product.stockCount !== undefined && product.stockCount > 0 && product.stockCount < 10 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-pulse">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <p className="text-xs font-black uppercase tracking-wider">
                  Only {product.stockCount} left in stock - Hurry up!
                </p>
              </div>
            )}

            {/* Authenticity badge */}
            <div className="flex items-center gap-3 my-5 py-3 px-4 bg-amber-50 border border-amber-100 rounded-xl">
              <ShieldCheck size={18} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Authenticity Guaranteed</p>
                <p className="text-[9px] text-amber-600/80 font-medium">100% Handcrafted · Verified Artisan · PrathamKarigiri Certified</p>
              </div>
              <Scissors size={15} className="text-amber-400 ml-auto shrink-0" />
            </div>

            {product.sizeType !== 'none' && product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-sm uppercase tracking-widest">Select Size</h4>
                  <button onClick={() => setShowSizeChart(true)} className="text-[var(--primary)] font-black text-xs uppercase hover:underline">Size Chart ›</button>
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

            {/* Action Buttons */}
            <div className="hidden md:flex items-stretch gap-3 mb-12">
              {/* Add to Bag — primary CTA */}
              <motion.button
                whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
                whileTap={!isOutOfStock ? { scale: 0.97 } : {}}
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 h-14 rounded-xl font-black text-[11px] uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 transition-all duration-200 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:brightness-110'
                }`}
              >
                <ShoppingBag size={17} strokeWidth={2.5} />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
              </motion.button>

              {/* WhatsApp Enquire */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWhatsAppEnquiry}
                className="h-14 px-6 rounded-xl bg-[#22C55E] text-white font-black text-[11px] uppercase tracking-[0.18em] flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:bg-[#16a34a] hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200"
              >
                <MessageCircle size={17} strokeWidth={2.5} fill="currentColor" />
                <span>Enquire</span>
              </motion.button>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleToggleWishlist}
                className={`h-14 px-6 rounded-xl border-2 font-black text-[11px] uppercase tracking-[0.18em] flex items-center gap-2.5 transition-all duration-200 ${
                  isWishlisted
                    ? 'border-rose-400 text-rose-500 bg-rose-50 shadow-md shadow-rose-200'
                    : 'border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <Heart size={17} strokeWidth={2.5} fill={isWishlisted ? 'currentColor' : 'none'} />
                <span>Wishlist</span>
              </motion.button>
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
                  <h5 className="font-bold text-sm">Easy 7-Day Returns & Exchange</h5>
                  <p className="text-xs text-slate-400">Hassle-free return policy</p>
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
                  <p className="text-sm font-bold text-slate-800">{product.material || '100% Handcrafted Wool'}</p>
                </div>
                <div>
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Category</h4>
                  <p className="text-sm font-bold text-slate-800">{product.category || 'Handmade'}</p>
                </div>
                <div>
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Brand</h4>
                  <p className="text-sm font-bold text-slate-800">{product.brand || 'PrathamKarigiri'}</p>
                </div>
                <div>
                  <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Availability</h4>
                  <p className={`text-sm font-bold ${product.inStock !== false ? (product.stockCount !== undefined && product.stockCount < 10 ? 'text-red-500' : 'text-emerald-600') : 'text-red-500'}`}>
                    {product.inStock !== false 
                      ? (product.stockCount !== undefined && product.stockCount < 10 && product.stockCount > 0 ? `Only ${product.stockCount} Left` : 'In Stock') 
                      : 'Out of Stock'}
                  </p>
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

      {/* Similar Products Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-16">
        <SimilarProducts
          product={product}
          limit={4}
          onLoaded={handleSimilarLoaded}
        />
      </div>

      {/* Reviews Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-16 border-t border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Customer Reviews</h2>
            {avgRating && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating value={Math.round(avgRating)} size={14} />
                <span className="text-sm font-black text-slate-700">{avgRating}</span>
                <span className="text-xs text-slate-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-slate-50 rounded-2xl p-5 md:p-6 mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Write a Review</h3>
          {reviewSubmitted ? (
            <div className="flex items-center gap-3 text-emerald-600 py-4">
              <Check size={20} className="shrink-0" />
              <p className="font-bold text-sm">Thank you! Your review has been submitted.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] bg-white"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 shrink-0">Rating</span>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
              </div>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                required
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] resize-none bg-white"
              />
              <button
                type="submit"
                disabled={submittingReview || !reviewComment.trim()}
                className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}
        </div>

        {/* Review list */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />)}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-black text-sm text-slate-900">{r.name || 'Anonymous'}</p>
                    <StarRating value={r.rating} size={13} />
                  </div>
                  {r.createdAt?.seconds && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Products Section */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 pb-24 md:pb-32 pt-4">
        <RecommendedProducts 
          title="You May Also Like"
          excludeProductIds={[product._id || product.id, ...similarIds]}
          limit={10}
        />
      </div>

      {/* Mobile Sticky Actions — improved bar with labels */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 py-2 pb-[calc(env(safe-area-inset-bottom,6px)+6px)] z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch gap-2">
          {/* Wishlist */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`flex flex-col items-center justify-center gap-0.5 w-14 rounded-xl py-1.5 border transition-all ${isWishlisted ? 'border-pink-400 text-pink-500 bg-pink-50' : 'border-gray-200 text-gray-400 bg-white'}`}
          >
            <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
            <span className="text-[7px] font-black uppercase tracking-tight">{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>
          {/* Enquire */}
          <button
            onClick={handleWhatsAppEnquiry}
            className="flex flex-col items-center justify-center gap-0.5 w-14 rounded-xl py-1.5 bg-[#25D366] text-white shadow-md"
          >
            <MessageCircle size={17} fill="currentColor" strokeWidth={0} />
            <span className="text-[7px] font-black uppercase tracking-tight">Enquire</span>
          </button>
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-0.5 w-14 rounded-xl py-1.5 border border-gray-200 text-gray-500 bg-white"
          >
            {copied ? <Check size={17} className="text-emerald-500" /> : <Share2 size={17} />}
            <span className="text-[7px] font-black uppercase tracking-tight">{copied ? 'Copied!' : 'Share'}</span>
          </button>
          {/* Add to Bag */}
          <button
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addItem({ ...product, size: selectedSize })}
            className={`flex-1 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--primary)] text-white hover:brightness-110'
            }`}
          >
            <ShoppingBag size={16} strokeWidth={2.5} />
            <span className="whitespace-nowrap">{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <button 
              onClick={() => setShowSizeChart(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-900 transition-colors w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl md:text-2xl font-black text-[var(--primary)] uppercase tracking-tight mb-2">Size Chart</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6">Standard size measurements for our exquisite hand-knitted & woolen apparel.</p>
            
            <div className="overflow-x-auto border border-slate-100 rounded-2xl mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--secondary)]/20 border-b border-slate-100">
                    <th className="p-4 font-black text-xs uppercase tracking-widest text-[var(--primary)]">Size</th>
                    <th className="p-4 font-black text-xs uppercase tracking-widest text-[var(--primary)]">Bust (inches)</th>
                    <th className="p-4 font-black text-xs uppercase tracking-widest text-[var(--primary)]">Waist (inches)</th>
                    <th className="p-4 font-black text-xs uppercase tracking-widest text-[var(--primary)]">Length (inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <td className="p-4 font-bold">S</td>
                    <td className="p-4 text-slate-600">34 - 36</td>
                    <td className="p-4 text-slate-600">28 - 30</td>
                    <td className="p-4 text-slate-600">26</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">M</td>
                    <td className="p-4 text-slate-600">38 - 40</td>
                    <td className="p-4 text-slate-600">32 - 34</td>
                    <td className="p-4 text-slate-600">27</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">L</td>
                    <td className="p-4 text-slate-600">42 - 44</td>
                    <td className="p-4 text-slate-600">36 - 38</td>
                    <td className="p-4 text-slate-600">28</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">XL</td>
                    <td className="p-4 text-slate-600">46 - 48</td>
                    <td className="p-4 text-slate-600">40 - 42</td>
                    <td className="p-4 text-slate-600">29</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">XXL</td>
                    <td className="p-4 text-slate-600">50 - 52</td>
                    <td className="p-4 text-slate-600">44 - 46</td>
                    <td className="p-4 text-slate-600">30</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-[var(--secondary)]/10 p-5 rounded-2xl border border-[var(--secondary)]/30">
              <h4 className="font-black text-xs uppercase tracking-widest text-[var(--primary)] mb-3">How to Measure</h4>
              <div className="space-y-3 text-xs text-slate-600">
                <p><strong className="text-[var(--primary)] font-bold">1. Bust:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                <p><strong className="text-[var(--primary)] font-bold">2. Waist:</strong> Measure around the narrowest part of your waistline, keeping the tape comfortable.</p>
                <p><strong className="text-[var(--primary)] font-bold">3. Length:</strong> Measure from the highest point of the shoulder down to the hem.</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setShowSizeChart(false)}
                className="bg-[var(--primary)] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg"
              >
                Close Chart
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

