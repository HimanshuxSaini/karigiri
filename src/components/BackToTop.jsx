import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { WHATSAPP } from '../config/constants';

const BackToTop = () => {
  const [showAppText, setShowAppText] = useState(false);
  const location = useLocation();
  const { isInstallable, promptInstall } = useInstallPrompt();

  // Determine if we are on a page with a sticky bottom bar on mobile
  const isCartPage = location.pathname === '/cart';
  const isProductPage = location.pathname.startsWith('/product/');
  const isCheckoutPage = location.pathname === '/checkout';
  const hasMobileStickyBar = isCartPage || isProductPage || isCheckoutPage;

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isInstallable) return;
    let isMounted = true;
    
    const cycle = () => {
      if (!isMounted) return;
      setShowAppText(false);
      setTimeout(() => {
        if (!isMounted) return;
        setShowAppText(true);
        setTimeout(cycle, 1000);
      }, 2000);
    };
    
    cycle();
    
    return () => {
      isMounted = false;
    };
  }, [isInstallable]);

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={promptInstall}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            aria-label="Install App"
            className="h-11 px-0 min-w-[44px] hover:px-4 bg-white text-[var(--primary)] border-2 border-[var(--primary)] rounded-full shadow-xl flex items-center justify-center transition-all duration-300 overflow-hidden group"
          >
            <div className="w-[40px] shrink-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {(!isHovered && showAppText) ? (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="text-[12px] font-black uppercase tracking-wider"
                  >
                    App
                  </motion.span>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <motion.div
                      animate={isHovered ? { rotate: 0 } : { rotate: [0, -15, 15, -15, 15, 0] }}
                      transition={{ duration: 0.5, repeat: isHovered ? 0 : Infinity }}
                    >
                      <Download size={18} strokeWidth={2.5} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-[12px] font-bold uppercase tracking-wider text-left">
               Download App
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={WHATSAPP.chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-11 px-0 min-w-[44px] hover:px-4 bg-[#25D366] text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 overflow-hidden group self-end"
      >
        <div className="w-[44px] shrink-0 flex items-center justify-center">
          <MessageCircle size={22} fill="currentColor" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-[12px] font-bold uppercase tracking-wider text-left">
          Chat with Us
        </span>
      </a>
    </div>
  );
};

export default BackToTop;
