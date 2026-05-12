import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Clock, Truck, Sparkles } from 'lucide-react';
import { fetchProducts } from '../services/api';

const CustomizationSection = () => {
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const loadCatalogImages = async () => {
      try {
        const products = await fetchProducts();
        // Filter valid products and unique non-fallback images
        const productImages = products
          .filter(p => p.image && !p.image.includes('placeholder') && p.category !== 'Yarn')
          .map(p => p.image);
        
        // Shuffle array for variance on every load
        const shuffled = productImages.sort(() => 0.5 - Math.random());
        
        if (shuffled.length > 0) {
          setImages(shuffled.slice(0, 8)); // Take up to 8 images to loop through
        }
      } catch (err) {
        console.error('Failed loading customization context images:', err);
      }
    };
    loadCatalogImages();
  }, []);

  // Auto-cycle current primary image every 3.5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images]);

  const handleWhatsAppContact = () => {
    const number = "917027311213";
    const text = encodeURIComponent("Hi Karigiri Team! ✨ I'm interested in getting a custom order crafted. Can you please guide me on how to proceed?");
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  const optimizeImage = (url) => {
    if (!url) return '';
    return url.includes('cloudinary.com') ? url.replace('/upload/', '/upload/w_1000,q_auto,f_auto/') : url;
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white to-[var(--secondary)]/10">
      {/* Decorational Background Element */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-card overflow-hidden rounded-3xl border border-amber-100/50 shadow-2xl">
          <div className="flex flex-col lg:flex-row">
            
            {/* Text Content Panel */}
            <div className="lg:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center relative overflow-hidden">
              {/* Abstract background vector light */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 text-[var(--accent)] rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
                  <Sparkles size={14} />
                  <span>Made to Order</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-serif text-[var(--primary)] leading-tight mb-6">
                  Craft Your Unique Vision With Us
                </h2>
                
                <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
                  Can't find exactly what you crave? Our expert artisans can handcraft personalized wearables tailored strictly to your preferences.
                </p>

                {/* Benefits Stack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 bg-white rounded-2xl shadow-md flex items-center justify-center text-[var(--primary)]">
                      <Clock size={20} className="stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm mb-1">Rapid Response</h4>
                      <p className="text-xs text-slate-500">We reply within 2 hours guaranteed</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 bg-white rounded-2xl shadow-md flex items-center justify-center text-[var(--primary)]">
                      <Truck size={20} className="stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm mb-1">Express Craft</h4>
                      <p className="text-xs text-slate-500">Delivered to doorstep in 3-4 days</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleWhatsAppContact}
                  className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--primary)] text-white rounded-full font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl shadow-[var(--primary)]/20 active:scale-95 w-full sm:w-auto text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  <MessageCircle size={20} className="fill-current" />
                  <span>Discuss Your Design</span>
                </button>
              </motion.div>
            </div>

            {/* Dynamic Image Showcase Panel */}
            <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-slate-50">
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <div className="absolute inset-0 bg-black/5 z-10 mix-blend-multiply" />
                    <img 
                      src={optimizeImage(images[currentImageIndex])} 
                      alt="Handcrafted examples" 
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-50">
                     <div className="w-12 h-12 border-4 border-amber-200 border-t-[var(--primary)] rounded-full animate-spin" />
                  </div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomizationSection;
