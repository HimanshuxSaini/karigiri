import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const formatCurrency = (amount) => `\u20B9${Number(amount || 0).toLocaleString('en-IN')}`;

const getAuthToken = async () => {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    return null; // Return null instead of throwing for public routes
  }
  return user.getIdToken();
};

const getAdminToken = async () => {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please log in again to continue');
  }
  return user.getIdToken();
};

const authenticatedFetch = async (path, options = {}) => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
};

const adminFetch = async (path, options = {}) => {
  const token = await getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Admin request failed');
  }

  return payload;
};

// Products
export const fetchProducts = async () => {
  try {
    const products = await authenticatedFetch('/products');
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchProductById = async (id) => {
  try {
    return await authenticatedFetch(`/products/${id}`);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    return await adminFetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    return await adminFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProductImage = async (imageUrl) => {
  try {
    const token = await getAdminToken(); // Admin only action
    const response = await fetch(`${API_URL}/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting product image:", error);
    return null;
  }
};

export const deleteProduct = async (id) => {
  try {
    const product = await fetchProductById(id);
    if (product && product.image && product.image.includes('/uploads/')) {
       // Only try to delete from cloudinary if it seems to be our own upload. Or always try.
       await deleteProductImage(product.image);
    }
    return await adminFetch(`/products/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = await getAdminToken();

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Backend Upload Error:", error);
    throw error;
  }
};

// Orders
export const createRazorpayOrder = async (amount) => {
  try {
    return await authenticatedFetch('/payment/create-razorpay-order', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  } catch (error) {
    console.error('Error creating razorpay order:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    return await authenticatedFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    return await adminFetch('/orders');
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return [];
  }
};

export const fetchUserOrders = async () => {
  try {
    // We now just use the /users/orders endpoint for the authenticated user
    // The backend uses req.user.uid
    const token = await getAuthToken();
    if (!token) return [];
    
    return await authenticatedFetch('/users/orders');
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

export const updateOrderStatus = async (id, status, cancellationReason = null) => {
  try {
    return await adminFetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cancellationReason })
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updateOrderDeliveryDate = async (id, expectedDeliveryDate) => {
  try {
    return await adminFetch(`/orders/${id}/delivery-date`, {
      method: 'PUT',
      body: JSON.stringify({ expectedDeliveryDate })
    });
  } catch (error) {
    console.error("Error updating order delivery date:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    return await adminFetch(`/orders/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// User Profile
export const fetchUserProfile = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    return await authenticatedFetch('/users/profile');
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const saveUserProfile = async (uid, profileData) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Not logged in");
    await authenticatedFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

// Admin Management
export const fetchAdmins = async () => {
  try {
    return await adminFetch('/users/admins');
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
};

export const grantAdmin = async (email, permissions) => {
  try {
    return await adminFetch('/users/admins/grant', {
      method: 'POST',
      body: JSON.stringify({ email, permissions })
    });
  } catch (error) {
    console.error("Error granting admin access:", error);
    throw error;
  }
};

export const updateAdminPermissions = async (uid, permissions) => {
  try {
    return await adminFetch(`/users/admins/${uid}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
  } catch (error) {
    console.error("Error updating admin permissions:", error);
    throw error;
  }
};

export const revokeAdmin = async (uid) => {
  try {
    return await adminFetch('/users/admins/revoke', {
      method: 'POST',
      body: JSON.stringify({ uid })
    });
  } catch (error) {
    console.error("Error revoking admin access:", error);
    throw error;
  }
};

// Cart
export const saveCartToDatabase = async (uid, cartItems) => {
  if (!uid) return;
  try {
    await authenticatedFetch('/users/cart', {
      method: 'PUT',
      body: JSON.stringify({ items: cartItems })
    });
  } catch (error) {
    console.error("Error syncing cart to MongoDB:", error);
  }
};

export const fetchCartFromDatabase = async (uid) => {
  if (!uid) return [];
  try {
    const data = await authenticatedFetch('/users/cart');
    return data?.items || [];
  } catch (error) {
    console.error("Error fetching cart from MongoDB:", error);
    return [];
  }
};

// Wishlist
export const saveWishlistToDatabase = async (uid, wishlistItems) => {
  if (!uid) return;
  try {
    await authenticatedFetch('/users/wishlist', {
      method: 'PUT',
      body: JSON.stringify({ items: wishlistItems })
    });
  } catch (error) {
    console.error("Error syncing wishlist to MongoDB:", error);
  }
};

export const fetchWishlistFromDatabase = async (uid) => {
  if (!uid) return [];
  try {
    const data = await authenticatedFetch('/users/wishlist');
    return data?.items || [];
  } catch (error) {
    console.error("Error fetching wishlist from MongoDB:", error);
    return [];
  }
};

// OTP Services
export const sendOtp = async (email) => {
  try {
    return await authenticatedFetch('/otp/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    return await authenticatedFetch('/otp/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    return await authenticatedFetch('/otp/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Reels
export const fetchReels = async () => {
  try {
    return await authenticatedFetch('/reels');
  } catch (error) {
    console.error("Error fetching reels:", error);
    return [];
  }
};

export const fetchReelById = async (id) => {
  try {
    return await authenticatedFetch(`/reels/${id}`);
  } catch (error) {
    console.error("Error fetching reel by ID:", error);
    throw error;
  }
};

export const createReel = async (reelData) => {
  try {
    return await adminFetch('/reels', {
      method: 'POST',
      body: JSON.stringify(reelData)
    });
  } catch (error) {
    console.error("Error creating reel:", error);
    throw error;
  }
};

export const updateReel = async (id, reelData) => {
  try {
    return await adminFetch(`/reels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reelData)
    });
  } catch (error) {
    console.error("Error updating reel:", error);
    throw error;
  }
};

export const deleteReel = async (id) => {
  try {
    return await adminFetch(`/reels/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting reel:", error);
    throw error;
  }
};

// Config Settings
export const fetchReelsConfig = async () => {
  try {
    const data = await authenticatedFetch('/settings/config/reelsConfig');
    return Object.keys(data).length > 0 ? data : { isVisible: true };
  } catch (error) {
    console.error("Error fetching reels config:", error);
    return { isVisible: true };
  }
};

export const updateReelsConfig = async (config) => {
  try {
    return await adminFetch('/settings/config/reelsConfig', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  } catch (error) {
    console.error("Error updating reels config:", error);
    throw error;
  }
};

export const fetchAutomaticCouponsConfig = async () => {
  try {
    const data = await authenticatedFetch('/settings/config/automaticCoupons');
    return Object.keys(data).length > 0 ? data : {
      firstOrderFreeDelivery: { isActive: true },
      freeDeliveryOverAmount: { isActive: true, amount: 1000 }
    };
  } catch (error) {
    console.error("Error fetching automatic coupons config:", error);
    return {
      firstOrderFreeDelivery: { isActive: true },
      freeDeliveryOverAmount: { isActive: true, amount: 1000 }
    };
  }
};

export const updateAutomaticCouponsConfig = async (config) => {
  try {
    return await adminFetch('/settings/config/automaticCoupons', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  } catch (error) {
    console.error("Error updating automatic coupons config:", error);
    throw error;
  }
};

export const fetchHeroSlides = async () => {
  try {
    const data = await authenticatedFetch('/settings/config/heroSlides');
    return data.slides || [];
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
};

export const updateHeroSlides = async (slides) => {
  try {
    return await adminFetch('/settings/config/heroSlides', {
      method: 'PUT',
      body: JSON.stringify({ slides })
    });
  } catch (error) {
    console.error("Error updating hero slides:", error);
    throw error;
  }
};

// Coupons
export const fetchCoupons = async () => {
  try {
    return await authenticatedFetch('/coupons');
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};

export const fetchAdminCoupons = async () => {
  try {
    return await adminFetch('/coupons?admin=true');
  } catch (error) {
    console.error("Error fetching admin coupons:", error);
    return [];
  }
};

export const createCoupon = async (couponData) => {
  try {
    return await adminFetch('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    return await adminFetch(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData)
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    return await adminFetch(`/coupons/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

const calculateCouponDiscount = (coupon, cartTotal) => {
  if (coupon.discountType === 'free_shipping') {
    return 0; // Discount applied directly to delivery charges
  }

  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (cartTotal * (coupon.discountPercent || 0)) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountAmount || 0;
  }

  return Math.round(Math.min(discount, cartTotal));
};

export const getCouponEligibility = (coupon, cartTotal, isFirstOrder = false) => {
  if (!coupon) {
    return { valid: false, discount: 0, isFreeShipping: false, message: 'Coupon not found' };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, isFreeShipping: false, message: 'This coupon is not active right now' };
  }

  // Check if coupon has expired
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    return { valid: false, discount: 0, isFreeShipping: false, message: 'This coupon has expired' };
  }
  
  if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
    return { valid: false, discount: 0, isFreeShipping: false, message: 'This coupon has expired' };
  }

  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return { valid: false, discount: 0, isFreeShipping: false, message: 'Coupon usage limit has been reached' };
  }

  if (coupon.isFirstOrderOnly && !isFirstOrder) {
    return { valid: false, discount: 0, isFreeShipping: false, message: 'This coupon is valid for first-time orders only.' };
  }

  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    const amountLeft = coupon.minOrderAmount - cartTotal;
    return {
      valid: false,
      discount: 0,
      isFreeShipping: false,
      message: `Add ${formatCurrency(amountLeft)} more to use this coupon. Minimum order is ${formatCurrency(coupon.minOrderAmount)}.`
    };
  }

  const discount = calculateCouponDiscount(coupon, cartTotal);
  const isFreeShipping = coupon.discountType === 'free_shipping';

  return {
    valid: true,
    discount,
    isFreeShipping,
    coupon,
    message: isFreeShipping ? 'Free shipping applied!' : (discount > 0 ? `Coupon applied! You save ${formatCurrency(discount)}` : 'Coupon applied')
  };
};

export const validateCoupon = async (code, orderAmount) => {
  try {
    return await authenticatedFetch('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount })
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { valid: false, message: error.message || 'Error connecting to coupon service' };
  }
};

export const incrementCouponUsage = async (couponId) => {
  try {
    await adminFetch(`/coupons/${couponId}/increment`, { method: 'POST' });
  } catch (error) {
    console.error('Error connecting to increment coupon endpoint:', error);
  }
};

// Flash Sale
export const fetchFlashSale = async () => {
  try {
    return await authenticatedFetch('/sale');
  } catch (error) {
    console.error("Error fetching flash sale:", error);
    return { isActive: false };
  }
};

export const updateFlashSale = async (saleConfig) => {
  try {
    return await adminFetch('/sale', {
      method: 'POST',
      body: JSON.stringify(saleConfig)
    });
  } catch (error) {
    console.error("Error updating flash sale:", error);
    throw error;
  }
};

// Reviews
export const fetchReviews = async (productId) => {
  try {
    return await authenticatedFetch(`/reviews/${productId}`);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const addReview = async ({ productId, name, rating, comment }) => {
  try {
    return await authenticatedFetch(`/reviews/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ name, rating, comment })
    });
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Settings / Announcements
export const fetchSettings = async () => {
  try {
    return await authenticatedFetch('/settings');
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { announcements: [] };
  }
};

export const updateSettings = async (settingsData) => {
  try {
    return await adminFetch('/settings', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

export const getDeliverySettings = async () => {
  try {
    const response = await fetch(`${API_URL}/settings/config/deliverySettings`);
    if (response.ok) {
      const data = await response.json();
      // If it was previously saved with `{ data: ... }` wrapper by mistake:
      if (data && data.data && (data.data.defaultDays !== undefined || data.data.overrides)) {
        return data.data;
      }
      // If it's correctly saved without wrapper:
      if (data && (data.defaultDays !== undefined || data.overrides)) {
        return data;
      }
      return { defaultDays: 7, overrides: [] };
    }
    return { defaultDays: 7, overrides: [] };
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    return { defaultDays: 7, overrides: [] };
  }
};

export const updateDeliverySettings = async (deliveryData) => {
  try {
    return await adminFetch('/settings/config/deliverySettings', {
      method: 'PUT',
      body: JSON.stringify(deliveryData)
    });
  } catch (error) {
    console.error("Error updating delivery settings:", error);
    throw error;
  }
};

// Mid Banner Settings
export const fetchMidBanner = async () => {
  try {
    const response = await fetch(`${API_URL}/settings/config/midBanner`);
    if (response.ok) {
      const data = await response.json();
      return data?.data || { isVisible: false, imageUrl: '', linkUrl: '' };
    }
    return { isVisible: false, imageUrl: '', linkUrl: '' };
  } catch (error) {
    console.error("Error fetching mid banner config:", error);
    return { isVisible: false, imageUrl: '', linkUrl: '' };
  }
};

export const updateMidBanner = async (bannerData) => {
  try {
    return await adminFetch('/settings/config/midBanner', {
      method: 'PUT',
      body: JSON.stringify({ data: bannerData })
    });
  } catch (error) {
    console.error("Error updating mid banner config:", error);
    throw error;
  }
};

// Categories Config
export const fetchCategoriesConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/settings/config/categoriesConfig`);
    if (response.ok) {
      const data = await response.json();
      return data?.data || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching categories config:", error);
    return null;
  }
};

export const updateCategoriesConfig = async (categoriesData) => {
  try {
    return await adminFetch('/settings/config/categoriesConfig', {
      method: 'PUT',
      body: JSON.stringify({ data: categoriesData })
    });
  } catch (error) {
    console.error("Error updating categories config:", error);
    throw error;
  }
};
