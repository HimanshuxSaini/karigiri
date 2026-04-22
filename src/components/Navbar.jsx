import { ShoppingCart, User, Search, Menu, LogOut, Heart, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore';
import { auth as firebaseAuth } from '../firebase/config';
import { useState } from 'react';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setIsMobileMenuOpen(false);
      }
    }
  };

  const navLinks = [
    { name: 'Men', path: '/shop?category=Men' },
    { name: 'Women', path: '/shop?category=Women' },
    { name: 'Kids', path: '/shop?category=Kids' },
    { name: 'Yarn', path: '/shop?category=Yarn' },
    { name: 'Laddu Gopal', path: '/shop?category=Laddu Gopal' },
  ];

  return (
    <>
      <nav className="fixed top-9 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 md:px-12 py-2 md:py-4 transition-all">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center h-12 md:h-16">
          <div className="flex items-center space-x-4 md:space-x-12">
            <button 
              className="lg:hidden text-gray-800"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-black flex items-center">
              KARI<span className="text-[var(--primary)]">GIRI</span>
            </Link>

            <div className="hidden lg:flex space-x-10 text-[13px] font-bold uppercase tracking-wider text-gray-800 pt-1">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="hover:text-[var(--primary)] border-b-4 border-transparent hover:border-b-[var(--primary)] pb-6 transition-all">{link.name}</Link>
              ))}
            </div>
          </div>

          <div className="flex-grow max-w-lg mx-6 lg:mx-12 hidden md:block">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[var(--primary)]" 
                size={16} 
                onClick={handleSearch}
              />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full bg-gray-100 border-none rounded py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-gray-200 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 md:space-x-10">
            <div className="hidden sm:flex flex-col items-center cursor-pointer group" onClick={handleSearch}>
               <Search size={20} className="md:hidden group-hover:text-[var(--primary)]" />
            </div>

            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => user ? navigate('/profile') : setIsLoginModalOpen(true)}
            >
              <User size={20} className="group-hover:text-[var(--primary)]" />
              <span className="hidden xs:block text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]">
                {user ? 'Profile' : 'Login'}
              </span>
            </div>

            <Link to="/wishlist" className="flex flex-col items-center relative group">
              <Heart size={20} className="group-hover:text-[var(--primary)]" />
              <span className="hidden xs:block text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="flex flex-col items-center relative group">
              <ShoppingCart size={20} className="group-hover:text-[var(--primary)]" />
              <span className="hidden xs:block text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]">Bag</span>
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[101] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xl font-black tracking-tighter">
                  KARI<span className="text-[var(--primary)]">GIRI</span>
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-2 flex-grow overflow-y-auto bg-gray-50/30">
                <div className="mb-10 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for pure wool..."
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm outline-none focus:border-[var(--primary)] transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                </div>

                <div className="px-2 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-40 mb-6">Collections</p>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between group py-4 border-b border-gray-100 last:border-none"
                      >
                        <span className="text-xl font-bold text-gray-800 group-hover:text-[var(--primary)] transition-colors">{link.name}</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-[var(--primary)] transition-all">
                           <ChevronRight size={16} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-12 px-2 pt-8 border-t border-gray-100">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-40 mb-6">Account & Support</p>
                   <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          user ? navigate('/profile') : setIsLoginModalOpen(true);
                        }}
                        className="flex items-center space-x-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)]">
                           <User size={20} />
                        </div>
                        <span className="font-bold text-gray-800">{user ? 'My Profile' : 'Login / Sign Up'}</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate('/wishlist');
                        }}
                        className="flex items-center space-x-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400">
                           <Heart size={20} />
                        </div>
                        <span className="font-bold text-gray-800">My Wishlist</span>
                      </button>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 mt-auto">
                {user ? (
                  <button 
                    onClick={() => { firebaseAuth.signOut(); setIsMobileMenuOpen(false); }}
                    className="w-full py-4 bg-white border border-gray-200 rounded-xl text-red-500 font-bold flex items-center justify-center space-x-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
