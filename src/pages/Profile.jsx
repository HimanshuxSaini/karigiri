import Navbar from '../components/Navbar';
import { useAuthStore, useOrderStore, useWishlistStore, useUserStore, useCartStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  User as UserIcon, 
  LogOut, 
  ChevronRight, 
  Heart, 
  Settings, 
  MapPin, 
  CreditCard,
  ShoppingBag,
  Bell,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  Truck
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { auth as firebaseAuth } from '../firebase/config';
import { useState } from 'react';
import { updateProfile } from 'firebase/auth';

const Profile = () => {
  const { user, logout, setUser } = useAuthStore();
  const { orders } = useOrderStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { addresses, addAddress, removeAddress, paymentMethods, addPaymentMethod, removePaymentMethod } = useUserStore();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addedToCart, setAddedToCart] = useState(null);

  // Form States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [addressForm, setAddressForm] = useState({ type: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
  const [paymentForm, setPaymentForm] = useState({ type: 'Visa', last4: '', expiry: '', holder: '' });

  if (!user) return <Navigate to="/auth" />;

  const handleLogout = () => {
    firebaseAuth.signOut();
    logout();
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, { displayName });
        setUser({ ...user, displayName });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    addAddress(addressForm);
    setShowAddressModal(false);
    setAddressForm({ type: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    addPaymentMethod(paymentForm);
    setShowPaymentModal(false);
    setPaymentForm({ type: 'Visa', last4: '', expiry: '', holder: '' });
  };

  const handleAddToBag = (product) => {
    addItem(product);
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 3000);
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Account', icon: Settings },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      {/* Decorative Header Background */}
      <div className="h-64 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] w-full absolute top-0 left-0 opacity-10 blur-3xl pointer-events-none" />
      
      <div className="pt-32 pb-24 max-w-6xl mx-auto px-4 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Sidebar / User Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div variants={itemVariants} className="glass-card p-8 text-center premium-shadow">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-4xl font-serif shadow-xl">
                  {user.email ? user.email[0].toUpperCase() : <UserIcon size={40} />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              
              <h2 className="text-2xl font-serif text-[var(--text-main)] mb-1 break-all">
                {user.displayName || user.email.split('@')[0]}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">{user.email}</p>
              
              <div className="flex justify-center space-x-4 mb-8">
                <div className="text-center px-4 py-2 bg-[var(--background)] rounded-xl">
                  <p className="text-xl font-bold text-[var(--primary)]">{orders.length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Orders</p>
                </div>
                <div className="text-center px-4 py-2 bg-[var(--background)] rounded-xl">
                  <p className="text-xl font-bold text-[var(--primary)]">{wishlist.length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Saved</p>
                </div>
              </div>

              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 font-medium text-sm ${
                      activeTab === tab.id 
                        ? 'bg-[var(--primary)] text-white shadow-lg' 
                        : 'text-[var(--text-muted)] hover:bg-white hover:text-[var(--primary)]'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <hr className="my-6 border-white/20" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-6 py-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm uppercase tracking-widest"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="glass-card p-6 premium-shadow hidden lg:block">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-4">Quick Support</h4>
              <div className="space-y-4">
                <a href="https://wa.me/91XXXXXXXXXX" className="flex items-center space-x-3 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                  <Bell size={16} />
                  <span>Order Updates</span>
                </a>
                <Link to="/shop" className="flex items-center space-x-3 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                  <ShoppingBag size={16} />
                  <span>Browse Collections</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="glass-card p-8 premium-shadow min-h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-serif text-[var(--primary)]">Order History</h3>
                        <p className="text-sm text-[var(--text-muted)]">Track and manage your recent purchases</p>
                      </div>
                      <div className="p-3 bg-[var(--secondary)] rounded-2xl text-[var(--primary)]">
                        <Package size={24} />
                      </div>
                    </div>

                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mb-6 text-[var(--text-muted)]">
                          <ShoppingBag size={32} />
                        </div>
                        <p className="text-[var(--text-muted)] font-medium mb-6">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="btn-primary">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedOrder(order)}
                            className="p-6 rounded-2xl border border-white/40 hover:border-[var(--primary-light)] transition-all bg-white/30 group cursor-pointer"
                          >
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                              <div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                                  Order #{order.id || Math.random().toString(36).substr(2, 9).toUpperCase()}
                                </p>
                                <p className="text-sm font-bold text-[var(--text-main)]">
                                  Placed on {new Date(order.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                  order.status === 'Processing' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {order.status || 'Delivered'}
                                </span>
                                <p className="mt-2 text-lg font-serif text-[var(--primary)]">
                                  ₹{order.total.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                              <div className="flex -space-x-3 overflow-hidden">
                                {order.items.slice(0, 4).map((item, i) => (
                                  <div key={i} className="relative">
                                    <img 
                                      src={item.image} 
                                      className="w-12 h-12 rounded-xl border-4 border-[var(--card-bg)] object-cover shadow-md group-hover:scale-110 transition-transform" 
                                      alt="product" 
                                    />
                                  </div>
                                ))}
                                {order.items.length > 4 && (
                                  <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-[10px] font-black text-[var(--primary)] border-4 border-[var(--card-bg)] shadow-md">
                                    +{order.items.length - 4}
                                  </div>
                                )}
                              </div>
                              <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:translate-x-2 transition-transform">
                                <span>Details</span>
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card p-8 premium-shadow min-h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-serif text-[var(--primary)]">My Wishlist</h3>
                        <p className="text-sm text-[var(--text-muted)]">Items you've saved for later</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                        <Heart size={24} />
                      </div>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mb-6 text-[var(--text-muted)]">
                          <Heart size={32} />
                        </div>
                        <p className="text-[var(--text-muted)] font-medium mb-6">Your wishlist is empty.</p>
                        <Link to="/shop" className="btn-primary">
                          Explore Products
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {wishlist.map((product) => (
                          <motion.div 
                            key={product.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col p-4 rounded-2xl bg-white/30 border border-white/40 group hover:shadow-lg transition-all"
                          >
                            <div className="flex space-x-4 mb-4">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-20 h-24 object-cover rounded-xl shadow-sm"
                              />
                              <div className="flex flex-col justify-between py-1 flex-grow">
                                <div>
                                  <h4 className="font-serif text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors text-sm">{product.name}</h4>
                                  <p className="text-lg font-bold text-[var(--primary)] mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                                </div>
                                <Link 
                                  to={`/product/${product.id}`}
                                  className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center space-x-1 hover:text-[var(--primary)]"
                                >
                                  <span>Details</span>
                                  <ChevronRight size={12} />
                                </Link>
                              </div>
                              <button 
                                onClick={() => toggleWishlist(product)}
                                className="self-start p-2 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <button 
                              onClick={() => handleAddToBag(product)}
                              className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center space-x-2 ${
                                addedToCart === product.id 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-[var(--primary)] text-white hover:shadow-xl hover:-translate-y-0.5'
                              }`}
                            >
                              {addedToCart === product.id ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <ShoppingBag size={14} />
                              )}
                              <span>{addedToCart === product.id ? 'Added to Bag' : 'Add to Bag'}</span>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="glass-card p-8 premium-shadow min-h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-serif text-[var(--primary)]">Account Settings</h3>
                        <p className="text-sm text-[var(--text-muted)]">Manage your profile and preferences</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                        <Settings size={24} />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <section>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-6">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Display Name</label>
                            <input 
                              type="text" 
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="checkout-input"
                              placeholder="Your Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Email Address</label>
                            <input 
                              type="email" 
                              value={user.email} 
                              disabled
                              className="checkout-input opacity-60 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)]">Shipping Addresses</h4>
                          <button 
                            onClick={() => setShowAddressModal(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center space-x-1 hover:opacity-70"
                          >
                            <Plus size={14} />
                            <span>Add New</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.length === 0 ? (
                            <div 
                              onClick={() => setShowAddressModal(true)}
                              className="p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:border-[var(--primary)] hover:bg-[var(--background)] transition-all cursor-pointer group col-span-full"
                            >
                              <MapPin size={24} className="text-[var(--text-muted)] mb-2 group-hover:text-[var(--primary)]" />
                              <p className="text-sm font-bold text-[var(--text-main)]">Add New Address</p>
                              <p className="text-xs text-[var(--text-muted)]">Set a default shipping destination</p>
                            </div>
                          ) : (
                            addresses.map((addr) => (
                              <div key={addr.id} className="p-4 rounded-xl border border-white/40 bg-white/30 relative group">
                                <span className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }}>
                                  <Trash2 size={14} />
                                </span>
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin size={14} className="text-[var(--primary)]" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">{addr.type}</span>
                                </div>
                                <p className="text-sm font-bold text-[var(--text-main)] mb-1">{addr.street}</p>
                                <p className="text-xs text-[var(--text-muted)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-2 font-bold tracking-widest uppercase">PH: {addr.phone}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)]">Saved Payments</h4>
                          <button 
                            onClick={() => setShowPaymentModal(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center space-x-1 hover:opacity-70"
                          >
                            <Plus size={14} />
                            <span>Add New</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {paymentMethods.length === 0 ? (
                            <div 
                              onClick={() => setShowPaymentModal(true)}
                              className="p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:border-[var(--primary)] hover:bg-[var(--background)] transition-all cursor-pointer group col-span-full"
                            >
                              <CreditCard size={24} className="text-[var(--text-muted)] mb-2 group-hover:text-[var(--primary)]" />
                              <p className="text-sm font-bold text-[var(--text-main)]">Add Payment Method</p>
                              <p className="text-xs text-[var(--text-muted)]">Securely save cards for faster checkout</p>
                            </div>
                          ) : (
                            paymentMethods.map((pay) => (
                              <div key={pay.id} className="p-4 rounded-xl border border-white/40 bg-white/30 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--primary)] opacity-5 rounded-bl-full"></div>
                                <span className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10" onClick={(e) => { e.stopPropagation(); removePaymentMethod(pay.id); }}>
                                  <Trash2 size={14} />
                                </span>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-2">
                                    <CreditCard size={14} className="text-[var(--primary)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">{pay.type}</span>
                                  </div>
                                </div>
                                <p className="text-lg font-bold text-[var(--text-main)] mb-1 tracking-[0.2em]">•••• {pay.last4}</p>
                                <div className="flex justify-between items-end mt-4">
                                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">{pay.holder}</p>
                                  <p className="text-[10px] text-[var(--text-muted)] font-bold">{pay.expiry}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      <div className="pt-6 relative">
                        <button 
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="btn-primary w-full md:w-auto px-12 flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <span>Save Changes</span>
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {saveSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden md:flex items-center space-x-2 text-green-600 font-bold text-sm whitespace-nowrap"
                            >
                              <CheckCircle2 size={18} />
                              <span>Profile updated successfully!</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] p-8 flex justify-between items-start">
                <div>
                  <h3 className="text-white font-serif text-3xl">Order Details</h3>
                  <p className="text-white/70 text-xs font-black uppercase tracking-widest mt-1">Order #{selectedOrder.id || 'N/A'}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><Clock size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Placed On</p>
                      <p className="text-sm font-bold text-[var(--text-main)]">{new Date(selectedOrder.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><Truck size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Status</p>
                      <p className="text-sm font-bold text-amber-600">{selectedOrder.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><MapPin size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Location</p>
                      <p className="text-sm font-bold text-[var(--text-main)]">{selectedOrder.shippingAddress?.city || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><CheckCircle2 size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Tracking ID</p>
                      <p className="text-sm font-bold text-[var(--text-main)]">{selectedOrder.trackingId || 'TRK-' + (selectedOrder.id || '...').slice(-6)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-10 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4 flex items-center space-x-2">
                    <MapPin size={14} />
                    <span>Shipping Address</span>
                  </h4>
                  <p className="text-sm font-bold text-[var(--text-main)] mb-1">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                  <p className="text-xs font-bold text-[var(--primary)] mt-2">Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>

                <div className="space-y-6 mb-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Order Items</h4>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50/50">
                      <img src={item.image} className="w-16 h-16 object-cover rounded-xl shadow-sm" alt="" />
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-[var(--text-main)]">{item.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[var(--primary)]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[var(--secondary)]/30 rounded-3xl p-6">
                   <div className="flex justify-between mb-2">
                     <span className="text-sm text-[var(--text-muted)]">Items Subtotal</span>
                     <span className="text-sm font-bold text-[var(--text-main)]">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between mb-4">
                     <span className="text-sm text-[var(--text-muted)]">Shipping</span>
                     <span className="text-sm font-bold text-emerald-600">FREE</span>
                   </div>
                   <div className="flex justify-between pt-4 border-t border-white/50">
                     <span className="font-serif text-xl text-[var(--primary)]">Total Paid</span>
                     <span className="text-xl font-bold text-[var(--primary)]">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 flex justify-end space-x-4">
                 <button className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center space-x-2">
                   <Bell size={16} />
                   <span>Track Package</span>
                 </button>
                 <button className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:shadow-lg transition-all flex items-center space-x-2">
                   <ExternalLink size={16} />
                   <span>Need Help?</span>
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative z-10"
            >
              <button onClick={() => setShowAddressModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-serif text-[var(--primary)] mb-6">Add New Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Type</label>
                    <select 
                      value={addressForm.type}
                      onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                      className="checkout-input"
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Phone</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                      className="checkout-input" 
                      placeholder="9999999999"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Street / Locality</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    className="checkout-input" 
                    placeholder="House No. 123, Block B"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">City</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="checkout-input" 
                      placeholder="Delhi"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">State</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="checkout-input" 
                      placeholder="Delhi"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Pincode</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                    className="checkout-input" 
                    placeholder="110001"
                  />
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Save Address</button>
              </form>
            </motion.div>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative z-10"
            >
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-serif text-[var(--primary)] mb-6">Add Payment Method</h3>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Card Holder Name</label>
                  <input 
                    type="text" 
                    required
                    value={paymentForm.holder}
                    onChange={(e) => setPaymentForm({...paymentForm, holder: e.target.value})}
                    className="checkout-input uppercase" 
                    placeholder="JOHN DOE"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Card Type</label>
                  <select 
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                    className="checkout-input"
                  >
                    <option>Visa</option>
                    <option>MasterCard</option>
                    <option>Rupay</option>
                    <option>Amex</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Last 4 Digits</label>
                    <input 
                      type="text" 
                      required
                      maxLength="4"
                      value={paymentForm.last4}
                      onChange={(e) => setPaymentForm({...paymentForm, last4: e.target.value})}
                      className="checkout-input" 
                      placeholder="4242"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Expiry</label>
                    <input 
                      type="text" 
                      required
                      value={paymentForm.expiry}
                      onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                      className="checkout-input" 
                      placeholder="MM/YY"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Save Payment Method</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
