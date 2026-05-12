import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore';
import LoginModal from './LoginModal';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Shop', icon: Search, path: '/shop' },
    { name: 'Bag', icon: ShoppingBag, path: '/cart', badge: items.length },
    { name: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlist.length },
    { name: user ? 'Profile' : 'Login', icon: User, path: '/profile' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 pt-2 pb-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const requiresLogin = item.path === '/profile' && !user;
            const navContent = (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-[var(--primary)] text-white shadow-md' : 'text-gray-400'
                }`}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black shadow-sm transition-colors ${
                      isActive ? 'bg-white text-[var(--primary)]' : 'bg-[var(--primary)] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-black mt-0.5 uppercase tracking-tighter transition-all ${
                  isActive ? 'text-[var(--primary)] opacity-100' : 'text-gray-400 opacity-60'
                }`}>
                  {item.name}
                </span>
              </motion.div>
            );

            if (requiresLogin) {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="relative flex flex-col items-center justify-center py-1"
                >
                  {navContent}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-1"
              >
                {navContent}
              </Link>
            );
          })}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default BottomNav;
