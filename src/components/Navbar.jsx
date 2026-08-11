import { ShoppingCart, User, Search, Menu, LogOut, Heart, X, ChevronRight, MessageCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore, useWishlistStore } from '../store/useStore';
import { auth as firebaseAuth } from '../firebase/config';
import { useState, useEffect, useRef } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import LoginModal from './LoginModal';
import { categoryStructure, navLinks } from '../data/categories';
import { isAdminEmail, WHATSAPP } from '../config/constants';

const Navbar = () => {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const { wishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const searchRef = useRef(null);
  const { isInstallable, promptInstall } = useInstallPrompt();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAdmin = isAdminEmail(user?.email);

  return (
    <>
      <nav className="fixed top-0 md:top-9 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 lg:px-8 xl:px-12 py-1.5 md:py-2.5 transition-all">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center min-h-[3rem] md:h-14">
          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-12">
            <button
              className="lg:hidden text-gray-800 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="flex flex-col items-start justify-center group">
              <div className="text-xl lg:text-2xl font-black tracking-tighter text-black flex items-center leading-none">
                PRATHAM<span className="text-[var(--primary)]">KARIGIRI</span>
              </div>
              <span className="text-[7px] md:text-[8px] xl:text-[9px] uppercase font-bold tracking-[0.2em] text-gray-500 mt-1 ml-0.5 group-hover:text-[var(--primary)] transition-colors">
                Pratham Guru Enterprises
              </span>
            </Link>

            <div className="hidden lg:flex space-x-4 xl:space-x-8 text-[11px] xl:text-[13px] font-bold uppercase tracking-wider text-gray-800 pt-1">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(link.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={link.path}
                    className="hover:text-[var(--primary)] border-b-4 border-transparent hover:border-b-[var(--primary)] pb-4 transition-all block"
                  >
                    {link.name}
                  </Link>

                  <AnimatePresence>
                    {hoveredCategory === link.name && categoryStructure[link.name] && categoryStructure[link.name].sections && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute top-full ${categoryStructure[link.name].position || 'left-0'} ${categoryStructure[link.name].width} bg-white/95 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.1)] rounded-[2rem] lg:rounded-[3rem] border border-gray-100 p-6 lg:p-8 xl:p-12 grid ${categoryStructure[link.name].gridCols} gap-6 lg:gap-8 xl:gap-10 z-50 mt-0 overflow-hidden`}
                        onMouseEnter={() => setHoveredCategory(link.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-20"></div>

                        {categoryStructure[link.name].sections.map((section, idx) => (
                          <div key={idx} className="space-y-6">
                            <h4 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-4 border-b border-gray-50 pb-3 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mr-2"></span>
                              {section.title}
                            </h4>
                            <div className="space-y-4 flex flex-col">
                              {section.items.map(item => (
                                <Link
                                  key={item}
                                  to={`/shop?category=${link.name}&sub=${item}`}
                                  className="text-gray-500 hover:text-black font-semibold transition-all duration-300 hover:translate-x-2 flex items-center group/item text-[13px]"
                                  onClick={() => setHoveredCategory(null)}
                                >
                                  <span className="w-0 group-hover/item:w-3 h-[1px] bg-[var(--primary)] mr-0 group-hover/item:mr-3 transition-all"></span>
                                  <span className="lowercase first-letter:uppercase">{item}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {isAdmin && (
                <Link to="/admin" className="hover:text-red-500 border-b-4 border-transparent hover:border-b-red-500 pb-4 transition-all text-red-600 font-black">Admin</Link>
              )}
            </div>
          </div>



          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-6 xl:space-x-10">
            <div className="relative" ref={searchRef}>
              <div
                className="flex flex-col items-center cursor-pointer group p-2"
                onClick={() => setIsSearchModalOpen(!isSearchModalOpen)}
              >
                <Search size={20} className="group-hover:text-[var(--primary)]" />
                <span className="hidden md:block text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]">Search</span>
              </div>
              
              <AnimatePresence>
                {isSearchModalOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-2 z-50"
                  >
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (globalSearchQuery.trim()) {
                          navigate(`/shop?search=${encodeURIComponent(globalSearchQuery.trim())}`);
                          setIsSearchModalOpen(false);
                          setGlobalSearchQuery('');
                        }
                      }}
                      className="relative flex items-center"
                    >
                      <Search size={18} className="absolute left-3 text-gray-400" />
                      <input 
                        type="text"
                        autoFocus
                        value={globalSearchQuery}
                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-gray-50 text-sm py-3 pl-10 pr-4 rounded-xl outline-none focus:ring-1 focus:ring-[var(--primary)] border-none"
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="flex flex-col items-center cursor-pointer group p-2"
              onClick={() => user ? navigate('/profile') : setIsLoginModalOpen(true)}
            >
              <User size={20} className="group-hover:text-[var(--primary)]" />
              <span className={`${!user ? 'block' : 'hidden md:block'} text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]`}>
                {user ? (user.displayName?.split(' ')[0] || 'Profile') : 'Login'}
              </span>
            </div>



            <Link to="/wishlist" className="hidden md:flex flex-col items-center relative group">
              <Heart size={20} className="group-hover:text-[var(--primary)]" />
              <span className="hidden md:block text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="hidden md:flex flex-col items-center relative group">
              <ShoppingCart size={20} className="group-hover:text-[var(--primary)]" />
              <span className="hidden md:block text-[10px] font-bold mt-1 uppercase group-hover:text-[var(--primary)]">Bag</span>
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
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter leading-none">
                    PRATHAM<span className="text-[var(--primary)]">KARIGIRI</span>
                  </span>
                  <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-500 mt-1 ml-0.5">
                    Pratham Guru Enterprises
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-2 flex-grow overflow-y-auto bg-gray-50/30 no-scrollbar">


                <div className="px-2 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] opacity-40 mb-6">Collections</p>
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <div key={link.name} className="border-b border-gray-100 last:border-none">
                        <div
                          className="flex items-center justify-between group py-4 cursor-pointer"
                          onClick={() => setExpandedMobileCategory(expandedMobileCategory === link.name ? null : link.name)}
                        >
                          <span className="text-xl font-bold text-gray-800 group-hover:text-[var(--primary)] transition-colors">{link.name}</span>
                          <motion.div
                            animate={{ rotate: expandedMobileCategory === link.name ? 90 : 0 }}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-[var(--primary)] transition-all"
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {expandedMobileCategory === link.name && categoryStructure[link.name] && categoryStructure[link.name].sections && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-gray-50/50 rounded-2xl mb-4"
                            >
                              <div className="p-4 space-y-6">
                                {categoryStructure[link.name].sections.map((section, idx) => (
                                  <div key={idx} className="space-y-3">
                                    <h4 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest opacity-60">
                                      {section.title}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                      {section.items.map(item => (
                                        <Link
                                          key={item}
                                          to={`/shop?category=${link.name}&sub=${item}`}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="text-sm font-medium text-gray-600 hover:text-black py-1"
                                        >
                                          {item}
                                        </Link>
                                      ))}
                                      <Link
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-sm font-bold text-[var(--primary)] py-1 mt-2 flex items-center"
                                      >
                                        View All {link.name} <ChevronRight size={14} className="ml-1" />
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between group py-4 border-b border-gray-100 last:border-none text-red-600"
                      >
                        <span className="text-xl font-bold group-hover:text-red-500 transition-colors">Admin Panel</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-red-500 transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </Link>
                    )}
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
