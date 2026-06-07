import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Determine if we are on a page with a sticky bottom bar on mobile
  const isCartPage = location.pathname === '/cart';
  const isProductPage = location.pathname.startsWith('/product/');
  const hasMobileStickyBar = isCartPage || isProductPage;

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className={`fixed right-4 md:right-[38px] z-[110] w-11 h-11 bg-[var(--primary)] text-white rounded-full shadow-xl shadow-[var(--primary)]/30 flex items-center justify-center transition-all duration-300 ${
            hasMobileStickyBar ? 'bottom-[150px] md:bottom-28' : 'bottom-20 md:bottom-28'
          }`}
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
