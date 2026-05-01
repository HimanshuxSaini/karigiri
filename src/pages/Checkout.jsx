import Navbar from '../components/Navbar';
import { useCartStore, useOrderStore, useUserStore, useAuthStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, CreditCard, ChevronRight, ShoppingBag, Truck, ShieldCheck, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const Checkout = () => {
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { addresses, paymentMethods, addAddress, addPaymentMethod } = useUserStore();

  const [isOrdered, setIsOrdered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Modal states for adding new data during checkout
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Form states
  const [addressForm, setAddressForm] = useState({ type: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) setSelectedAddress(addresses[0].id);
  }, [addresses]);

  if (!user) return <Navigate to="/" />;
  if (items.length === 0 && !isOrdered) return <Navigate to="/shop" />;

  const handleOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a shipping address.");
      return;
    }

    setIsProcessing(true);
    
    const addr = addresses.find(a => a.id === selectedAddress);

    const orderId = `KG-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const trackingId = `TRK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const orderData = {
      orderItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item._id || item.id // Ensure we pass the database ID if available
      })),
      shippingAddress: {
        address: addr.street,
        city: addr.city,
        postalCode: addr.pincode,
        state: addr.state,
        phone: addr.phone
      },
      paymentMethod: "WhatsApp / QR Code",
      totalPrice: getTotal(),
      user: user.uid, // Firebase UID
      email: user.email.toLowerCase()
    };

    try {
      const createdOrder = await createOrder(orderData);
      addOrder(createdOrder);
      
      // Redirect to WhatsApp
      const whatsappNumber = "917027311213";
      let message = `*Hello Karigiri, I would like to complete my payment!*\n\n`;
      message += `*Order ID:* ${createdOrder._id || orderId}\n\n`;
      message += `*Items Ordered:*\n`;
      items.forEach(item => {
          message += `- ${item.name} x${item.quantity} (₹${item.price.toLocaleString('en-IN')})\n\n`;
      });
      message += `*Total Amount:* ₹${getTotal().toLocaleString('en-IN')}\n\n`;
      message += `*(Note: The admin will verify these details against the securely saved Order ID in the system before providing the QR code.)*`;
      
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

      setIsOrdered(true);
      clearCart();
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onAddAddress = (e) => {
    e.preventDefault();
    const newAddr = { ...addressForm, id: Date.now() };
    addAddress(newAddr);
    setSelectedAddress(newAddr.id);
    setShowAddressModal(false);
    setAddressForm({ type: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass-card p-12 text-center premium-shadow"
        >
          <div className="flex justify-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="bg-emerald-100 p-6 rounded-3xl"
            >
              <CheckCircle size={64} className="text-emerald-600" />
            </motion.div>
          </div>
          <h2 className="text-4xl font-serif text-[var(--primary)] mb-4">Crafting Your Order</h2>
          <p className="text-[var(--text-muted)] mb-10 leading-relaxed">
            Thank you for choosing Karigiri. We've received your order and our artisans are beginning their work. You'll receive updates via email.
          </p>
          <div className="space-y-4">
            <Link to="/profile" className="btn-primary block w-full text-center py-4">View My Orders</Link>
            <Link to="/" className="block w-full text-center text-sm font-bold text-[var(--primary)] uppercase tracking-widest hover:opacity-70 transition-opacity">Return to Gallery</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--primary)] opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--primary)] opacity-[0.03] blur-[120px] rounded-full"></div>
      </div>

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Checkout Steps */}
          <div className="flex-grow space-y-8">
            <header className="mb-10">
              <h1 className="text-4xl font-serif text-[var(--primary)] mb-2">Secure Checkout</h1>
              <p className="text-[var(--text-muted)]">Complete your purchase to bring home handcrafted excellence.</p>
            </header>

            {/* Step 1: Shipping */}
            <section className="glass-card p-8 premium-shadow border-l-4 border-[var(--primary)]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center text-[var(--primary)]">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-xl font-serif text-[var(--text-main)]">Shipping Destination</h2>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center space-x-1 hover:opacity-70"
                >
                  <Plus size={14} />
                  <span>New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="col-span-full p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:border-[var(--primary)] hover:bg-[var(--background)] transition-all group"
                  >
                    <MapPin size={24} className="text-[var(--text-muted)] mb-2 group-hover:text-[var(--primary)]" />
                    <p className="font-bold text-[var(--text-main)]">No Addresses Saved</p>
                    <p className="text-xs text-[var(--text-muted)]">Please add a shipping address to continue</p>
                  </button>
                ) : (
                  addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        selectedAddress === addr.id 
                          ? 'border-[var(--primary)] bg-[var(--secondary)]/30' 
                          : 'border-white/40 bg-white/30 hover:border-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-white px-2 py-1 rounded-md">{addr.type}</span>
                        {selectedAddress === addr.id && <CheckCircle size={16} className="text-[var(--primary)]" />}
                      </div>
                      <p className="text-sm font-bold text-[var(--text-main)] mb-1">{addr.street}</p>
                      <p className="text-xs text-[var(--text-muted)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-2 font-bold tracking-widest">PH: {addr.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Step 2: Payment */}
            <section className="glass-card p-8 premium-shadow border-l-4 border-emerald-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-serif text-[var(--text-main)]">Payment via WhatsApp</h2>
              </div>

              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
                <p className="text-[var(--text-muted)] leading-relaxed">
                  To ensure a secure and personalized experience, we process all payments via WhatsApp. Once you place the order, you will be redirected to WhatsApp with your order details. We will share a QR Code for secure UPI payment.
                </p>
                <div className="mt-4 flex items-center space-x-3 text-emerald-700">
                  <ShieldCheck size={20} />
                  <span className="font-bold text-sm tracking-widest uppercase">100% Secure & Verified</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: Order Summary */}
          <aside className="w-full lg:w-[400px]">
            <div className="glass-card p-8 premium-shadow sticky top-32">
              <h2 className="text-2xl font-serif text-[var(--primary)] mb-8">Order Summary</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="relative">
                      <img src={item.image} className="w-16 h-16 object-cover rounded-xl border border-white/40 shadow-sm" alt={item.name} />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{item.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.category}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm font-bold text-[var(--text-main)]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Subtotal</span>
                  <span className="font-bold text-[var(--text-main)]">₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Shipping</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-xl pt-4 border-t border-white/20">
                  <span className="font-serif text-[var(--primary)]">Total</span>
                  <span className="font-bold text-[var(--primary)]">₹{getTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handleOrder}
                disabled={isProcessing || !selectedAddress}
                className="btn-primary w-full py-4 mt-8 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group !bg-[#25D366] hover:!bg-[#128C7E] !border-[#25D366] !text-white"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="font-bold">Place Order on WhatsApp</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center space-x-3 text-[var(--text-muted)]">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Secure Encryption</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals for Adding Address/Payment */}
      <AnimatePresence>
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
              <button onClick={() => setShowAddressModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24} /></button>
              <h3 className="text-2xl font-serif text-[var(--primary)] mb-6">New Shipping Address</h3>
              <form onSubmit={onAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Type</label>
                    <select value={addressForm.type} onChange={(e) => setAddressForm({...addressForm, type: e.target.value})} className="checkout-input">
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Phone</label>
                    <input type="text" required value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} className="checkout-input" placeholder="9999999999" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Street Address</label>
                  <input type="text" required value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} className="checkout-input" placeholder="House No, Street, Area" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">City</label>
                    <input type="text" required value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="checkout-input" placeholder="City" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">State</label>
                    <input type="text" required value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="checkout-input" placeholder="State" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Pincode</label>
                  <input type="text" required value={addressForm.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} className="checkout-input" placeholder="110001" />
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Save & Use This Address</button>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Checkout;
