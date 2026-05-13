import { 
  collection, 
  getDocs, 
  getDoc, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { db, auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const formatCurrency = (amount) => `\u20B9${Number(amount || 0).toLocaleString('en-IN')}`;

const getAdminToken = async () => {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please log in again to continue');
  }

  return user.getIdToken();
};

const fetchAdminCouponApi = async (path, options = {}) => {
  const token = await getAdminToken();
  const response = await fetch(`${API_URL}/coupons${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Coupon request failed');
  }

  return payload;
};

// Products
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};


export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    return await response.json();
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update product');
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};


export const deleteProductImage = async (imageUrl) => {
  try {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized");
    const token = await user.getIdToken();

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
    // Don't throw here to allow product deletion even if image deletion fails
    return null;
  }
};

export const deleteProduct = async (id) => {
  try {
    const token = await getAdminToken();
    
    // 1. Fetch product to get image URL/public_id if needed
    // (Optional: The backend could handle image deletion too, but we keep it separate for now or integrate it)
    const product = await fetchProductById(id);
    
    // 2. Delete image if it exists
    if (product && product.image) {
      await deleteProductImage(product.image);
    }

    // 3. Delete from Backend (which deletes from Firestore)
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete product');
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};


export const bulkUploadProducts = async (products) => {
  const results = { success: 0, failed: 0 };
  for (const product of products) {
    try {
      const data = { ...product };
      delete data.id;
      delete data._id;
      await createProduct(data);
      results.success++;
    } catch (err) {
      console.error(`Failed to upload ${product.name}:`, err);
      results.failed++;
    }
  }
  return results;
};

export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Get current user's Firebase token for auth
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated. Please log in again.");
    const token = await user.getIdToken();

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
export const createOrder = async (orderData) => {
  try {
    const ordersCol = collection(db, 'orders');
    const docRef = await addDoc(ordersCol, {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'Processing'
    });
    return { _id: docRef.id, id: docRef.id, ...orderData, status: 'Processing' };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    const ordersCol = collection(db, 'orders');
    const orderSnapshot = await getDocs(ordersCol);
    const orders = orderSnapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    }));

    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const fetchUserOrders = async (uid, email) => {
  if (!uid) return [];
  try {
    const ordersCol = collection(db, 'orders');
    
    // 1. Fetch orders linked directly to user UID
    const qUid = query(ordersCol, where('user', '==', uid));
    const snapshotUid = await getDocs(qUid);
    
    const orderMap = new Map();
    
    snapshotUid.docs.forEach(doc => {
      const data = doc.data();
      orderMap.set(doc.id, { _id: doc.id, id: doc.id, ...data });
    });

    // 2. Also fetch orders linked to user email (covers checkouts that occurred via guest flow)
    if (email) {
      const qEmail = query(ordersCol, where('email', '==', email));
      const snapshotEmail = await getDocs(qEmail);
      snapshotEmail.docs.forEach(doc => {
        const data = doc.data();
        orderMap.set(doc.id, { _id: doc.id, id: doc.id, ...data });
      });
    }

    const orders = Array.from(orderMap.values());

    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.date || 0));
      const dateB = b.createdAt?.toDate?.() || (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.date || 0));
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};


export const updateOrderStatus = async (id, status) => {
  try {
    const orderDoc = doc(db, 'orders', id);
    await updateDoc(orderDoc, { status });
    const snapshot = await getDoc(orderDoc);
    return { _id: snapshot.id, id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const orderDoc = doc(db, 'orders', id);
    await updateDoc(orderDoc, { 
      status: 'Cancelled (Suspicious)', 
      isDeletedByAdmin: true,
      flaggedAt: serverTimestamp() 
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// Auth
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  return { success: true };
};

// User Profile
export const fetchUserProfile = async (uid) => {
  try {
    const userDoc = doc(db, 'users', uid);
    const snapshot = await getDoc(userDoc);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const saveUserProfile = async (uid, profileData) => {
  try {
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, {
      ...profileData,
      updatedAt: serverTimestamp()
    }).catch(async (err) => {
      // If document doesn't exist, create it
      if (err.code === 'not-found') {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(userDoc, {
          ...profileData,
          uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        throw err;
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

// Cart Synchronization for Cross-Device persistence
export const saveCartToFirestore = async (uid, cartItems) => {
  if (!uid) return;
  try {
    const cartDoc = doc(db, 'carts', uid);
    await setDoc(cartDoc, {
      items: cartItems,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error syncing cart to Firestore:", error);
  }
};

export const fetchCartFromFirestore = async (uid) => {
  if (!uid) return [];
  try {
    const cartDoc = doc(db, 'carts', uid);
    const snapshot = await getDoc(cartDoc);
    if (snapshot.exists()) {
      return snapshot.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart from Firestore:", error);
    return [];
  }
};

// OTP Services
export const sendOtp = async (email) => {
  try {
    const response = await fetch(`${API_URL}/otp/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await fetch(`${API_URL}/otp/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Verification failed');
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(`${API_URL}/otp/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send reset link');
    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};


// Reels
export const fetchReels = async () => {
  try {
    const reelsCol = collection(db, 'reels');
    const snapshot = await getDocs(reelsCol);
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching reels:", error);
    return [];
  }
};

export const fetchReelById = async (id) => {
  try {
    const reelDoc = doc(db, 'reels', id);
    const snapshot = await getDoc(reelDoc);
    if (snapshot.exists()) {
      return { _id: snapshot.id, id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching reel by ID:", error);
    throw error;
  }
};

export const createReel = async (reelData) => {
  try {
    const reelsCol = collection(db, 'reels');
    const docRef = await addDoc(reelsCol, {
      ...reelData,
      createdAt: serverTimestamp()
    });
    return { _id: docRef.id, id: docRef.id, ...reelData };
  } catch (error) {
    console.error("Error creating reel:", error);
    throw error;
  }
};

export const updateReel = async (id, reelData) => {
  try {
    const reelDoc = doc(db, 'reels', id);
    const cleanData = { ...reelData };
    delete cleanData._id;
    delete cleanData.id;
    await updateDoc(reelDoc, cleanData);
    return { _id: id, id, ...reelData };
  } catch (error) {
    console.error("Error updating reel:", error);
    throw error;
  }
};

export const deleteReel = async (id) => {
  try {
    // 1. Fetch reel to get preview image URL
    const reel = await fetchReelById(id);
    
    // 2. Delete image if it exists and is local
    if (reel && reel.image && reel.image.includes('/uploads/')) {
      await deleteProductImage(reel.image);
    }

    // 3. Delete Firestore document
    const reelDoc = doc(db, 'reels', id);
    await deleteDoc(reelDoc);
    return { success: true };
  } catch (error) {
    console.error("Error deleting reel:", error);
    throw error;
  }
};

export const fetchReelsConfig = async () => {
  try {
    const docRef = doc(db, 'config', 'reelsConfig');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    // Default config if document doesn't exist yet
    return { isVisible: true };
  } catch (error) {
    console.error("Error fetching reels config:", error);
    return { isVisible: true };
  }
};

export const updateReelsConfig = async (config) => {
  try {
    const docRef = doc(db, 'config', 'reelsConfig');
    await setDoc(docRef, { 
      ...config, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating reels config:", error);
    throw error;
  }
};

// Coupons
export const fetchCoupons = async () => {
  try {
    const response = await fetch(`${API_URL}/coupons`);
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return await response.json();
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};

// Admin-only: fetches ALL coupons including expired/inactive ones
export const fetchAdminCoupons = async () => {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${API_URL}/coupons?admin=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch coupons');
    return await response.json();
  } catch (error) {
    console.error("Error fetching admin coupons:", error);
    return [];
  }
};


export const createCoupon = async (couponData) => {
  try {
    return await fetchAdminCouponApi('', {
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
    return await fetchAdminCouponApi(`/${id}`, {
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
    return await fetchAdminCouponApi(`/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

const calculateCouponDiscount = (coupon, cartTotal) => {
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

export const getCouponEligibility = (coupon, cartTotal, cartCategories = []) => {
  void cartCategories;

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Coupon not found' };
  }

  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'This coupon is not active right now' };
  }

  // Check if coupon has expired
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    return { valid: false, discount: 0, message: 'This coupon has expired' };
  }


  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'Coupon usage limit has been reached' };
  }

  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    const amountLeft = coupon.minOrderAmount - cartTotal;
    return {
      valid: false,
      discount: 0,
      message: `Add ${formatCurrency(amountLeft)} more to use this coupon. Minimum order is ${formatCurrency(coupon.minOrderAmount)}.`
    };
  }

  const discount = calculateCouponDiscount(coupon, cartTotal);

  return {
    valid: true,
    discount,
    coupon,
    message: discount > 0 ? `Coupon applied! You save ${formatCurrency(discount)}` : 'Coupon applied'
  };
};

export const validateCoupon = async (code, orderAmount) => {
  try {
    const response = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderAmount })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { valid: false, message: data.message || 'Invalid coupon' };
    }

    return { 
      valid: true, 
      coupon: data.coupon, 
      discount: data.coupon.discountAmount,
      message: 'Coupon applied successfully!'
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { valid: false, message: 'Error connecting to coupon service' };
  }
};

export const incrementCouponUsage = async (couponId) => {
  try {
    const response = await fetch(`${API_URL}/coupons/${couponId}/increment`, {
      method: 'POST'
    });
    if (!response.ok) {
      console.warn("Failed to increment coupon on backend");
    }
  } catch (error) {
    console.error("Error connecting to increment coupon endpoint:", error);
  }
};

// Flash Sale
export const fetchFlashSale = async () => {
  try {
    const response = await fetch(`${API_URL}/sale`);
    if (!response.ok) throw new Error('Failed to fetch sale configuration');
    return await response.json();
  } catch (error) {
    console.error("Error fetching flash sale:", error);
    return { isActive: false };
  }
};

export const updateFlashSale = async (saleConfig) => {
  try {
    const token = await getAdminToken();
    const response = await fetch(`${API_URL}/sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(saleConfig)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update flash sale');
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating flash sale:", error);
    throw error;
  }
};
