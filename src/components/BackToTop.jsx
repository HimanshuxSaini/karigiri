import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageCircle, X, ExternalLink, Share } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { WHATSAPP } from '../config/constants';

const BackToTop = () => {
  const [showAppText, setShowAppText] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOpenAppModal, setShowOpenAppModal] = useState(false);
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
  
  const isDownloaded = isLocallyInstalled || hasDismissed;
  
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
    if (isDownloaded) {
      setShowOpenAppModal(true);
      return;
    }
    if (isInstallable) {
      // Android Chrome native prompt
      promptInstall();
    } else {
      // iOS or In-App Browser manual instructions
      setShowInstallModal(true);
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

      {/* Open App Modal */}
      <AnimatePresence>
        {showOpenAppModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setShowOpenAppModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">App is Downloaded!</h3>
                <p className="text-sm text-gray-500 font-medium px-2">
                  You already have the Pratham Karigiri app. Please open it from your home screen for the best experience.
                </p>
              </div>

              <button
                onClick={() => setShowOpenAppModal(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Instructions Modal for iOS and In-App Browsers */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Install Our App</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Get a faster, better experience by installing Pratham Karigiri on your home screen.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
                {isInAppBrowser ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">1</div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        Tap the <span className="font-bold">3 dots</span> in the top right corner of your screen.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">2</div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        Select <span className="font-bold flex items-center inline-flex gap-1">Open in Browser <ExternalLink size={14} /></span>
                      </p>
                    </div>
                  </div>
                ) : isAppleOS ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">1</div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        Tap the <span className="font-bold flex items-center inline-flex gap-1 text-blue-500">Share <Share size={14} /></span> icon at the bottom of your screen.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">2</div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        Scroll down and tap <span className="font-bold">Add to Home Screen</span>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      To install this app, please open this website in Google Chrome or Safari, then select "Install" or "Add to Home Screen".
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowInstallModal(false);
                  localStorage.setItem('pwa_dismissed', '1');
                  setHasDismissed(true);
                }}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackToTop;
