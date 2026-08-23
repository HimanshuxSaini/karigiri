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

  const [testShow, setTestShow] = React.useState(true); // TEMP: Force show for testing

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setTestShow(false);
  };

  return (
    <AnimatePresence>
      {(needRefresh || testShow) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 opacity-90"></div>
            
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Update Available
              </h3>
              <p className="text-sm text-gray-600 font-medium px-2">
                A new version of Pratham Karigiri is ready. Update now for the latest features and fixes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={close}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors order-2 sm:order-1"
              >
                Later
              </button>
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors shadow-lg order-1 sm:order-2"
              >
                Update Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReloadPrompt;
