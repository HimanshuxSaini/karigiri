import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { clearAllStores } from './utils/clearStores';
import { lazy, Suspense } from 'react';
import AmbientBackground from './components/AmbientBackground';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import ToastContainer from './components/Toast';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import IntroVideo from './components/IntroVideo';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuthStore } from './store/useStore';
import { Navigate } from 'react-router-dom';
import { useCartSync } from './hooks/useCartSync';
import { useWishlistSync } from './hooks/useWishlistSync';
import { isAdminEmail } from './config/constants';

// Lazy-loaded pages for code splitting — Admin alone is 134KB
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Policies = lazy(() => import('./pages/Policies'));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent animate-spin rounded-full"></div>
  </div>
);

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { user } = useAuthStore();
  
  const isUserAdmin = isAdminEmail(user?.email);

  if (!user || (isAdmin && !isUserAdmin)) {
    return <Navigate to="/" replace />;
  }
  return children;
};


function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  const setUser = useAuthStore((state) => state.setUser);
  useCartSync();     // Activate cross-device Firestore cart synchronization
  useWishlistSync(); // Activate cross-device Firestore wishlist synchronization

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Get the last known UID from the store
      const lastUid = useAuthStore.getState().lastUid;

      if (user) {
        // If the user has changed, clear all local data from previous sessions
        if (lastUid && lastUid !== user.uid) {
          clearAllStores();
        }
        setUser(user);
      } else {
        setUser(null);
        // Also clear if explicitly logging out
        clearAllStores();
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <ErrorBoundary>
        <ScrollToTop />
        <AnimatePresence>
          {showIntro && (
            <IntroVideo onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>
        <div className="min-h-screen relative pb-16 md:pb-0">
          <ToastContainer />
          <WhatsAppButton />
          <AnnouncementBar />
          <AmbientBackground />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute isAdmin={true}><Admin /></ProtectedRoute>} />
              {/* Legal / Policy pages */}
              <Route path="/:type" element={<Policies />} />
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
          <BottomNav />
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
