import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FAQ from '../components/FAQ';
import { fetchProducts, fetchReels, fetchFlashSale, fetchReelsConfig } from '../services/api';
import { categoryStructure } from '../data/categories';
import CustomizationSection from '../components/CustomizationSection';
import { getOptimizedImage } from '../utils/imageHelpers';
import { trackPageView, trackViewItemList } from '../utils/analytics';
import SEO from '../components/SEO';
import { BRAND } from '../config/constants';


const Home = () => {
  const [products, setProducts] = useState([]);

  const [dealsProducts, setDealsProducts] = useState([]);
  const [reels, setReels] = useState([]);
  const [reelsConfig, setReelsConfig] = useState({ isVisible: true });
  const [saleConfig, setSaleConfig] = useState({ isActive: false });
  const [loading, setLoading] = useState(true);
  const categories = ['All', ...Object.keys(categoryStructure).filter(cat => cat !== 'Yarn')];


  useEffect(() => {
    trackPageView('Home');
    
    const getFeaturedProducts = async () => {
      try {
        const data = await fetchProducts();
        if (Array.isArray(data) && data.length > 0) {
          // Filter out 'Yarn' category from the main page as requested
          const filteredData = data.filter(p => p?.category !== 'Yarn');

          // Randomly shuffle product array on each load to display different items
          const shuffledData = [...filteredData].sort(() => Math.random() - 0.5);

          // Logic for the top "Deals" section specifically requesting real products like Bouquet, Kids, Men under 999
          const budgetData = shuffledData.filter(p => Number(p.price) < 1000); // Filter under 1000 (or 999)
          
          const reqDeals = [
            ...budgetData.filter(p => p?.category === 'Bouquet').slice(0, 1),
            ...budgetData.filter(p => p?.category === 'Kids').slice(0, 1),
            ...budgetData.filter(p => p?.category === 'Men').slice(0, 1),
          ];
          
          // Fill remaining up to 4 with other items strictly from budgetData
          const filledDeals = [...reqDeals];
          const otherBudgets = budgetData.filter(p => !filledDeals.find(d => d._id === p._id));
          
          if (filledDeals.length < 4) {
            filledDeals.push(...otherBudgets.slice(0, 4 - filledDeals.length));
          }

          setDealsProducts(filledDeals);

          // Filter products for featured section (1 random from each major category)
          const featured = [
            ...shuffledData.filter(p => p?.category === 'Women').slice(0, 1),
            ...shuffledData.filter(p => p?.category === 'Kids').slice(0, 1),
            ...shuffledData.filter(p => p?.category === 'Bouquet').slice(0, 1),
            ...shuffledData.filter(p => p?.category === 'Laddu Gopal').slice(0, 1),
          ];
          
          // Fill if total items chosen are still low
          const remainingFeatured = shuffledData.filter(p => !featured.find(f => f._id === p._id)).slice(0, Math.max(0, 8 - featured.length));
          const finalProducts = [...featured, ...remainingFeatured];
          setProducts(finalProducts);

          // Track item lists for GA4 Ecommerce
          trackViewItemList({
            item_list_id: 'home_deals',
            item_list_name: 'Deals Under 999',
            items: filledDeals
          });
          trackViewItemList({
            item_list_id: 'home_featured',
            item_list_name: 'Featured Products',
            items: finalProducts
          });

        } else {
          setProducts([]);
          setDealsProducts([]); 
        }
      } catch (err) {
        console.error('Failed to fetch home products:', err);
        setProducts([]);
        setDealsProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const getReels = async () => {
      try {
        const data = await fetchReels();
        if (data && data.length > 0) {
          setReels(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      } catch (err) {
        console.error('Failed to fetch reels:', err);
      }
    };

    const getSale = async () => {
      try {
        const data = await fetchFlashSale();
        if (data) {
          if (data.isActive) {
            const isExpired = !data.endTime || new Date(data.endTime).getTime() <= Date.now();
            if (isExpired) data.isActive = false;
          }
          setSaleConfig(data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const getReelsConfig = async () => {
      try {
        const data = await fetchReelsConfig();
        if (data) setReelsConfig(data);
      } catch (err) {
        console.error('Failed to fetch reels config:', err);
      }
    };

    getFeaturedProducts();
    getReels();
    getSale();
    getReelsConfig();


  }, []);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PrathamKarigiri",
    "url": "https://www.prathamkarigiri.in",
    "logo": "https://www.prathamkarigiri.in/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9999999999", // Replace with real if available
      "contactType": "customer service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PrathamKarigiri",
    "url": "https://www.prathamkarigiri.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.prathamkarigiri.in/shop?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <SEO 
        title="Premium Handcrafted Woolen Masterpieces"
        description="Discover PrathamKarigiri's premium handcrafted woolen masterpieces. Ethically sourced, traditionally knitted, and delivered directly to you."
        canonicalUrl="https://www.prathamkarigiri.in/"
        schema={[organizationSchema, websiteSchema]}
      />
      <Navbar />
      <Hero />

      {/* Mobile Category Pills - Quick Navigation */}
      <div className="md:hidden sticky top-14 z-40 bg-white shadow-sm border-b border-gray-50 overflow-hidden">
        <div className="flex overflow-x-auto py-4 px-4 space-x-3 no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={cat === 'All' ? '/shop' : `/shop?category=${cat}`}
              className="flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 app-tab-inactive"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Flash Sale Countdown */}
      <AnimatePresence>
        {saleConfig?.isActive && (
          <motion.section 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[var(--primary)] text-white py-4 md:py-4 text-center overflow-hidden border-b border-white/10"
          >
            <motion.div
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 px-4"
            >
              <span className="text-[10px] md:text-sm font-black uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2 hidden sm:inline-block"></span>
                {saleConfig.text || 'Flash Sale Ends In'}:
              </span>
              <FlashSaleTimer 
                endTime={saleConfig.endTime} 
                onExpire={() => setSaleConfig(prev => ({ ...prev, isActive: false }))} 
              />
              <div className="flex items-center space-x-3">
                {saleConfig.discountText && (
                  <span className="text-xs font-bold text-yellow-300 hidden md:inline-block border border-yellow-300/30 px-2 py-0.5 rounded bg-yellow-300/10">{saleConfig.discountText}</span>
                )}
                <Link to="/shop" className="bg-white hover:bg-slate-100 text-[var(--primary)] px-6 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm">Shop Now</Link>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Under 999 Deals */}
      <section className="py-12 md:py-20 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <span className="text-orange-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest block mb-1 md:mb-2 text-center sm:text-left">Artisanal Winter Finds</span>
              <h2 className="text-2xl md:text-4xl font-black text-[var(--primary)] tracking-tighter text-center sm:text-left">Woolen Essentials Under ₹999</h2>
            </div>
            <Link to="/shop" className="hidden sm:block text-[10px] md:text-xs font-bold border-b border-[var(--primary)] pb-0.5 md:pb-1 text-[var(--primary)]">Shop The Collection</Link>
          </div>
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-4 md:gap-6 no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth">
            {loading ? (
              [...Array(4)].map((_, i) => (
                 <div key={i} className="min-w-[170px] md:min-w-0 bg-white p-3 rounded-3xl space-y-3">
                    <div className="aspect-[3/4] shimmer-bg rounded-2xl w-full"></div>
                    <div className="h-3 shimmer-bg rounded-md w-3/4"></div>
                    <div className="h-3 shimmer-bg rounded-md w-1/2"></div>
                 </div>
              ))
            ) : dealsProducts.length > 0 ? (
              dealsProducts.map((deal, i) => (
                <motion.div 
                  key={deal._id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="min-w-[170px] lg:min-w-0 snap-center"
                >
                  <Link to={`/product/${deal._id}`} className="group block bg-white p-3 rounded-3xl border border-gray-50 shadow-sm lg:shadow-none lg:border-none lg:bg-transparent h-full">
                    <div className="aspect-[3/4] bg-[var(--secondary)]/20 overflow-hidden rounded-2xl mb-3 md:mb-4 flex items-center justify-center p-4 relative">
                       <img 
                         src={getOptimizedImage(deal.image, { width: 300, quality: 'auto:eco' })} 
                         width="300"
                         height="400"
                         loading={i < 2 ? undefined : "lazy"}
                         fetchPriority={i < 2 ? "high" : "auto"}
                         className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-lg" 
                         alt={deal.name} 
                       />
                       <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] font-black text-[var(--primary)] uppercase">
                          {deal.category}
                       </div>
                    </div>
                    <div className="px-1 text-center sm:text-left">
                      <h4 className="text-[10px] md:text-xs font-bold text-[var(--text-main)] truncate mb-1">{deal.name}</h4>
                      <p className="text-xs md:text-sm font-black text-[var(--primary)]">₹{deal.price.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 text-center py-10 text-gray-400 text-sm">
                No products found. Start uploading!
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] border-2 border-[var(--primary)] px-8 py-3 rounded-full text-[var(--primary)]">Explore All Deals</Link>
          </div>
        </div>
      </section>


      {/* Featured Grid */}
      <section className="py-12 md:py-32 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 text-center md:text-left">
          <div>
            <span className="text-[var(--primary)] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs mb-2 md:mb-4 block">Our Favorites</span>
            <h2 className="text-3xl md:text-5xl font-black text-[var(--primary)]">Woolen Masterpieces</h2>
          </div>
          <Link to="/shop" className="hidden md:block text-xs md:text-sm font-black uppercase border-b-2 border-[var(--primary)] pb-1 text-[var(--primary)] hover:opacity-70 transition-all mt-4 md:mt-0">View All Collections</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] shimmer-bg rounded-3xl w-full"></div>
                <div className="space-y-2 px-1">
                  <div className="h-4 shimmer-bg rounded-md w-3/4"></div>
                  <div className="h-3 shimmer-bg rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-8 md:gap-y-16 no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth">
            {products.map((product, index) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="min-w-[220px] lg:min-w-0 snap-center"
              >
                <ProductCard product={product} priority={index < 4} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link to="/shop" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--primary)] text-white px-10 py-4 rounded-full shadow-lg">View Full Catalog</Link>
        </div>
      </section>





      {/* Instagram Reels Section */}
      {reelsConfig.isVisible && (
        <section className="py-16 md:py-24 px-4 md:px-12 bg-[var(--background)] overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 md:space-x-4 mb-8 md:mb-12">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">PrathamKarigiri in Motion</h2>
            </div>
            <div className="flex space-x-4 md:space-x-6 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth">
              {(reels.length > 0 ? reels : [
                { image: "/shawl.png", tag: "Handmade Shawls", handle: "@prathamkarigiri.in" },
                { image: "/item4.png", tag: "Kids Collection", handle: "@prathamkarigiri.in" },
                { image: "/bag.png", tag: "Crochet Bags", handle: "@prathamkarigiri.in" },
                { image: "/bookey.png", tag: "Floral Bouquet", handle: "@prathamkarigiri.in" },
                { image: "/blanket.png", tag: "Premium Blankets", handle: "@prathamkarigiri.in" }
              ]).map((reel, i) => (
                <a 
                  key={i} 
                  href={BRAND.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${reel.tag} on Instagram`}
                  className="block min-w-[160px] md:min-w-[200px] h-[280px] md:h-[350px] bg-slate-200 rounded-xl relative overflow-hidden flex-shrink-0 group snap-center border border-white/20 shadow-lg cursor-pointer"
                >
                  <div className="absolute inset-0 aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                    <img src={getOptimizedImage(reel.image || reel.img, { width: 300, quality: 'auto:eco' })} width="300" height="400" className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-lg" alt={reel.tag} loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">{reel.tag}</p>
                    <p className="text-[8px] md:text-[10px] font-medium opacity-80">{reel.handle || '@prathamkarigiri.in'}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Artisan Section */}
      <section className="py-16 md:py-32 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-10 md:mb-20">
          <span className="text-[var(--primary)] font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Heritage & Craft</span>
          <h2 className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-4 md:mb-6">Meet the Makers</h2>
          <p className="text-sm md:text-lg text-[var(--text-muted)] italic max-w-2xl mx-auto leading-relaxed">Behind every PrathamKarigiri creation is a master artisan. We work directly with weavers and knitters to preserve age-old traditions.</p>
        </div>

        <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-6 md:gap-12 no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          {[
            { name: "Nisha Devi", region: "Sonipat, Haryana", craft: "Product & Items Head", story: "Nisha expertly handles all product creation and item management, ensuring every handcrafted piece meets our highest quality standards.", phone: "70273 11213" },
            { name: "Himanshu", region: "Sonipat, Haryana", craft: "Service Operations", story: "Himanshu manages all our customer services, ensuring smooth operations, timely deliveries, and exceptional support for our community.", phone: "7988790345" }
          ].map((artisan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-[var(--secondary)]/20 p-8 md:p-12 rounded-3xl flex flex-col md:flex-row gap-8 md:gap-10 items-center text-center md:text-left border border-[var(--secondary)]/30 min-w-[280px] md:min-w-0 snap-center"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white shadow-xl flex-shrink-0 flex items-center justify-center text-3xl font-black text-[var(--primary)] border-4 border-white overflow-hidden">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">{artisan.name[0]}</div>
              </div>
              <div className="flex-1">
                <span className="bg-[var(--primary)] text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 inline-block">{artisan.craft}</span>
                <h4 className="text-xl md:text-2xl font-bold text-[var(--primary)] mb-2">{artisan.name}</h4>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                  {artisan.region} {artisan.phone && <span className="ml-2 font-bold text-[var(--primary)]">📞 {artisan.phone}</span>}
                </p>
                <p className="text-xs md:text-base text-[var(--text-muted)] leading-relaxed italic opacity-80">"{artisan.story}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CustomizationSection />

      <FAQ />
    </div>
  );
};

export default Home;
