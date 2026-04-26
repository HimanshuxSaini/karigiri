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
  orderBy, 
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

export const deleteProduct = async (id) => {
  try {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const bulkUploadProducts = async (products) => {
  const results = { success: 0, failed: 0 };
  for (const product of products) {
    try {
      const { id, _id, ...data } = product; 
      await createProduct(data);
      results.success++;
    } catch (err) {
      console.error(`Failed to upload ${product.name}:`, err);
      results.failed++;
    }
  }
  return results;
};

// Helper to get auth header
const getAuthHeader = async () => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

export const uploadProductImage = async (file) => {
  try {
    console.log("Starting server-side upload for file:", file.name);
    
    const formData = new FormData();
    formData.append('image', file);

    const authHeader = await getAuthHeader();

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        ...authHeader
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Server upload failed');
    }

    const data = await response.json();
    console.log("Server upload success:", data.url);
    return data.url;
  } catch (error) {
    console.error("Server-side Upload Error:", error);
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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
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

