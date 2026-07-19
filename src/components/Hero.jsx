import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect, memo } from 'react';
import yarnImg from '../assets/yarn.png';

const slides = [
  { 
    title: "Floral Collection", 
    head: "Artisanal\nCrochet Bouquet.", 
    img: "/bookey.png", 
    pos: "object-center",
    fit: "contain"
  },
  { 
    title: "Kids Collection", 
    head: "Warmth for\nSmall Wonders.", 
    img: "/item4.png", 
    pos: "object-center",
    fit: "contain" 
  },
  { 
    title: "Women's Luxe", 
    head: "Handcrafted\nBracelets & Bags.", 
    img: "/bracelet.png", 
    pos: "object-center",
    fit: "contain"
  },
  { 
    title: "Artisanal Comfort", 
    head: "Premium\nWoolen Blankets.", 
    img: "/blanket.png", 
    pos: "object-center",
    fit: "contain"
  },
  { 
    title: "Heritage Yarn", 
    head: "Pure Organic\nWool Yarn.", 
    img: yarnImg, 
    pos: "object-center",
    fit: "contain"
  }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);


  useEffect(() => {
    const next = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(next);
  }, []);

  return (
    <div className="h-[calc(100dvh-4.5rem)] md:h-auto pt-14 md:pt-24 bg-white border-b border-gray-100 flex flex-col">
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-stretch md:items-center overflow-hidden relative">
        
        {/* Left Side: Content */}
        <div className="w-full h-[48%] md:h-auto md:w-1/2 px-6 md:px-24 flex flex-col justify-center order-2 md:order-1 pb-6 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
                exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
              }}
            >
              <motion.h2 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
                className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[var(--primary)] mb-2 md:mb-4"
              >
                {slides[current].title}
              </motion.h2>
              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
                }}
                className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-4 md:mb-8 whitespace-pre-line"
              >
                {slides[current].head}
              </motion.h1>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
              >
                <Link 
                  to="/shop" 
                  className="inline-block px-10 py-4 bg-slate-900 text-white text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-[var(--primary)] hover:shadow-lg transition-all transform hover:-translate-y-1 w-fit"
                >
                  Shop Now
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Image Box */}
        <div className="w-full h-[52%] md:h-[80vh] md:w-1/2 bg-white order-1 md:order-2 flex items-center justify-center p-4 md:p-16">
          <div className="w-full h-full relative group">
            {/* Elegant Stage for Image */}
            <div className="absolute inset-0 bg-gray-50/50 rounded-[3rem] -z-10 transform scale-95 group-hover:scale-100 transition-transform duration-700" />
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={current}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full flex items-center justify-center"
              >
                <img 
                  src={slides[current].img} 
                  alt={slides[current].title} 
                  fetchPriority="high"
                  className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

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
    </div>
  );
};

export default memo(Hero);
