import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [current, setCurrent] = useState(0);

  const slides = [
    { title: "Artisanal Edit 2026", head: "The Softest\nCollection.", img: "/images/hero-1.png", pos: "object-center" },
    { title: "Winter Heritage", head: "Timeless\nCraftsmanship.", img: "/images/hero-2.png", pos: "object-top" },
    { title: "Pure Wool Luxury", head: "Elegance in\nEvery Stitch.", img: "/images/hero-3.png", pos: "object-center" },
    { title: "Mountain Cozy", head: "Warmth for\nThe Wild.", img: "/images/hero-4.png", pos: "object-center" },
    { title: "Hand-Knitted", head: "Patterns of\nTradition.", img: "/images/hero-5.png", pos: "object-bottom" },
    { title: "Sustainable Yarn", head: "Earth Friendly\nWarmth.", img: "/images/hero-6.png", pos: "object-center" },
    { title: "Daily Comfort", head: "Styled for\nEvery Day.", img: "/images/hero-7.png", pos: "object-top" }
  ];

  useEffect(() => {
    const next = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(next);
  }, []);

  return (
    <div className="pt-20 md:pt-22 bg-[var(--background)]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 md:py-6">
        <div className="relative h-[70vh] sm:h-[75vh] md:h-[80vh] rounded-sm overflow-hidden shadow-sm bg-white">
          <AnimatePresence mode="wait">
            <motion.div 
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img 
                src={slides[current].img} 
                alt="New Season" 
                className={`w-full h-full object-cover ${slides[current].pos}`}
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 to-transparent flex items-center px-6 md:px-24">
                <div className="max-w-xl">
                   <motion.h2 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[var(--primary)] mb-2 md:mb-4"
                   >
                     {slides[current].title}
                   </motion.h2>
                   <motion.h1 
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.4 }}
                     className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6 md:mb-8 whitespace-pre-line"
                   >
                     {slides[current].head}
                   </motion.h1>
                   <motion.div
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.6 }}
                   >
                     <Link 
                       to="/shop" 
                       className="inline-block px-6 md:px-10 py-3 md:py-4 bg-slate-900 text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[var(--primary)] transition-all transform hover:-translate-y-1"
                     >
                       Shop Now
                     </Link>
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 md:bottom-8 right-6 md:right-12 z-10">
             <div className="flex space-x-1.5 md:space-x-2">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-8 md:w-12 bg-slate-900' : 'w-2 md:w-4 bg-gray-200'}`}
                  ></div>
                ))}
             </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 mt-8 md:mt-16">
           {['Premium Yarn', 'Sweaters', 'Cardigans', 'Woolen Sets', 'Hand-Knitted', 'Accessories'].map((cat, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * i }}
               className="bg-white p-3 md:p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer group rounded-sm"
             >
                <div className="w-12 h-12 md:w-20 md:h-20 bg-[var(--background)] rounded-full mx-auto mb-2 md:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                   <img src={`/images/hero-${(i % 7) + 1}.png`} className="w-full h-full object-cover" alt={cat} />
                </div>
                <h3 className="text-[8px] md:text-[12px] font-bold uppercase tracking-wide text-slate-700">{cat}</h3>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
