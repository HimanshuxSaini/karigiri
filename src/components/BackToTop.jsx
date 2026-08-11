import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const { isInstallable, promptInstall } = useInstallPrompt();

  // Determine if we are on a page with a sticky bottom bar on mobile
  const isCartPage = location.pathname === '/cart';
  const isProductPage = location.pathname.startsWith('/product/');
  const isCheckoutPage = location.pathname === '/checkout';
  const hasMobileStickyBar = isCartPage || isProductPage || isCheckoutPage;

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed right-4 md:right-[38px] z-[110] flex flex-col gap-3 transition-all duration-300 ${
        hasMobileStickyBar ? 'bottom-[150px] md:bottom-28' : 'bottom-20 md:bottom-28'
      }`}
    >
      <AnimatePresence>
        {isInstallable && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={promptInstall}
            aria-label="Install App"
            className="w-11 h-11 bg-white text-[var(--primary)] border-2 border-[var(--primary)] rounded-full shadow-xl flex items-center justify-center transition-all duration-300"
          >
            <Download size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

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
            className="w-11 h-11 bg-[var(--primary)] text-white rounded-full shadow-xl shadow-[var(--primary)]/30 flex items-center justify-center transition-all duration-300"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackToTop;
