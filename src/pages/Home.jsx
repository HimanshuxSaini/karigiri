import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FAQ from '../components/FAQ';
import { fetchProducts, fetchReels } from '../services/api';
import { categoryStructure } from '../data/categories';


// Asset Imports
import bootiesImg from '../assets/booties.png';
import sweaterImg from '../assets/sweater.png';
import yarnImg from '../assets/yarn.png';

const Home = () => {
  const [products, setProducts] = useState([]);

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ['All', ...Object.keys(categoryStructure)];


  useEffect(() => {
    const getFeaturedProducts = async () => {
      try {
        const data = await fetchProducts();
        if (Array.isArray(data) && data.length > 0) {
          // Filter products for featured section (2 from each major category)
          const featured = [
            ...data.filter(p => p?.category === 'Women').slice(0, 1),
            ...data.filter(p => p?.category === 'Kids').slice(0, 1),
            ...data.filter(p => p?.category === 'Bookey').slice(0, 1),
            ...data.filter(p => p?.category === 'Laddu Gopal').slice(0, 1),
            ...data.filter(p => p?.category === 'Yarn').slice(0, 1),
          ];
          setProducts(featured.length > 0 ? featured : data.slice(0, 8));
        } else {
          setProducts([]); 
        }
      } catch (err) {
        console.error('Failed to fetch home products:', err);
        setProducts([]);
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

    getFeaturedProducts();
    getReels();


  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white overflow-hidden"
    >
      <Navbar />
      <Hero />

      {/* Mobile Category Pills - Quick Navigation */}
      <div className="md:hidden sticky top-14 z-40 bg-white shadow-sm border-b border-gray-50 overflow-hidden">
        <div className="flex overflow-x-auto py-4 px-4 space-x-3 no-scrollbar mask-fade-right">
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
      <section className="bg-[var(--primary)] text-white py-4 md:py-4 text-center overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 px-4"
        >
          <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">Flash Sale Ends In:</span>
          <FlashSaleTimer />
          <Link to="/shop" className="bg-white text-[var(--primary)] px-6 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider">Shop Now</Link>
        </motion.div>
      </section>

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
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 snap-x mask-fade-right">
            {[
              { name: "Handmade Woolen Shawl", price: 899, img: "/shawl.png" },
              { name: "Artisanal Crochet Bag", price: 749, img: "/bag.png" },
              { name: "Kids Winter Beanie", price: 499, img: "/item4.png" },
            ].map((deal, i) => (
              <Link key={i} to="/shop" className="group min-w-[170px] md:min-w-0 snap-center bg-white p-3 rounded-3xl border border-gray-50 shadow-sm md:shadow-none md:border-none md:bg-transparent">
                <div className="aspect-[3/4] bg-[var(--secondary)]/20 overflow-hidden rounded-2xl mb-3 md:mb-4 flex items-center justify-center p-4">
                  <img src={deal.img} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-lg" alt={deal.name} />
                </div>
                <div className="px-1 text-center sm:text-left">
                  <h4 className="text-[10px] md:text-xs font-bold text-[var(--text-main)] truncate mb-1">{deal.name}</h4>
                  <p className="text-xs md:text-sm font-black text-[var(--primary)]">₹{deal.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
            ))}
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-8 md:gap-y-16 no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x mask-fade-right">
            {products.map((product, index) => (
              <motion.div
                key={product._id || product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="min-w-[220px] md:min-w-0 snap-center"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link to="/shop" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--primary)] text-white px-10 py-4 rounded-full shadow-lg">View Full Catalog</Link>
        </div>
      </section>





      {/* Instagram Reels Section */}
      <section className="py-16 md:py-24 px-4 md:px-12 bg-[var(--background)] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 md:space-x-4 mb-8 md:mb-12">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Karigiri in Motion</h2>
          </div>
          <div className="flex space-x-4 md:space-x-6 overflow-x-auto pb-8 mask-fade-right no-scrollbar snap-x">
            {(reels.length > 0 ? reels : [
              { image: "/shawl.png", tag: "Handmade Shawls", handle: "@karigiri_official" },
              { image: "/item4.png", tag: "Kids Collection", handle: "@karigiri_official" },
              { image: "/bag.png", tag: "Crochet Bags", handle: "@karigiri_official" },
              { image: "/bookey.png", tag: "Floral Bookey", handle: "@karigiri_official" },
              { image: "/blanket.png", tag: "Premium Blankets", handle: "@karigiri_official" }
            ]).map((reel, i) => (
              <div key={i} className="min-w-[160px] md:min-w-[200px] h-[280px] md:h-[350px] bg-slate-200 rounded-xl relative overflow-hidden flex-shrink-0 group snap-center border border-white/20 shadow-lg">
                <div className="absolute inset-0 aspect-[3/4] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                  <img src={reel.image || reel.img} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-lg" alt={reel.tag} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">{reel.tag}</p>
                  <p className="text-[8px] md:text-[10px] font-medium opacity-80">{reel.handle || '@karigiri_official'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan Section */}
      <section className="py-16 md:py-32 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-10 md:mb-20">
          <span className="text-[var(--primary)] font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">Heritage & Craft</span>
          <h2 className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-4 md:mb-6">Meet the Makers</h2>
          <p className="text-sm md:text-lg text-[var(--text-muted)] italic max-w-2xl mx-auto leading-relaxed">Behind every Karigiri creation is a master artisan. We work directly with weavers and knitters to preserve age-old traditions.</p>
        </div>

        <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-6 md:gap-12 no-scrollbar pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x mask-fade-right">
          {[
            { name: "Nisha Devi", region: "Sonipat, Haryana", craft: "Master Knitter", story: "Nisha leads our local knitting circle in Sonipat, specializing in intricate geometric patterns passed down through generations of her family." },
            { name: "Ajay Kumar Pandey", region: "Sonipat, Haryana", craft: "Premium Weaver", story: "Ajay transforms raw ethically sourced wool into gossamer-thin wraps using traditional looms preserved in our Sonipat studio." }
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
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{artisan.region}</p>
                <p className="text-xs md:text-base text-[var(--text-muted)] leading-relaxed italic opacity-80">"{artisan.story}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      <FAQ />
    </motion.div>
  );
};

export default Home;
