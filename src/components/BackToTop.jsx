import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageCircle, X, ExternalLink, Share } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { WHATSAPP } from '../config/constants';

const BackToTop = () => {
  const [showAppText, setShowAppText] = useState(false);
  const [showIosTooltip, setShowIosTooltip] = useState(false);
  const location = useLocation();
  const { isInstallable, promptInstall, isStandalone, isAppleOS, isInAppBrowser, isLocallyInstalled } = useInstallPrompt();

  // Determine if we are on a page with a sticky bottom bar on mobile
  const isCartPage = location.pathname === '/cart';
  const isProductPage = location.pathname.startsWith('/product/');
  const isCheckoutPage = location.pathname === '/checkout';
  const hasMobileStickyBar = isCartPage || isProductPage || isCheckoutPage;

  const [isHovered, setIsHovered] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(
    localStorage.getItem('pwa_dismissed') === '1'
  );
  
  // If the browser tells us it can be installed, it means it is definitely not downloaded
  const isDownloaded = (isLocallyInstalled || hasDismissed) && !isInstallable;
  
  // Show the floating button if they are in the browser (not standalone)
  const shouldShowButton = !isStandalone;

  useEffect(() => {
    if (!shouldShowButton || isDownloaded) return;
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
  }, [shouldShowButton, isDownloaded]);

  const handleDownloadClick = () => {
    if (isInstallable) {
      promptInstall();
    } else if (isAppleOS && !isDownloaded) {
      setShowIosTooltip(true);
      setTimeout(() => setShowIosTooltip(false), 5000);
    }
  };

  return (
    <>
      <div 
        className={`fixed right-4 md:right-[38px] z-[110] flex flex-col gap-3 transition-all duration-300 ${
          hasMobileStickyBar ? 'bottom-[150px] md:bottom-28' : 'bottom-20 md:bottom-28'
        }`}
      >
        <AnimatePresence>
          {shouldShowButton && (
            <div className="relative flex justify-end">
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadClick}
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
                      {isDownloaded ? 'Open' : 'App'}
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
                      <div className="flex items-center justify-center transition-transform group-hover:scale-110">
                        {isDownloaded ? (
                          <ExternalLink size={18} strokeWidth={2.5} />
                        ) : (
                          <Download size={18} strokeWidth={2.5} />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-[12px] font-bold uppercase tracking-wider text-left">
                 {isDownloaded ? 'Open App' : 'Download App'}
              </span>
            </motion.button>
            </div>
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

      {/* Centered iOS Tooltip */}
      <AnimatePresence>
        {showIosTooltip && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[260px] bg-gray-900 text-white text-sm p-4 rounded-2xl shadow-2xl font-medium leading-relaxed text-center pointer-events-auto"
            >
              <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-400">
                <Share size={20} />
              </div>
              To install on iPhone:<br/>
              Tap the <span className="font-bold text-blue-400">Share</span> icon below, then <span className="font-bold">'Add to Home Screen'</span>.
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
};

export default BackToTop;
