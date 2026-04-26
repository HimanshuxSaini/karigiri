import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { clearAllStores } from './utils/clearStores';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AmbientBackground from './components/AmbientBackground';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuthStore } from './store/useStore';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdmin = false }) => {
  const { user } = useAuthStore();
  
  const isUserAdmin = user?.email === 'himanshu0481@gmail.com' || user?.email === 'admin@karigiri.com';

  if (!user || (isAdmin && !isUserAdmin)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Get the last known UID from the store
      const lastUid = useAuthStore.getState().lastUid;

      if (user) {
        // If the user has changed, clear all local data from previous sessions
        if (lastUid && lastUid !== user.uid) {
          console.log('User changed detected. Clearing local data...');
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
      <ScrollToTop />
      <div className="min-h-screen relative">
        <WhatsAppButton />
        <AnnouncementBar />
        <AmbientBackground />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute isAdmin={true}><Admin /></ProtectedRoute>} />
            {/* Fallback to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
