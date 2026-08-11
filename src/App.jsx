import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { clearAllStores } from './utils/clearStores';
import { lazy, Suspense, useState, useEffect } from 'react';
import AmbientBackground from './components/AmbientBackground';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ToastContainer from './components/Toast';
import BottomNav from './components/BottomNav';
import BackToTop from './components/BackToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import IntroVideo from './components/IntroVideo';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuthStore } from './store/useStore';
import { useCartSync } from './hooks/useCartSync';
import { useWishlistSync } from './hooks/useWishlistSync';
import { usePushNotifications } from './hooks/usePushNotifications';
import { isAdminEmail } from './config/constants';
import SmoothScroll from './components/SmoothScroll';

// Lazy-loaded pages for code splitting
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

// Page transition wrapper — wraps each route for smooth fade+slide
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { user } = useAuthStore();
  const isUserAdmin = isAdminEmail(user?.email);
  if (!user || (isAdmin && !isUserAdmin)) return <Navigate to="/" replace />;
  return children;
};

// Inner component — needs to be inside Router to access useLocation
const AppInner = () => {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('hasSeenIntro'));
  const setUser = useAuthStore((state) => state.setUser);
  const { requestPermission } = usePushNotifications();

  useCartSync();
  useWishlistSync();

  useEffect(() => {
    // Request push notification permissions
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const lastUid = useAuthStore.getState().lastUid;
      if (firebaseUser) {
        if (lastUid && lastUid !== firebaseUser.uid) clearAllStores();
        setUser(firebaseUser);
      } else {
        setUser(null);
        clearAllStores();
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <SmoothScroll>
      <ScrollToTop />
      <AnimatePresence>
        {showIntro && (
          <IntroVideo onComplete={() => {
            sessionStorage.setItem('hasSeenIntro', 'true');
            setShowIntro(false);
          }} />
        )}
      </AnimatePresence>
      <div className="min-h-screen relative pb-16 md:pb-0">
        <ToastContainer />
        <AnnouncementBar />
        <AmbientBackground />
        <BackToTop />
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
              <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
              <Route path="/checkout" element={<PageWrapper><ProtectedRoute><Checkout /></ProtectedRoute></PageWrapper>} />
              <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
              <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><ProtectedRoute><Profile /></ProtectedRoute></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><ProtectedRoute isAdmin={true}><Admin /></ProtectedRoute></PageWrapper>} />
              <Route path="/:type" element={<PageWrapper><Policies /></PageWrapper>} />
              <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
        <Footer />
        <BottomNav />
      </div>
    </SmoothScroll>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <AppInner />
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}

export default App;

