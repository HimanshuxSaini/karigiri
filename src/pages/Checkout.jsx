import Navbar from '../components/Navbar';
import { useCartStore, useOrderStore, useUserStore, useAuthStore, useToastStore } from '../store/useStore';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, ChevronRight, Truck, ShieldCheck, Plus, X, Tag, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { createOrder, validateCoupon, incrementCouponUsage, fetchCoupons, getCouponEligibility, fetchOrders } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errorMessages';

const formatCurrency = (amount) => `\u20B9${Number(amount || 0).toLocaleString('en-IN')}`;

const getCouponDiscountLabel = (coupon) => {
  if (coupon.discountType === 'percentage') {
    const maxDiscountText = coupon.maxDiscount ? ` up to ${formatCurrency(coupon.maxDiscount)}` : '';
    return `${coupon.discountPercent || 0}% off${maxDiscountText}`;
  }

  return `${formatCurrency(coupon.discountAmount || 0)} off`;
};

const Checkout = () => {
  const { user } = useAuthStore();
  const { items, getTotal, clearCart, getDeliveryCharges } = useCartStore();
  const { addOrder } = useOrderStore();
  const { addresses, addAddress } = useUserStore();
  const { showToast } = useToastStore();

  const [isOrdered, setIsOrdered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Modal states for adding new data during checkout
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Form states
  const [addressForm, setAddressForm] = useState({ type: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponListError, setCouponListError] = useState('');

  // User orders state for first delivery coupon validation
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const loadUserOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const allOrders = await fetchOrders();
        const filtered = (allOrders || []).filter(o => 
          o && (o.user === user.uid || (o.email && user.email && o.email.toLowerCase() === user.email.toLowerCase()))
        );
        setUserOrders(filtered);
      } catch (err) {
        console.error("Failed to load user orders for coupon validation:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadUserOrders();
  }, [user]);

  const cartTotal = getTotal();
  const deliveryCharges = getDeliveryCharges();
  const isFirstOrder = userOrders.length === 0;
  const isFirstDeliveryCouponApplied = appliedCoupon?.code?.toUpperCase() === 'FIRSTDELIVERY';
  const actualDeliveryCharges = (isFirstDeliveryCouponApplied && isFirstOrder) ? 0 : deliveryCharges;
  const finalTotal = Math.max(0, cartTotal - couponDiscount + actualDeliveryCharges);
  
  const appliedCouponId = appliedCoupon?._id || appliedCoupon?.id;
  
  const displayedCoupons = isFirstOrder 
    ? [
        {
          _id: 'firstdelivery-id',
          id: 'firstdelivery-id',
          code: 'FIRSTDELIVERY',
          discountType: 'delivery',
          discountAmount: deliveryCharges,
          description: 'Free delivery on your first order. Use code FIRSTDELIVERY.',
          minOrderAmount: 0,
          isActive: true
        },
        ...coupons
      ]
    : coupons;

  const couponCards = displayedCoupons
    .map((coupon) => {
      if (coupon.code === 'FIRSTDELIVERY') {
        return {
          ...coupon,
          couponId: 'firstdelivery-id',
          eligibility: { valid: true, discount: deliveryCharges, message: 'Free delivery applied' }
        };
      }
      return {
        ...coupon,
        couponId: coupon._id || coupon.id,
        eligibility: getCouponEligibility(coupon, cartTotal)
      };
    })
    .sort((firstCoupon, secondCoupon) => {
      if (firstCoupon.eligibility.valid !== secondCoupon.eligibility.valid) {
        return Number(secondCoupon.eligibility.valid) - Number(firstCoupon.eligibility.valid);
      }

      if ((firstCoupon.isActive !== false) !== (secondCoupon.isActive !== false)) {
        return Number(secondCoupon.isActive !== false) - Number(firstCoupon.isActive !== false);
      }

      return (firstCoupon.minOrderAmount || 0) - (secondCoupon.minOrderAmount || 0);
    });

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const normalizedCode = codeToApply.trim().toUpperCase();
    if (!normalizedCode) return;

    setCouponCode(normalizedCode);
    setCouponLoading(true);
    setCouponMessage({ text: '', type: '' });

    if (normalizedCode === 'FIRSTDELIVERY') {
      if (!isFirstOrder) {
        setCouponMessage({ text: 'The FIRSTDELIVERY coupon is only valid for your first order.', type: 'error' });
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponLoading(false);
        return;
      }
      setAppliedCoupon({
        _id: 'firstdelivery-id',
        id: 'firstdelivery-id',
        code: 'FIRSTDELIVERY',
        discountType: 'delivery',
        discountAmount: deliveryCharges,
        description: 'Free delivery on your first order'
      });
      setCouponDiscount(0);
      setCouponMessage({ text: 'Coupon applied! Your delivery charge is now ₹0.', type: 'success' });
      setCouponLoading(false);
      return;
    }

    try {
      const result = await validateCoupon(normalizedCode, cartTotal);
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);
        setCouponMessage({ text: result.message, type: 'success' });
      } else {
        setCouponMessage({ text: result.message, type: 'error' });
        setAppliedCoupon(null);
        setCouponDiscount(0);
      }
    } catch {
      setCouponMessage({ text: 'Failed to validate coupon', type: 'error' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponMessage({ text: '', type: '' });
  };

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0].id);
    }
  }, [addresses, selectedAddress]);

  useEffect(() => {
    let isMounted = true;

    const loadCoupons = async () => {
      setCouponsLoading(true);
      setCouponListError('');

      try {
        const fetchedCoupons = await fetchCoupons();
        if (isMounted) {
          setCoupons(fetchedCoupons);
        }
      } catch (error) {
        console.error('Failed to load coupons:', error);
        if (isMounted) {
          setCoupons([]);
          setCouponListError('We could not load coupon offers right now. You can still enter a code manually.');
        }
      } finally {
        if (isMounted) {
          setCouponsLoading(false);
        }
      }
    };

    loadCoupons();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!appliedCoupon) return;

    if (appliedCoupon.code === 'FIRSTDELIVERY') {
      if (!isFirstOrder) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage({
          text: 'FIRSTDELIVERY removed. Only valid for your first order.',
          type: 'error'
        });
      }
      return;
    }

    const latestAppliedCoupon =
      coupons.find((coupon) => (coupon._id || coupon.id) === appliedCouponId) || appliedCoupon;
    const updatedCouponState = getCouponEligibility(latestAppliedCoupon, cartTotal);

    if (!updatedCouponState.valid) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponMessage({
        text: `${latestAppliedCoupon.code} removed. ${updatedCouponState.message}`,
        type: 'error'
      });
      return;
    }

    if (updatedCouponState.discount !== couponDiscount || latestAppliedCoupon !== appliedCoupon) {
      setAppliedCoupon(latestAppliedCoupon);
      setCouponDiscount(updatedCouponState.discount);
      setCouponMessage({ text: updatedCouponState.message, type: 'success' });
    }
  }, [appliedCoupon, appliedCouponId, cartTotal, couponDiscount, coupons, isFirstOrder]);

  if (!user) return <Navigate to="/" />;
  if (items.length === 0 && !isOrdered) return <Navigate to="/shop" />;

  const handleOrder = async () => {
    if (!selectedAddress) {
      showToast("Please select a shipping address.", "error");
      return;
    }

    setIsProcessing(true);
    
    const addr = addresses.find(a => a.id === selectedAddress);

    const orderId = `KG-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const orderData = {
      orderItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        size: item.size || 'One Size',
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
      subtotal: cartTotal,
      couponCode: appliedCoupon?.code || null,
      couponDiscount: couponDiscount,
      deliveryCharges: actualDeliveryCharges,
      totalPrice: finalTotal,
      user: user.uid,
      email: user.email.toLowerCase()
    };

    try {
      const createdOrder = await createOrder(orderData);
      addOrder(createdOrder);
      
      // Redirect to WhatsApp
      const whatsappNumber = "917027311213";
      // Increment coupon usage if applied
      if (appliedCoupon?._id) {
        await incrementCouponUsage(appliedCoupon._id);
      }

      let message = `*Hello Karigiri, I would like to complete my payment!*\n\n`;
      message += `*Order ID:* ${createdOrder._id || orderId}\n\n`;
      message += `*Items Ordered:*\n`;
      items.forEach(item => {
          message += `- ${item.name} x${item.quantity} (${formatCurrency(item.price)})${item.size && item.size !== 'One Size' ? ` [Size: ${item.size}]` : ''}\n\n`;
      });
      if (couponDiscount > 0) {
        message += `*Coupon:* ${appliedCoupon?.code} (-${formatCurrency(couponDiscount)})\n`;
      }
      if (actualDeliveryCharges > 0) {
        message += `*Delivery Charges:* ${formatCurrency(actualDeliveryCharges)}\n`;
      } else if (isFirstDeliveryCouponApplied) {
        message += `*Delivery Charges:* Free (First Order Coupon)\n`;
      }
      message += `*Total Amount:* ${formatCurrency(finalTotal)}\n\n`;
      message += `*(Note: The admin will verify these details against the securely saved Order ID in the system before providing the QR code.)*`;
      
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

      setIsOrdered(true);
      clearCart();
    } catch (err) {
      console.error("Order failed:", err);
      showToast(getFriendlyErrorMessage('FAILED TO PLACE ORDER'), "error");
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
        <Motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full glass-card p-12 text-center premium-shadow"
        >
          <div className="flex justify-center mb-8">
            <Motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="bg-emerald-100 p-6 rounded-3xl"
            >
              <CheckCircle size={64} className="text-emerald-600" />
            </Motion.div>
          </div>
          <h2 className="text-4xl font-serif text-[var(--primary)] mb-4">Crafting Your Order</h2>
          <p className="text-[var(--text-muted)] mb-10 leading-relaxed">
            Thank you for choosing Karigiri. We've received your order and our artisans are beginning their work. You'll receive updates via email.
          </p>
          <div className="space-y-4">
            <Link to="/profile" className="btn-primary block w-full text-center py-4">View My Orders</Link>
            <Link to="/" className="block w-full text-center text-sm font-bold text-[var(--primary)] uppercase tracking-widest hover:opacity-70 transition-opacity">Return to Gallery</Link>
          </div>
        </Motion.div>
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

      <div className="pt-20 md:pt-32 pb-24 max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          
          {/* Checkout Steps */}
          <div className="flex-grow space-y-6 md:space-y-8">
            <header className="mb-6 md:mb-10">
              <h1 className="text-2xl md:text-4xl font-serif text-[var(--primary)] mb-2">Secure Checkout</h1>
              <p className="text-xs md:text-sm text-[var(--text-muted)]">Complete your purchase to bring home handcrafted excellence.</p>
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

            {/* Step 2: Coupon Code */}
            <section className="glass-card p-6 md:p-8 premium-shadow border-l-4 border-purple-500">
              <div className="flex items-center space-x-4 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <Tag size={20} />
                </div>
                <h2 className="text-lg md:text-xl font-serif text-[var(--text-main)]">Apply Coupon</h2>
              </div>

              {appliedCoupon && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <Tag size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">{appliedCoupon.code}</p>
                      <p className="text-xs text-emerald-600">You save {formatCurrency(couponDiscount)}</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-grow px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 text-sm font-bold uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 min-w-[120px]"
                  >
                    {couponLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Apply</span>}
                  </button>
                </div>

                {couponMessage.text && (
                  <p className={`text-xs font-bold ${couponMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-600">Available Coupons</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Bag total {formatCurrency(cartTotal)}
                  </p>
                </div>

                {couponsLoading ? (
                  <div className="rounded-2xl border border-purple-100 bg-white/70 px-4 py-5 flex items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
                    <Loader2 size={16} className="animate-spin text-purple-500" />
                    <span>Loading coupon offers...</span>
                  </div>
                ) : couponListError ? (
                  <p className="text-xs font-semibold text-red-500">{couponListError}</p>
                ) : couponCards.length === 0 ? (
                  <p className="text-xs font-semibold text-[var(--text-muted)]">No coupons are available right now.</p>
                ) : (
                  <div className="space-y-3">
                    {couponCards.map((coupon) => {
                      const isApplied = appliedCouponId === coupon.couponId;
                      const isCouponApplying = couponLoading && couponCode === coupon.code;
                      const remainingUses = coupon.usageLimit
                        ? Math.max(coupon.usageLimit - (coupon.usedCount || 0), 0)
                        : null;

                      return (
                        <div
                          key={coupon.couponId}
                          className={`rounded-2xl border p-4 transition-all ${
                            isApplied
                              ? 'border-emerald-300 bg-emerald-50/90'
                              : coupon.eligibility.valid
                                ? 'border-emerald-100 bg-white/80'
                                : 'border-red-100 bg-red-50/60'
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-[11px] font-black tracking-wider">
                                  {coupon.code}
                                </span>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    isApplied || coupon.eligibility.valid
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-red-100 text-red-600'
                                  }`}
                                >
                                  {isApplied ? 'Applied' : coupon.eligibility.valid ? 'Eligible' : 'Criteria'}
                                </span>
                              </div>

                              <p className="mt-3 text-sm font-bold text-[var(--text-main)]">
                                {coupon.description || getCouponDiscountLabel(coupon)}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] shadow-sm">
                                  {getCouponDiscountLabel(coupon)}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] shadow-sm">
                                  {coupon.minOrderAmount ? `Min. order ${formatCurrency(coupon.minOrderAmount)}` : 'No minimum order'}
                                </span>
                                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] shadow-sm">
                                  {remainingUses === null ? 'Unlimited use' : `${remainingUses} uses left`}
                                </span>
                              </div>

                              <p className={`mt-3 text-xs font-semibold ${coupon.eligibility.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                                {coupon.eligibility.valid
                                  ? coupon.eligibility.discount > 0
                                    ? `Use this now and save ${formatCurrency(coupon.eligibility.discount)} on your current bag.`
                                    : 'This coupon is ready to use on your current bag.'
                                  : coupon.eligibility.message}
                              </p>
                            </div>

                            <button
                              onClick={() => handleApplyCoupon(coupon.code)}
                              disabled={couponLoading || isApplied || !coupon.eligibility.valid}
                              className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[132px] flex items-center justify-center gap-2"
                            >
                              {isApplied ? (
                                <span>Applied</span>
                              ) : isCouponApplying ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  <span>Applying</span>
                                </>
                              ) : (
                                <span>{coupon.eligibility.valid ? 'Use Coupon' : 'Unavailable'}</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Step 3: How it Works */}
            <section className="glass-card p-6 md:p-8 premium-shadow border-l-4 border-emerald-500">
              <div className="flex items-center space-x-4 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-lg md:text-xl font-serif text-[var(--text-main)]">How it Works</h2>
              </div>

              <div className="bg-emerald-50/50 p-4 md:p-6 rounded-2xl border border-emerald-100/50">
                <p className="text-xs md:text-sm text-emerald-800 font-medium leading-relaxed">
                  Your order will be processed directly with our artisan team via WhatsApp. 
                  We will confirm your order details, share final product images, and coordinate delivery directly with you for a truly handcrafted experience.
                </p>
                <div className="mt-4 flex items-center space-x-3 text-emerald-700">
                  <ShieldCheck size={18} />
                  <span className="font-bold text-[10px] uppercase tracking-widest">Handcrafted & Authenticated via WhatsApp</span>
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
                  <div key={item.cartItemId || item.id} className="flex space-x-4">
                    <div className="relative aspect-[3/4] w-16 bg-[var(--secondary)] rounded-xl overflow-hidden border border-white/40 shadow-sm">
                      <img src={item.image?.includes('cloudinary.com') ? item.image.replace('/upload/', '/upload/w_100,q_auto:eco,f_auto/') : item.image} className="w-full h-full object-contain" alt={item.name} loading="lazy" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{item.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {item.category} {item.size && item.size !== 'One Size' && `• Size: ${item.size}`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm font-bold text-[var(--text-main)]">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Subtotal</span>
                  <span className="font-bold text-[var(--text-main)]">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Delivery Charges</span>
                  {actualDeliveryCharges > 0 ? (
                    <span className="font-bold text-[var(--text-main)]">{formatCurrency(actualDeliveryCharges)}</span>
                  ) : (
                    <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">
                      {isFirstDeliveryCouponApplied ? 'Free (First Order)' : 'Free'}
                    </span>
                  )}
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center space-x-1"><Tag size={12} /><span>Coupon ({appliedCoupon?.code})</span></span>
                    <span className="font-bold text-emerald-600">-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl pt-4 border-t border-white/20">
                  <span className="font-serif text-[var(--primary)]">Total</span>
                  <span className="font-bold text-[var(--primary)]">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <div className="hidden md:block">
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
              </div>

              <div className="mt-6 flex items-center justify-center space-x-3 text-[var(--text-muted)]">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">Secure Encryption</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Sticky CTA Bar */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
           <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Total Order</p>
                  <p className="text-xl font-black text-[var(--primary)]">{formatCurrency(finalTotal)}</p>
               </div>
              <button 
                onClick={handleOrder}
                disabled={isProcessing || !selectedAddress}
                className="bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {isProcessing ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Order Now</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
           </div>
        </div>
      </div>

      {/* Modals for Adding Address/Payment */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <Motion.div 
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
            </Motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Checkout;
