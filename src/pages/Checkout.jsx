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
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Modal states for adding new data during checkout
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Form states
  const [addressForm, setAddressForm] = useState({ type: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
  const [paymentForm, setPaymentForm] = useState({ type: 'Visa', last4: '', expiry: '', holder: '' });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) setSelectedAddress(addresses[0].id);
    if (paymentMethods.length > 0 && !selectedPayment) setSelectedPayment(paymentMethods[0].id);
  }, [addresses, paymentMethods]);

  if (!user) return <Navigate to="/" />;
  if (items.length === 0 && !isOrdered) return <Navigate to="/shop" />;

  const handleOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert("Please select a shipping address and payment method.");
      return;
    }

    setIsProcessing(true);
    
    const addr = addresses.find(a => a.id === selectedAddress);
    const pay = paymentMethods.find(p => p.id === selectedPayment);

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
      paymentMethod: pay.type,
      totalPrice: getTotal(),
      user: user.uid, // Firebase UID
      email: user.email.toLowerCase()
    };

    try {
      const createdOrder = await createOrder(orderData);
      addOrder(createdOrder);
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

  const onAddPayment = (e) => {
    e.preventDefault();
    const newPay = { ...paymentForm, id: Date.now() };
    addPaymentMethod(newPay);
    setSelectedPayment(newPay.id);
    setShowPaymentModal(false);
    setPaymentForm({ type: 'Visa', last4: '', expiry: '', holder: '' });
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
            <section className="glass-card p-8 premium-shadow border-l-4 border-[var(--primary)]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center text-[var(--primary)]">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-xl font-serif text-[var(--text-main)]">Payment Method</h2>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] flex items-center space-x-1 hover:opacity-70"
                >
                  <Plus size={14} />
                  <span>New Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.length === 0 ? (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="col-span-full p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:border-[var(--primary)] hover:bg-[var(--background)] transition-all group"
                  >
                    <CreditCard size={24} className="text-[var(--text-muted)] mb-2 group-hover:text-[var(--primary)]" />
                    <p className="font-bold text-[var(--text-main)]">No Cards Saved</p>
                    <p className="text-xs text-[var(--text-muted)]">Please add a payment method to continue</p>
                  </button>
                ) : (
                  paymentMethods.map((pay) => (
                    <div 
                      key={pay.id}
                      onClick={() => setSelectedPayment(pay.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                        selectedPayment === pay.id 
                          ? 'border-[var(--primary)] bg-[var(--secondary)]/30' 
                          : 'border-white/40 bg-white/30 hover:border-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-white px-2 py-1 rounded-md">{pay.type}</span>
                        {selectedPayment === pay.id && <CheckCircle size={16} className="text-[var(--primary)]" />}
                      </div>
                      <p className="text-lg font-bold text-[var(--text-main)] mb-1 tracking-[0.2em]">•••• {pay.last4}</p>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase">{pay.holder}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold">{pay.expiry}</p>
                      </div>
                    </div>
                  ))
                )}
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
                disabled={isProcessing || !selectedAddress || !selectedPayment}
                className="btn-primary w-full py-4 mt-8 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Place Order</span>
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
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24} /></button>
              <h3 className="text-2xl font-serif text-[var(--primary)] mb-6">Add New Card</h3>
              <form onSubmit={onAddPayment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Card Holder</label>
                  <input type="text" required value={paymentForm.holder} onChange={(e) => setPaymentForm({...paymentForm, holder: e.target.value})} className="checkout-input uppercase" placeholder="NAME ON CARD" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Type</label>
                    <select value={paymentForm.type} onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})} className="checkout-input">
                      <option>Visa</option><option>MasterCard</option><option>Rupay</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Last 4 Digits</label>
                    <input type="text" required maxLength="4" value={paymentForm.last4} onChange={(e) => setPaymentForm({...paymentForm, last4: e.target.value})} className="checkout-input" placeholder="4242" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Expiry (MM/YY)</label>
                  <input type="text" required value={paymentForm.expiry} onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})} className="checkout-input" placeholder="12/28" />
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Save & Use This Card</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
