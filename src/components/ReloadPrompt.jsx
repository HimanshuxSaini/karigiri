import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 overflow-hidden"
        >
          {/* Subtle gradient background element for premium feel */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 opacity-70"></div>
          
          <div className="flex items-start justify-between mb-3">
            <div className="pr-4">
              <h3 className="text-[var(--text)] font-semibold text-base mb-1">
                New update available!
              </h3>
              <p className="text-sm text-[var(--text-light)]">
                A new version of Pratham Karigiri is ready. Update now for the latest features and fixes.
              </p>
            </div>
            <button
              onClick={close}
              className="p-1 text-[var(--text-light)] hover:text-[var(--text)] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <RefreshCw size={16} />
                Update App Now
              </button>
            )}
            <button
              onClick={close}
              className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[var(--text)] rounded-xl text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReloadPrompt;
