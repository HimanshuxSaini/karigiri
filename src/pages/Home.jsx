import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FAQ from '../components/FAQ';
import { allProducts } from '../data/products';

const featuredProducts = [
  ...allProducts.filter(p => p.category === 'Men').slice(0, 2),
  ...allProducts.filter(p => p.category === 'Women').slice(0, 2),
  ...allProducts.filter(p => p.category === 'Laddu Gopal').slice(0, 2),
  ...allProducts.filter(p => p.category === 'Yarn').slice(0, 2),
];

const Home = () => {
  const customImages = [
    "/images/custom-order-1.png",
    "/images/custom-order-2.png",
    "/images/custom-order-3.png",
    "/images/custom-order-4.png",
    "/images/custom-order-5.png",
    "/images/custom-order-6.png",
    "/images/custom-order-7.png",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % customImages.length);
    }, 4000);
    return () => clearInterval(timer);
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
              <span className="text-orange-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest block mb-1 md:mb-2 text-center sm:text-left">Winter Budget Finds</span>
              <h2 className="text-2xl md:text-4xl font-black text-[var(--primary)] tracking-tighter text-center sm:text-left">Under ₹999 Deals</h2>
            </div>
            <Link to="/shop" className="hidden sm:block text-[10px] md:text-xs font-bold border-b border-[var(--primary)] pb-0.5 md:pb-1 text-[var(--primary)]">Shop The Deals</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { name: "Ribbed Beanie", price: 699, img: "/images/yarn-1.png" },
              { name: "Woolen Socks", price: 499, img: "/images/sweater-1.png" },
              { name: "Knit Scarf", price: 899, img: "/images/yarn-1.png" },
              { name: "Woolen Cap", price: 799, img: "/images/sweater-1.png" }
            ].map((deal, i) => (
              <Link key={i} to="/shop" className="group">
                <div className="aspect-[4/5] bg-[var(--secondary)]/40 overflow-hidden rounded-xl mb-3 md:mb-4">
                  <img src={deal.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={deal.name} />
                </div>
                <div className="px-1 text-center sm:text-left">
                  <h4 className="text-[10px] md:text-xs font-bold text-[var(--text-main)] truncate">{deal.name}</h4>
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
            <h2 className="text-3xl md:text-5xl font-black text-[var(--primary)]">Featured Curations</h2>
          </div>
          <Link to="/shop" className="hidden md:block text-xs md:text-sm font-black uppercase border-b-2 border-[var(--primary)] pb-1 text-[var(--primary)] hover:opacity-70 transition-all mt-4 md:mt-0">View All Collections</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-8 md:gap-y-16">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link to="/shop" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--primary)] text-white px-10 py-4 rounded-full shadow-lg">View Full Catalog</Link>
        </div>
      </section>

      {/* Customised Orders Section */}
      <section className="py-16 md:py-32 px-4 md:px-12 bg-[var(--secondary)]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-6xl font-black text-[var(--primary)] leading-tight">
              Customised <br className="hidden md:block" /> Orders
            </h2>
            <div className="space-y-4 md:space-y-6">
              <p className="text-base md:text-xl text-[var(--text-main)] leading-relaxed px-2 md:px-0">
                You said, we did! You design and we will knit it for you. Now get handmade products or accessories as per your choice of colours, size, wool and designs.
              </p>
              <div className="p-4 bg-white/50 rounded-2xl border border-white/20 inline-block mx-auto lg:mx-0">
                <p className="text-sm md:text-lg text-[var(--text-muted)] italic mb-1">
                  Expert will call you within 2 hours!
                </p>
                <a href="https://wa.me/917404142034" target="_blank" rel="noopener noreferrer" className="font-black text-lg md:text-2xl text-[var(--primary)] hover:underline tracking-tight">+91-7404142034</a>
              </div>
            </div>
            <div className="pt-2">
              <motion.a
                href="https://wa.me/917404142034"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block w-full md:w-auto bg-[var(--primary)] text-[var(--secondary)] px-10 md:px-12 py-5 md:py-6 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl transition-all text-center"
              >
                Start Custom Design
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative flex items-center justify-center"
          >
            <div className="relative z-10 w-full max-w-[450px] rounded-3xl overflow-hidden shadow-2xl border-[6px] md:border-[16px] border-white aspect-square bg-white">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={customImages[currentImageIndex]}
                  alt="Customised Baby Knit Set"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Decorative Element Hidden on Small Mobile */}
            <div className="absolute top-0 md:top-4 left-0 right-0 z-30 hidden sm:flex justify-center px-4">
              <h3 className="text-4xl md:text-7xl font-black text-[var(--primary)] opacity-40 tracking-tighter leading-none select-none uppercase italic whitespace-nowrap">
                Handmade Love
              </h3>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Instagram Reels Section */}
      <section className="py-16 md:py-24 px-4 md:px-12 bg-[var(--background)] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 md:space-x-4 mb-8 md:mb-12">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Karigiri in Motion</h2>
          </div>
          <div className="flex space-x-4 md:space-x-6 overflow-x-auto pb-8 mask-fade-right scrollbar-hide snap-x">
            {[
              { img: "/images/men-1.png", tag: "Handmade Sweaters" },
              { img: "/images/laddu-gopal-1.jpg", tag: "Laddu Gopal Specials" },
              { img: "/images/yarn-1.png", tag: "Pure Merino Yarn" },
              { img: "/images/men-2.png", tag: "Artisanal Cardigans" },
              { img: "/images/custom-order-2.png", tag: "Baby Knit Sets" },
              { img: "/images/men-3.png", tag: "Winter Accessories" }
            ].map((reel, i) => (
              <div key={i} className="min-w-[160px] md:min-w-[200px] h-[280px] md:h-[350px] bg-slate-200 rounded-xl relative overflow-hidden flex-shrink-0 group snap-center border border-white/20 shadow-lg">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500"></div>
                <img src={reel.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Karigiri in Motion" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">{reel.tag}</p>
                  <p className="text-[8px] md:text-[10px] font-medium opacity-80">@karigiri_official</p>
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

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
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
              className="bg-[var(--secondary)]/20 p-8 md:p-12 rounded-3xl flex flex-col md:flex-row gap-8 md:gap-10 items-center text-center md:text-left border border-[var(--secondary)]/30"
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
