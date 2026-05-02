import { 
  collection, 
  getDocs, 
  getDoc, 
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
    const productsCol = collection(db, 'products');
    // Fetch all products first to ensure we don't miss ones without createdAt
    // If you have a massive amount of products, you'd use a better query, 
    // but for this MVP, fetching all and sorting is safer.
    const productSnapshot = await getDocs(productsCol);
    const products = productSnapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id, 
      ...doc.data()
    }));

    // Sort in memory to handle missing createdAt gracefully
    return products.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};


export const fetchProductById = async (id) => {
  try {
    const productDoc = doc(db, 'products', id);
    const snapshot = await getDoc(productDoc);
    if (snapshot.exists()) {
      return { _id: snapshot.id, id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const productsCol = collection(db, 'products');
    const docRef = await addDoc(productsCol, {
      ...productData,
      createdAt: serverTimestamp(),
      price: Number(productData.price)
    });
    return { _id: docRef.id, id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const productDoc = doc(db, 'products', id);
    const cleanData = { ...productData };
    delete cleanData._id;
    delete cleanData.id;
    await updateDoc(productDoc, {
      ...cleanData,
      price: Number(cleanData.price)
    });
    return { _id: id, id, ...productData };
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
    // 1. Fetch product to get image URL
    const product = await fetchProductById(id);
    
    // 2. Delete image if it exists and is local
    if (product && product.image && product.image.includes('/uploads/')) {
      await deleteProductImage(product.image);
    }

    // 3. Delete Firestore document
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
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

// Coupons
export const fetchCoupons = async () => {
  try {
    const couponsCol = collection(db, 'coupons');
    const snapshot = await getDocs(couponsCol);
    return snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching coupons:", error);
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

export const validateCoupon = async (code, cartTotal, cartCategories = []) => {
  try {
    const couponsCol = collection(db, 'coupons');
    const q = query(couponsCol, where('code', '==', code.toUpperCase().trim()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    const couponDoc = snapshot.docs[0];
    const coupon = { _id: couponDoc.id, id: couponDoc.id, ...couponDoc.data() };
    const result = getCouponEligibility(coupon, cartTotal, cartCategories);

    if (!result.valid) {
      return result;
    }

    return { ...result, coupon };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { valid: false, message: 'Error validating coupon' };
  }
};

export const incrementCouponUsage = async (couponId) => {
  try {
    const couponDoc = doc(db, 'coupons', couponId);
    const snapshot = await getDoc(couponDoc);
    if (snapshot.exists()) {
      const current = snapshot.data().usedCount || 0;
      await updateDoc(couponDoc, { usedCount: current + 1 });
    }
  } catch (error) {
    console.error("Error incrementing coupon usage:", error);
  }
};
