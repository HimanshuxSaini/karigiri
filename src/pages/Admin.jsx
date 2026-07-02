import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import {
  Plus,
  Trash2,
  Edit3,
  Package,
  ShoppingBag,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Truck,
  ExternalLink,
  RotateCcw,
  Eye,
  ShieldCheck,
  Users,
  Smartphone,
  Printer,
  User,
  MapPin,
  CreditCard,
  Tag,
  Megaphone,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

import {
  fetchProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  fetchOrders,
  updateOrderStatus,
  deleteOrder,
  uploadProductImage,
  fetchReels,
  createReel,
  updateReel,
  deleteReel,
  fetchReelsConfig,
  updateReelsConfig,
  fetchAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  fetchFlashSale,
  updateFlashSale,
  fetchSettings,
  updateSettings
} from '../services/api';
import { useAuthStore, useToastStore } from '../store/useStore';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { getFriendlyErrorMessage } from '../utils/errorMessages';
import { isAdminEmail } from '../config/constants';


const formatDate = (dateObj) => {
  if (!dateObj) return 'N/A';
  try {
    if (dateObj.toDate && typeof dateObj.toDate === 'function') {
      return dateObj.toDate().toLocaleDateString('en-IN');
    }
    const date = new Date(dateObj);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

const Admin = () => {
  const { user } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const tabsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    // Small timeout to allow DOM to render tabs first
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderFilter, setOrderFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast } = useToastStore();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reels, setReels] = useState([]);
  const [showReelModal, setShowReelModal] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [reelFormData, setReelFormData] = useState({
    image: '',
    tag: '',
    handle: '@prathamkarigiri_official',
    order: 0
  });
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '', description: '', discountType: 'percentage', discountPercent: 10,
    discountAmount: 0, maxDiscount: 500, minOrderAmount: 499, usageLimit: 100, isActive: true,
    expiryDate: null
  });
  const [saleConfig, setSaleConfig] = useState({
    isActive: false,
    endTime: '',
    text: 'Flash Sale is live!',
    discountText: 'Up to 50% OFF'
  });
  const [isUpdatingSale, setIsUpdatingSale] = useState(false);
  const [reelsConfig, setReelsConfig] = useState({ isVisible: true });
  const [isUpdatingReelsConfig, setIsUpdatingReelsConfig] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'billing', label: 'Billing', icon: Printer },
    { id: 'reels', label: 'Reels', icon: Eye },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'sale', label: 'Flash Sale', icon: Clock },
    { id: 'announcements', label: 'Banner Offers', icon: Megaphone },
  ];

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Women',
    subCategory: '',
    description: '',
    image: '',
    images: [],
    brand: 'PrathamKarigiri',
    inStock: true,
    stockCount: 0,
    sizeType: 'none',
    sizes: [],
    deliveryCharge: 0,
    badge: 'none'
  });

  // Admin Check
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Handle passed product from other pages for editing
  useEffect(() => {
    if (location.state?.editProduct) {
      const product = location.state.editProduct;
      setActiveTab('products');
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        subCategory: product.subCategory || '',
        description: product.description,
        image: product.image,
        images: product.images || [],
        brand: product.brand,
        inStock: product.inStock,
        sizeType: product.sizeType || 'none',
        sizes: Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : []),
        deliveryCharge: product.deliveryCharge || 0,
        badge: product.badge || 'none'
      });
      setShowProductModal(true);

      // Clear state after handling it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, orderRes, reelRes, couponRes, saleRes, reelResConfig, settingsRes] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchReels(),
        fetchAdminCoupons(),
        fetchFlashSale(),
        fetchReelsConfig(),
        fetchSettings()
      ]);
      setProducts(prodRes || []);
      setOrders(orderRes || []);
      setReels(reelRes || []);
      setCoupons(couponRes || []);
      
      const defaultAnnouncements = [
        "It's 14°C in your area – try our Heavy Knit Cardigans!",
        "SHOP YOUR FIRST ORDER WITH FREE DELIVERY",
        "USE CODE: FESTIVE30 FOR 30% OFF ON WINTER ETHNIC WEAR",
        "EASY 7-DAY RETURNS & EXCHANGE",
      ];
      setAnnouncements(
        settingsRes?.announcements && settingsRes.announcements.length > 0 
          ? settingsRes.announcements 
          : defaultAnnouncements
      );
      if (saleRes) {
        setSaleConfig(saleRes);
      }
      if (reelResConfig) {
        setReelsConfig(reelResConfig);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(getFriendlyErrorMessage('FAILED TO CONNECT TO FIRESTORE'));
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateSaleConfig = async (e) => {
    e.preventDefault();
    setIsUpdatingSale(true);
    try {
      await updateFlashSale(saleConfig);
      showNotification('Flash Sale configuration updated successfully!');
    } catch (err) {
      console.error('Failed to update sale config:', err);
      showNotification('Failed to update configuration', 'error');
    } finally {
      setIsUpdatingSale(false);
    }
  };

  const handleUpdateReelsConfig = async (newVal) => {
    const updated = { ...reelsConfig, isVisible: newVal };
    setReelsConfig(updated);
    setIsUpdatingReelsConfig(true);
    try {
      await updateReelsConfig(updated);
      showNotification(`Reels section visibility turned ${newVal ? 'ON' : 'OFF'}`);
    } catch (err) {
      console.error('Failed to update reels visibility:', err);
      showNotification('Failed to save visibility setting', 'error');
      // Rollback locally if failed
      setReelsConfig(reelsConfig);
    } finally {
      setIsUpdatingReelsConfig(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const searchLower = productSearch.toLowerCase();
    return products.filter(p => {
      const nameMatch = String(p?.name || '').toLowerCase().includes(searchLower);
      const catMatch = String(p?.category || '').toLowerCase().includes(searchLower);
      const brandMatch = String(p?.brand || '').toLowerCase().includes(searchLower);
      return nameMatch || catMatch || brandMatch;
    });
  }, [products, productSearch]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const searchLower = orderSearch.toLowerCase();
    return orders.filter(o => {
      const idMatch = String(o?._id || o?.id || '').toLowerCase().includes(searchLower);
      const phoneMatch = String(o?.shippingAddress?.phone || '').includes(orderSearch);
      const emailMatch = String(o?.email || '').toLowerCase().includes(searchLower);
      
      const isSuspicious = o.isDeletedByAdmin === true || o.status?.includes('Suspicious');
      let statusMatch = false;

      if (orderFilter === 'Suspicious') {
        statusMatch = isSuspicious;
      } else {
        if (isSuspicious) return false; // Exclude completely from normal workflows
        statusMatch = orderFilter === 'All' || o?.status === orderFilter;
      }

      return statusMatch && (idMatch || phoneMatch || emailMatch);
    });
  }, [orders, orderSearch, orderFilter]);

  const statsData = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : [];
    const productsArray = Array.isArray(products) ? products : [];
    const reelsArray = Array.isArray(reels) ? reels : [];

    // Clean active stats from fake/deleted orders
    const activeOrders = ordersArray.filter(o => !o.isDeletedByAdmin && !o.status?.includes('Suspicious'));
    const totalRevenue = activeOrders.reduce((acc, o) => acc + (Number(o?.totalPrice) || 0), 0);
    
    return [
      { label: 'TOTAL REVENUE', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <ShoppingBag className="text-emerald-500" />, color: "bg-emerald-50" },
      { label: 'TOTAL ORDERS', value: activeOrders.length, icon: <Package className="text-blue-500" />, color: "bg-blue-50" },
      { label: 'TOTAL PRODUCTS', value: productsArray.length, icon: <LayoutDashboard className="text-purple-500" />, color: "bg-purple-50" },
      { label: 'REELS (MOTION)', value: reelsArray.length, icon: <Eye className="text-rose-500" />, color: "bg-rose-50" },
    ];
  }, [orders, products, reels]);

  const showNotification = (message, type = 'success') => {
    showToast(message, type);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        showNotification('Product deleted');
      } catch {
        showNotification(getFriendlyErrorMessage('FAILED TO DELETE PRODUCT'), 'error');
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory || '',
      description: product.description,
      image: product.image,
      images: product.images || [],
      brand: product.brand,
      inStock: product.inStock,
      stockCount: product.stockCount !== undefined ? product.stockCount : 0,
      sizeType: product.sizeType || 'none',
      sizes: Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()).filter(Boolean) : []),
      deliveryCharge: product.deliveryCharge || 0,
      badge: product.badge || 'none'
    });
    setShowProductModal(true);
  };

  const handleImageUpload = async (e) => {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadPromise = uploadProductImage(file);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timed out (30s)')), 30000)
      );

      const url = await Promise.race([uploadPromise, timeoutPromise]);
      setFormData(prev => ({ ...prev, image: url }));
      showNotification('Main image uploaded');
    } catch (err) {
      console.error("Main image upload error:", err);
      showNotification(getFriendlyErrorMessage(err), 'error');
    } finally {
      setUploadingImage(false);
      input.value = '';
    }
  };

  const handleSubImageUpload = async (e) => {
    const input = e.target;
    const files = Array.from(input.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const uploadPromise = uploadProductImage(file);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout uploading ${file.name}`)), 30000)
        );

        const url = await Promise.race([uploadPromise, timeoutPromise]);
        uploadedUrls.push(url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));
      showNotification(`${uploadedUrls.length} sub-image(s) uploaded`);
    } catch (err) {
      console.error("Sub-image upload error:", err);
      showNotification(getFriendlyErrorMessage(err), 'error');
    } finally {
      setUploadingImage(false);
      input.value = '';
    }
  };

  const removeSubImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      showNotification('Please upload or provide an image URL', 'error');
      return;
    }
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct._id, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? updated : p));
        showNotification('Product updated successfully');
      } else {
        const created = await createProduct(formData);
        setProducts([created, ...products]);
        showNotification('Product created successfully');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: 'Women',
        subCategory: '',
        description: '',
        image: '',
        images: [],
        brand: 'PrathamKarigiri',
        inStock: true,
        stockCount: 0,
        sizeType: 'none',
        sizes: [],
        deliveryCharge: 0,
        badge: 'none'
      });
    } catch {
      showNotification(getFriendlyErrorMessage('FAILED TO SAVE PRODUCT'), 'error');
    }
  };

  const handleUpdateProductStock = async (id, newStock) => {
    try {
      const updatedProduct = await updateProduct(id, { stockCount: newStock });
      setProducts(products.map(p => p._id === id ? updatedProduct : p));
      showNotification('Stock updated successfully');
    } catch {
      showNotification('Failed to update stock', 'error');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(orders.map(o => (o._id === id || o.id === id) ? { ...o, status } : o));
      setSelectedOrder(prev => prev && (prev._id === id || prev.id === id) ? { ...prev, status } : prev);
      showNotification(`Order status updated to ${status}`);
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to flag this as a FAKE ORDER? It will be moved to the "Fake Orders" tab.')) {
      try {
        await deleteOrder(id);
        // Soft-update local state so it automatically shifts to the Fake Orders tab instantly
        setOrders(orders.map(o => (o._id === id || o.id === id) ? { ...o, isDeletedByAdmin: true, status: 'Cancelled (Suspicious)' } : o));
        
        // AUTOMATICALLY switch active view to Fake Orders so admin instantly sees the transition
        setOrderFilter('Suspicious');
        
        showNotification('Order successfully moved to Fake Orders');
        if (selectedOrder && (selectedOrder._id === id || selectedOrder.id === id)) {
          setSelectedOrder(null);
        }
      } catch {
        showNotification('Failed to flag order', 'error');
      }
    }
  };

  const handleDeleteReel = async (id) => {
    if (window.confirm('Are you sure you want to delete this reel?')) {
      try {
        await deleteReel(id);
        setReels(reels.filter(r => r._id !== id));
        showNotification('Reel deleted');
      } catch {
        showNotification('Failed to delete reel', 'error');
      }
    }
  };

  const handleEditReel = (reel) => {
    setEditingReel(reel);
    setReelFormData({
      image: reel.image,
      tag: reel.tag,
      handle: reel.handle || '@prathamkarigiri_official',
      order: reel.order || 0
    });
    setShowReelModal(true);
  };

  const handleSubmitReel = async (e) => {
    e.preventDefault();
    if (!reelFormData.image) {
      showNotification('Please upload an image', 'error');
      return;
    }
    try {
      if (editingReel) {
        const updated = await updateReel(editingReel._id, reelFormData);
        setReels(reels.map(r => r._id === editingReel._id ? updated : r));
        showNotification('Reel updated');
      } else {
        const created = await createReel(reelFormData);
        setReels([...reels, created]);
        showNotification('Reel created');
      }
      setShowReelModal(false);
      setEditingReel(null);
      setReelFormData({ image: '', tag: '', handle: '@prathamkarigiri_official', order: 0 });
    } catch {
      showNotification('Failed to save reel', 'error');
    }
  };

  const handleReelImageUpload = async (e) => {
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setReelFormData(prev => ({ ...prev, image: url }));
      showNotification('Preview image uploaded');
    } catch (err) {
      console.error("Admin: Reel preview upload failed:", err);
      showNotification('Upload failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setUploadingImage(false);
      input.value = '';
    }
  };

  // Coupon handlers
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter(c => (c._id || c.id) !== id));
      showNotification('Coupon deleted');
    } catch (error) {
      showNotification(error.message || 'Failed to delete coupon', 'error');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountPercent: Number(coupon.discountPercent) || 10,
      discountAmount: Number(coupon.discountAmount) || 0,
      maxDiscount: Number(coupon.maxDiscount) || 500,
      minOrderAmount: Number(coupon.minOrderAmount) || 499,
      usageLimit: Number(coupon.usageLimit) || 100,
      isActive: coupon.isActive !== false,
      expiryDate: coupon.expiryDate || null
    });
    setShowCouponModal(true);
  };

  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) {
      showNotification('Coupon code is required', 'error');
      return;
    }

    setIsSubmittingCoupon(true);
    const payload = {
      ...couponFormData,
      code: couponFormData.code.toUpperCase().trim(),
      discountPercent: Number(couponFormData.discountPercent) || 0,
      discountAmount: Number(couponFormData.discountAmount) || 0,
      maxDiscount: Number(couponFormData.maxDiscount) || 0,
      minOrderAmount: Number(couponFormData.minOrderAmount) || 0,
      usageLimit: Number(couponFormData.usageLimit) || 0
    };

    if (payload.expiryDate && new Date(payload.expiryDate) < new Date()) {
      payload.isActive = false;
    }

    try {
      if (editingCoupon) {
        const couponId = editingCoupon._id || editingCoupon.id;
        const updated = await updateCoupon(couponId, payload);

        setCoupons(prev => prev.map(c =>
          (c._id || c.id) === couponId ? { ...c, ...updated } : c
        ));
        showNotification('Coupon updated successfully');
      } else {
        const created = await createCoupon(payload);
        setCoupons(prev => [created, ...prev]);
        showNotification('Coupon created successfully');
      }

      setShowCouponModal(false);
      setEditingCoupon(null);
      setCouponFormData({
        code: '', description: '', discountType: 'percentage',
        discountPercent: 10, discountAmount: 0, maxDiscount: 500,
        minOrderAmount: 499, usageLimit: 100, isActive: true
      });
    } catch (error) {
      console.error('Coupon Submit Error:', error);
      showNotification(error.message || 'Failed to save coupon', 'error');
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  const handlePrintBill = (orderData) => {
    const printWindow = window.open('', '_blank');
    const orderId = String(orderData?._id || orderData?.id || '').toUpperCase();
    const date = formatDate(orderData?.createdAt);
    const total = Number(orderData?.totalPrice || 0).toLocaleString('en-IN');

    const brandName = "PrathamKarigiri";
    const brandAddress = "Sonipat, Haryana, India";
    const brandPhone = "+91 93158 55431";
    const brandEmail = "prathamkarigiri@gmail.com";

    const itemsHtml = (orderData?.orderItems || []).map(item => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 1);
      const subtotal = price * quantity;
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <div style="font-weight: bold; font-size: 14px;">${item.name || 'Unnamed Item'}</div>
            <div style="font-size: 11px; color: #666;">Category: ${item.category || 'Handmade'}</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${price.toLocaleString('en-IN')}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${orderId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:wght@700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .logo-container { display: flex; flex-direction: column; }
            .logo { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: bold; letter-spacing: 2px; line-height: 1; }
            .brand-details { font-size: 10px; color: #666; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-info { text-align: right; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; letter-spacing: 1.5px; margin-bottom: 10px; }
            .info-card { background: #f9f9f9; padding: 20px; border-radius: 12px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background: #f4f4f4; padding: 12px; font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }
            .totals { float: right; width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .grand-total { font-size: 20px; font-weight: bold; border-bottom: none; padding-top: 15px; margin-top: 10px; border-top: 2px solid #000; }
            .footer { margin-top: 100px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <div class="logo">${brandName}</div>
              <div class="brand-details">
                ${brandAddress}<br>
                ${brandPhone} | ${brandEmail}
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-title">Invoice</div>
              <div>Order ID: #${orderId}</div>
              <div>Date: ${date}</div>
              <div style="margin-top: 5px; font-weight: bold; color: ${orderData.status === 'Delivered' ? '#059669' : '#d97706'}">Status: ${orderData.status || 'Processing'}</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">Billed To</div>
              <div class="info-card">
                <strong>${orderData.email}</strong><br>
                Phone: ${orderData.shippingAddress?.phone || 'N/A'}<br>
                Payment: ${orderData.paymentMethod || 'COD'}
              </div>
            </div>
            <div>
              <div class="section-title">Shipping Address</div>
              <div class="info-card">
                ${orderData.shippingAddress?.street || orderData.shippingAddress?.address || 'N/A'}<br>
                ${orderData.shippingAddress?.city || 'N/A'}, ${orderData.shippingAddress?.state || 'N/A'}<br>
                PIN: ${orderData.shippingAddress?.pincode || orderData.shippingAddress?.postalCode || 'N/A'}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${total}</span>
            </div>
            <div class="total-row">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total</span>
              <span>₹${total}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with PrathamKarigiri Artisanal Collection!</p>
            <p>This is a computer generated invoice and does not require a physical signature.</p>
          </div>

          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Auth check is handled by ProtectedRoute in App.jsx

  const Stats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statsData.map((stat, i) => (
        <Motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6 hover:shadow-md transition-shadow"
        >
          <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-xl`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-serif font-bold text-gray-900">{stat.value}</h3>
          </div>
        </Motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="pt-24 md:pt-32 pb-24 max-w-7xl mx-auto px-4 relative z-10">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">Admin Control</h1>
              <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2 font-medium">Managing <span className="text-[var(--primary)] font-bold">PrathamKarigiri Artisanal Collection</span></p>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto">
              <Link
                to="/"
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">View Site</span>
                <span className="sm:hidden">Site</span>
              </Link>
            </div>
          </div>

          {/* Horizontal Tab Navigation */}
          <div className="relative">
            <div 
              ref={tabsContainerRef}
              onScroll={checkScroll}
              className="bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 overflow-x-auto no-scrollbar"
            >
              <div className="flex items-center min-w-max md:min-w-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-[0.15em] ${activeTab === tab.id
                        ? 'bg-black text-white shadow-xl'
                        : 'text-gray-400 hover:text-gray-900'
                      }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Scroll Indicator Gradient & Arrow */}
            <AnimatePresence>
              {canScrollLeft && (
                <Motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent rounded-l-[2rem] flex items-center justify-start pl-4"
                >
                  <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 text-gray-400 animate-pulse">
                    <ChevronLeft size={16} />
                  </div>
                </Motion.div>
              )}

              {canScrollRight && (
                <Motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent rounded-r-[2rem] flex items-center justify-end pr-4"
                >
                  <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 text-gray-400 animate-pulse">
                    <ChevronRight size={16} />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-2">{error}</h3>
              <button onClick={loadData} className="text-[var(--primary)] font-bold hover:underline">Try Again</button>
            </div>
          ) : (
            <Motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'dashboard' && (
                <>
                  <Stats />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-sm text-[var(--primary)] font-bold hover:underline">View All</button>
                      </div>
                      <div className="space-y-4">
                        {Array.isArray(orders) && orders.length > 0 ? (
                          orders.filter(o => !o.isDeletedByAdmin && !o.status?.includes('Suspicious')).slice(0, 5).map((order, idx) => (
                            <div key={order?._id || order?.id || `recent-${idx}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--primary)]">
                                  <ShoppingBag size={20} />
                                </div>
                                <div>
                                  <p className="font-bold text-sm">#{String(order?._id || order?.id || '').slice(-6).toUpperCase() || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{formatDate(order?.createdAt)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">₹{(Number(order?.totalPrice) || 0).toLocaleString()}</p>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${order?.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                  {order?.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center text-gray-400">
                            <p className="text-sm">No recent orders yet.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Inventory Overview</h3>
                        <button onClick={() => setActiveTab('products')} className="text-sm text-[var(--primary)] font-bold hover:underline">Manage</button>
                      </div>
                      <div className="space-y-4">
                        {Array.isArray(products) && products.length > 0 ? (
                          (() => {
                            const catCounts = products.reduce((acc, p) => {
                              const cat = p?.category || 'Uncategorized';
                              acc[cat] = (acc[cat] || 0) + 1;
                              return acc;
                            }, {});

                            // Define the exact order and categories to show
                            const displayCats = ['Women', 'Kids', 'Men', 'Bouquet', 'Laddu Gopal', 'Yarn'];

                            return displayCats.map(cat => {
                              const count = catCounts[cat] || 0;
                              const percentage = products.length ? (count / products.length) * 100 : 0;
                              return (
                                <div key={cat} className="space-y-2">
                                  <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-900">{cat}</span>
                                    <span className="text-gray-500">{count} {count === 1 ? 'Item' : 'Items'}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-[#5C4033] h-full transition-all duration-1000 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            });
                          })()
                        ) : (
                          <div className="py-10 text-center text-gray-400">
                            <p className="text-sm">No products in inventory.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Low Stock Alerts */}
                    {(() => {
                      const lowStockProducts = Array.isArray(products) 
                        ? products.filter(p => p.stockCount !== undefined && p.stockCount <= 5).sort((a, b) => a.stockCount - b.stockCount)
                        : [];
                      return (
                        <div className="lg:col-span-2 bg-rose-50 p-8 rounded-[3rem] border border-rose-100 relative group overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                          <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-600">
                                  <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-rose-950">Low Stock Alerts</h3>
                              </div>
                              {lowStockProducts.length > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                  {lowStockProducts.length} Alerts
                                </span>
                              )}
                            </div>

                            <div className="space-y-3 flex-1">
                              {lowStockProducts.length > 0 ? (
                                lowStockProducts.slice(0, 3).map((product, idx) => (
                                  <div 
                                    key={product._id || product.id || idx} 
                                    className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-100/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group/item" 
                                    onClick={() => setActiveTab('stock')}
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="w-12 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                        <img src={product.image || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-gray-900 truncate max-w-[140px] md:max-w-[180px]">{product.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">ID: {String(product._id || product.id).slice(-6).toUpperCase()}</p>
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg ${product.stockCount === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {product.stockCount === 0 ? 'Out of Stock' : `${product.stockCount} Left`}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full py-10 text-emerald-600 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                                  <ShieldCheck size={40} className="mb-3 opacity-50" />
                                  <p className="font-bold text-sm">Inventory is healthy!</p>
                                  <p className="text-xs text-emerald-600/70 mt-1">All products are well stocked.</p>
                                </div>
                              )}
                            </div>
                            
                            {lowStockProducts.length > 3 && (
                              <button 
                                onClick={() => setActiveTab('stock')}
                                className="mt-6 flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:bg-rose-100/50 py-3 rounded-xl transition-colors w-full"
                              >
                                <span>View all {lowStockProducts.length} items</span>
                                <ArrowRight size={14} strokeWidth={3} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </>
              )}

              {activeTab === 'stock' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Product</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Stock Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="3" className="px-6 py-20 text-center">
                                <p className="font-bold text-gray-900">No products found</p>
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p, idx) => (
                              <tr key={p?._id || p?.id || `stock-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                      <img
                                        src={p?.image || p?.images?.[0] || '/placeholder.png'}
                                        alt={p?.name || 'Product'}
                                        className="w-full h-full object-contain bg-white"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                      />
                                    </div>
                                    <p className="font-bold text-gray-900 line-clamp-1">{p?.name || 'Unnamed Product'}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
                                    {p?.category || 'Uncategorized'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="number"
                                      min="0"
                                      defaultValue={p?.stockCount !== undefined ? p.stockCount : 0}
                                      onBlur={(e) => {
                                        const newVal = Number(e.target.value);
                                        if (newVal !== (p?.stockCount || 0)) {
                                          handleUpdateProductStock(p._id || p.id, newVal);
                                        }
                                      }}
                                      className="w-24 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-bold"
                                    />
                                    {p?.stockCount <= 0 && <span className="text-[10px] text-red-500 font-bold uppercase">Out of Stock</span>}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-white shadow-sm"
                      />
                    </div>
                    <div className="flex space-x-3">


                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setFormData({
                            name: '',
                            price: '',
                            category: 'Women',
                            subCategory: '',
                            description: '',
                            image: '',
                            images: [],
                            brand: 'PrathamKarigiri',
                            inStock: true,
                            sizeType: 'none',
                            sizes: [],
                            deliveryCharge: 0,
                            badge: 'none'
                          });
                          setShowProductModal(true);
                        }}
                        className="flex items-center justify-center space-x-2 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-md"
                      >
                        <Plus size={20} />
                        <span>Add Product</span>
                      </button>
                    </div>

                  </div>

                  <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Mobile Cards View */}
                    <div className="md:hidden divide-y divide-gray-50">
                      {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={32} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">No products found</p>
                              <p className="text-sm text-gray-500">Add a new product to get started.</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        filteredProducts.map((p, idx) => (
                          <div key={p?._id || p?.id || `prod-mob-${idx}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-16 aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                <img
                                  src={p?.image || p?.images?.[0] || '/placeholder.png'}
                                  alt={p?.name || 'Product'}
                                  className="w-full h-full object-contain bg-white"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder.png';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">{p?.name || 'Unnamed Product'}</p>
                                <p className="text-xs text-gray-400 mb-1">{p?.brand || 'PrathamKarigiri'}</p>
                                <p className="font-bold text-[var(--primary)]">₹{(Number(p?.price) || 0).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p?.category === 'Kids' ? 'bg-blue-50 text-blue-600' :
                                    p?.category === 'Women' ? 'bg-rose-50 text-rose-600' :
                                      p?.category === 'Men' ? 'bg-slate-100 text-slate-700' :
                                        p?.category === 'Bouquet' ? 'bg-pink-50 text-pink-600' :
                                          p?.category === 'Laddu Gopal' ? 'bg-orange-50 text-orange-600' :
                                            p?.category === 'Yarn' ? 'bg-amber-50 text-amber-600' :
                                              'bg-gray-100 text-gray-600'
                                  }`}>
                                  {p?.category || 'Uncategorized'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p?.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                  }`}>
                                  {p?.stockCount !== undefined ? `${p.stockCount} In Stock` : (p?.inStock ? 'In Stock' : 'Out of Stock')}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <Link
                                  to={`/product/${p?._id || p?.id}`}
                                  target="_blank"
                                  className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Eye size={16} />
                                </Link>
                                <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteProduct(p?._id || p?.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Product</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Price</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Stock</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                    <ShoppingBag size={32} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">No products found</p>
                                    <p className="text-sm text-gray-500">Add a new product to get started.</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((p, idx) => (
                              <tr key={p?._id || p?.id || `prod-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-14 aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                      <img
                                        src={p?.image || p?.images?.[0] || '/placeholder.png'}
                                        alt={p?.name || 'Product'}
                                        className="w-full h-full object-contain bg-white transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/placeholder.png';
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900">{p?.name || 'Unnamed Product'}</p>
                                      <p className="text-xs text-gray-400">{p?.brand || 'PrathamKarigiri'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col space-y-1">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${p?.category === 'Kids' ? 'bg-blue-50 text-blue-600' :
                                        p?.category === 'Women' ? 'bg-rose-50 text-rose-600' :
                                          p?.category === 'Men' ? 'bg-slate-100 text-slate-700' :
                                            p?.category === 'Bouquet' ? 'bg-pink-50 text-pink-600' :
                                              p?.category === 'Laddu Gopal' ? 'bg-orange-50 text-orange-600' :
                                                p?.category === 'Yarn' ? 'bg-amber-50 text-amber-600' :
                                                  'bg-gray-100 text-gray-600'
                                      }`}>
                                      {p?.category || 'Uncategorized'}
                                    </span>
                                    {p?.subCategory && (
                                      <span className="text-[10px] text-gray-400 font-bold ml-1">{p.subCategory}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-gray-900">₹{(Number(p?.price) || 0).toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${p?.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {p?.stockCount !== undefined ? `${p.stockCount} In Stock` : (p?.inStock ? 'In Stock' : 'Out of Stock')}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2">
                                    <Link
                                      to={`/product/${p?._id || p?.id}`}
                                      target="_blank"
                                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="View Live"
                                    >
                                      <Eye size={18} />
                                    </Link>
                                    <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={18} /></button>
                                    <button onClick={() => handleDeleteProduct(p?._id || p?.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
                      {['All', 'Processing', 'Shipped', 'Delivered', 'Suspicious'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setOrderFilter(status)}
                          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderFilter === status
                              ? status === 'Suspicious' 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                                : 'bg-black text-white'
                              : status === 'Suspicious'
                                ? 'text-red-500 hover:bg-red-50 border border-dashed border-red-100'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                          {status === 'Suspicious' ? 'Fake Orders' : status}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by ID or Phone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-2.5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.length === 0 ? (
                      <div className="col-span-full py-20 text-center">
                        <Package className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-medium">No orders found matching your criteria.</p>
                      </div>
                    ) : (
                      filteredOrders.map((order, idx) => (
                        <Motion.div
                          key={order?._id || order?.id || `order-${idx}`}
                          layout
                          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                              <h4 className="font-bold text-lg">#{String(order?._id || order?.id || '').slice(-8).toUpperCase() || 'NEW-ORDER'}</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${order?.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                                order?.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  order?.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-gray-100 text-gray-700'
                              }`}>
                              {order?.status || 'Pending'}
                            </span>
                          </div>

                          <div className="border-t border-b border-gray-50 py-4 space-y-2">
                            {(order?.orderItems || []).map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item?.quantity || 1}x {item?.name || 'Item'}</span>
                                <span className="font-bold">₹{(Number(item?.price || 0) * Number(item?.quantity || 1)).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                              <p className="text-sm font-bold text-gray-800">{order?.shippingAddress?.phone || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                              <p className="text-lg font-bold text-[var(--primary)]">₹{(Number(order?.totalPrice) || 0).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            {order?.status === 'Processing' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order?._id || order?.id, 'Shipped')}
                                className="flex-grow flex items-center justify-center space-x-2 bg-black text-white py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all"
                              >
                                <Truck size={14} />
                                <span>Mark Shipped</span>
                              </button>
                            )}
                            {order?.status === 'Shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order?._id || order?.id, 'Delivered')}
                                className="flex-grow flex items-center justify-center space-x-2 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                              >
                                <CheckCircle size={14} />
                                <span>Mark Delivered</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-4 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order?._id || order?.id)}
                              className="px-3 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center"
                              title="Mark as Fake Order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </Motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
                      <div className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Order Billing & Invoices
                      </div>
                    </div>

                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by ID or Phone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-2.5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Mobile Cards View */}
                    <div className="md:hidden divide-y divide-gray-50">
                      {filteredOrders.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                          No orders found for billing.
                        </div>
                      ) : (
                        filteredOrders.map((order, idx) => (
                          <div key={order?._id || order?.id || `bill-mob-${idx}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</span>
                                <p className="font-bold text-gray-900 font-mono">#{String(order?._id || order?.id || '').slice(-8).toUpperCase()}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order?.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                  order?.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                                    'bg-amber-50 text-amber-600'
                                }`}>
                                {order?.status || 'Processing'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                              <div>
                                <p className="text-xs font-bold text-gray-400">Date</p>
                                <p className="text-gray-600">{formatDate(order?.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-400">Total</p>
                                <p className="font-bold text-gray-900">₹{(Number(order?.totalPrice) || 0).toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs font-bold text-gray-400">Customer</p>
                                <p className="font-bold text-gray-900">{order?.shippingAddress?.phone || 'N/A'}</p>
                                <p className="text-[10px] text-gray-500 truncate">{order?.email}</p>
                              </div>
                            </div>

                            <div className="flex space-x-2 pt-2 border-t border-gray-50">
                              <button
                                onClick={() => handlePrintBill(order)}
                                className="flex-1 flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                              >
                                <Printer size={14} />
                                <span>Print Bill</span>
                              </button>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-4 py-2 text-gray-500 border border-gray-100 hover:bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Order ID</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Date</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Customer</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Total</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-6 py-20 text-center text-gray-400">
                                No orders found for billing.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order, idx) => (
                              <tr key={order?._id || order?.id || `bill-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="font-bold text-gray-900 font-mono">#{String(order?._id || order?.id || '').slice(-8).toUpperCase()}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {formatDate(order?.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">{order?.shippingAddress?.phone || 'N/A'}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{order?.email?.split('@')[0]}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                  ₹{(Number(order?.totalPrice) || 0).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order?.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                      order?.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                    {order?.status || 'Processing'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handlePrintBill(order)}
                                      className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                                    >
                                      <Printer size={14} />
                                      <span>Print Bill</span>
                                    </button>
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition-all"
                                      title="View Details"
                                    >
                                      <Eye size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reels' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-gray-900">Shoppable Reels</h3>
                      <p className="text-sm text-gray-500">Manage video content and instagram integration</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-xs font-bold text-gray-500">Show on Website</span>
                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            disabled={isUpdatingReelsConfig}
                            checked={reelsConfig.isVisible}
                            onChange={(e) => handleUpdateReelsConfig(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          setEditingReel(null);
                          setReelFormData({ image: '', tag: '', handle: '@prathamkarigiri_official', order: 0 });
                          setShowReelModal(true);
                        }}
                        className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                      >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add New Reel</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {reels.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
                        <Eye size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium">No reels added yet.</p>
                      </div>
                    ) : (
                      reels.sort((a, b) => (a.order || 0) - (b.order || 0)).map((reel) => (
                        <div key={reel._id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                          <div className="aspect-[9/16] relative overflow-hidden bg-gray-100">
                            <img
                              src={reel.image}
                              alt={reel.tag}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditReel(reel)}
                                  className="flex-grow bg-white text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReel(reel._id)}
                                  className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="absolute top-4 left-4">
                              <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                                #{reel.order || 0}
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">{reel.tag}</p>
                            <p className="text-xs font-bold text-gray-400">{reel.handle}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-gray-900">Coupons</h3>
                      <p className="text-sm text-gray-500">Manage discount codes and promotions</p>
                    </div>
                    <button
                      onClick={() => { setEditingCoupon(null); setCouponFormData({ code: '', description: '', discountType: 'percentage', discountPercent: 10, discountAmount: 0, maxDiscount: 500, minOrderAmount: 499, usageLimit: 100, isActive: true }); setShowCouponModal(true); }}
                      className="flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                    >
                      <Plus size={20} />
                      <span>New Coupon</span>
                    </button>
                  </div>

                  {coupons.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[32px] border border-gray-100">
                      <Tag size={48} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium">No coupons created yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Code</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Discount</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Min Order</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Usage</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {coupons.map((coupon) => (
                              <tr key={coupon._id || coupon.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-black tracking-wider">{coupon.code}</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-600 capitalize">{coupon.discountType}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                  {coupon.discountType === 'percentage' ? `${coupon.discountPercent}% (max ₹${coupon.maxDiscount})` : `₹${coupon.discountAmount}`}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-600">₹{coupon.minOrderAmount || 0}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-600">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <button onClick={() => handleEditCoupon(coupon)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDeleteCoupon(coupon._id || coupon.id)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sale' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-gray-900">Flash Sale Manager</h3>
                      <p className="text-sm text-gray-500">Configure the countdown banner and promotional text</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm max-w-2xl">
                    <form onSubmit={handleUpdateSaleConfig} className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <h4 className="font-bold text-gray-900">Activate Flash Sale</h4>
                          <p className="text-xs text-gray-500">Toggle this to show or hide the banner sitewide.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={saleConfig.isActive}
                            onChange={(e) => setSaleConfig(prev => ({ ...prev, isActive: e.target.checked }))}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Banner Main Text</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Flash Sale is live!"
                          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                          value={saleConfig.text}
                          onChange={(e) => setSaleConfig(prev => ({ ...prev, text: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Highlight Text / Discount</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Up to 50% OFF"
                          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                          value={saleConfig.discountText}
                          onChange={(e) => setSaleConfig(prev => ({ ...prev, discountText: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sale End Time</label>
                        <input
                          type="datetime-local"
                          required
                          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                          value={saleConfig.endTime ? new Date(new Date(saleConfig.endTime).getTime() - new Date(saleConfig.endTime).getTimezoneOffset()*60000).toISOString().slice(0,16) : ''}
                          onChange={(e) => setSaleConfig(prev => ({ ...prev, endTime: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                        />
                        <p className="text-[10px] text-gray-400">Note: Ensure the end time is in the future to start the timer.</p>
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isUpdatingSale}
                          className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center"
                        >
                          {isUpdatingSale ? 'Saving Updates...' : 'Save Flash Sale Configuration'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-gray-900">Banner Offers</h2>
                      <p className="text-gray-500 mt-2">Manage the scrolling offers at the top of the store</p>
                    </div>
                    <button
                      onClick={async () => {
                        setIsUpdatingSettings(true);
                        try {
                          await updateSettings({ announcements });
                          addToast('Banner offers updated successfully', 'success');
                        } catch (err) {
                          addToast(err.message || 'Failed to update offers', 'error');
                        } finally {
                          setIsUpdatingSettings(false);
                        }
                      }}
                      disabled={isUpdatingSettings}
                      className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isUpdatingSettings ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6">Current Offers</h3>
                    
                    <div className="space-y-4 mb-8">
                      {announcements.map((text, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                          <span className="text-sm font-medium">{text}</span>
                          <button
                            onClick={() => setAnnouncements(announcements.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      {announcements.length === 0 && (
                        <p className="text-gray-500 italic">No custom offers configured. Default offers will be shown.</p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹999"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newAnnouncement.trim()) {
                            setAnnouncements([...announcements, newAnnouncement.trim()]);
                            setNewAnnouncement('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newAnnouncement.trim()) {
                            setAnnouncements([...announcements, newAnnouncement.trim()]);
                            setNewAnnouncement('');
                          }
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                      >
                        Add Offer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Motion.div>
          )}
        </Motion.div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></Motion.div>

            <Motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 overflow-y-auto">
                <h2 className="text-2xl font-serif font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery Charge (₹)</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.deliveryCharge}
                        onChange={(e) => setFormData({ ...formData, deliveryCharge: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {['Women', 'Kids', 'Men', 'Bouquet', 'Laddu Gopal', 'Yarn'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Badge</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.badge || 'none'}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    >
                      <option value="none">None</option>
                      <option value="new">New</option>
                      <option value="bestseller">Bestseller</option>
                    </select>
                  </div>

                  {formData.category === 'Kids' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kids Sub-Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Clothing">
                          {['Handmade Sweaters', 'Frocks', 'Poncho', 'Vests', 'Rompers / Jumpsuits', 'Winterwear Sets'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Girls (2-12 Years)">
                          {['Crochet Tops', 'Casual Dresses', 'Co-ords', 'Party Dresses', 'Ethnic Wear'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Accessories">
                          {['Booties', 'Cap Mitten Set', 'Caps', 'Mufflers', 'Headband', 'Socks', 'Hair Accessories'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Photoprops">
                          {['Mermaid', 'Beach Theme', 'Jungle Theme', 'Christmas Theme', 'Sports'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Women' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Women Sub-Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Winterwear">
                          {['Sweaters', 'Ponchos', 'Caps, Hats, Beanies', 'Neckwarmers', 'Mufflers', 'Socks'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Beachwear">
                          {['Bralettes', 'Cover Ups', 'Sarongs'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Resortwear">
                          {['Crochet Tops', 'Dresses', 'Co-ord Sets', 'Crochet Shorts', 'Crochet Skirts', 'Jeans'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Accessories">
                          {['Earrings', 'Bracelets', 'Crochet Scarf', 'Neckwarmers', 'Macrame Belts', 'Socks'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Bags">
                          {['Crochet Handbags', 'Tote Bags', 'Sling Bags', 'Clutches'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Men' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Men Sub-Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Winterwear">
                          {['Sweaters', 'Cardigans', 'Vests', 'Hoodies', 'Jackets', 'Coats'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Topwear">
                          {['Handmade Shirts', 'Pullovers', 'Knitted Tees'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Accessories">
                          {['Mufflers', 'Caps & Beanies', 'Handmade Gloves', 'Woolen Socks', 'Neck Warmers', 'Belts'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Gifting">
                          {['Gift Sets', 'Winter Combos'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Bouquet' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bouquet Sub-Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Floral">
                          {['Rose Bouquets', 'Tulip Bouquets', 'Sunflower Bouquets', 'Lavender Bunches'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Occasions">
                          {['Birthday Special', 'Anniversary'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Laddu Gopal' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Laddu Gopal Sub-Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Collection">
                          {['Handmade Dresses', 'Mukut & Shringar', 'Bedding & Pillows'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Yarn' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yarn Sub-Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Collection">
                          {['Organic Woolen Yarn', 'Cotton Yarn', 'Milk Cotton Yarn'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-6">
                    {/* Main Image Section */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Main Product Image</label>
                      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        {formData.image && (
                          <div className="relative group flex-shrink-0">
                            <img src={formData.image} alt="Preview" className="w-32 aspect-[3/4] rounded-2xl object-contain bg-white border-2 border-[var(--primary)] shadow-md" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}

                        {!formData.image && (
                          <div className="flex-grow w-full">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="main-image-upload"
                            />
                            <label
                              htmlFor="main-image-upload"
                              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all bg-gray-50/50 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              {uploadingImage ? (
                                <div className="flex flex-col items-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mb-2"></div>
                                  <p className="text-xs font-bold text-[var(--primary)] uppercase">Uploading...</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                  <Plus size={32} />
                                  <p className="text-xs font-bold uppercase mt-2">Upload Main Image</p>
                                </div>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sub-Images Section */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sub-Images (Gallery)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {(formData.images || []).map((url, index) => (
                          <div key={index} className="relative group aspect-[3/4]">
                            <img src={url} alt={`Gallery ${index}`} className="w-full h-full rounded-xl object-contain bg-white border border-gray-100 shadow-sm" />
                            <button
                              type="button"
                              onClick={() => removeSubImage(index)}
                              className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        ))}

                        <div className="aspect-[3/4]">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleSubImageUpload}
                            className="hidden"
                            id="sub-image-upload"
                          />
                          <label
                            htmlFor="sub-image-upload"
                            className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all bg-gray-50/30 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                            ) : (
                              <div className="flex flex-col items-center text-gray-400">
                                <Plus size={24} />
                                <p className="text-[10px] font-bold uppercase mt-1">Add More</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Sizes Selection Section */}
                  <div className="md:col-span-2 space-y-4 border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Size Category</label>
                        <select
                          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                          value={formData.sizeType}
                          onChange={(e) => {
                            const val = e.target.value;
                            const currentSizes = Array.isArray(formData.sizes) ? formData.sizes : (typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : []);
                            setFormData({
                              ...formData,
                              sizeType: val,
                              sizes: val === 'none' ? [] : currentSizes
                            });
                          }}
                        >
                          <option value="none">One Size (No Specific Sizes)</option>
                          <option value="standard">Standard Letter (XS, S, M, L, XL...)</option>
                          <option value="kids">Kids Age Select (0-3M, 1-2Y...)</option>
                          <option value="custom">Custom Sizes</option>
                        </select>
                      </div>

                      {formData.sizeType === 'custom' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Custom Sizes (Comma-separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. 28, 30, 32, 34"
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                            value={(Array.isArray(formData.sizes) ? formData.sizes : []).join(', ')}
                            onChange={(e) => {
                              const val = e.target.value;
                              const splitSizes = val.split(',').map(s => s.trim()).filter(Boolean);
                              setFormData({ ...formData, sizes: splitSizes });
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {(formData.sizeType === 'standard' || formData.sizeType === 'kids') && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Select Available Sizes ({(Array.isArray(formData.sizes) ? formData.sizes : []).length} selected)
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          {(formData.sizeType === 'standard'
                            ? ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
                            : ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y', '9-10Y', '10-12Y']
                          ).map(sz => {
                            const currentSizes = Array.isArray(formData.sizes) ? formData.sizes : [];
                            const isSelected = currentSizes.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  const newSizes = isSelected
                                    ? currentSizes.filter(s => s !== sz)
                                    : [...currentSizes, sz];
                                  setFormData({ ...formData, sizes: newSizes });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all transform active:scale-95 border ${
                                  isSelected
                                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/10'
                                    : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      required
                      rows="3"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Stock Count</label>
                      <input
                        required
                        type="number"
                        min="0"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.stockCount !== undefined ? formData.stockCount : 0}
                        onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-8">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="w-5 h-5 accent-[var(--primary)]"
                      />
                      <label htmlFor="inStock" className="text-sm font-bold text-gray-700">Available in Stock</label>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex space-x-4 mt-4">
                    <button
                      type="submit"
                      className="flex-grow bg-[var(--primary)] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-8 border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onPrintBill={handlePrintBill}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReelModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReelModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="bg-black p-5 flex justify-between items-center">
                <h3 className="text-white font-serif text-xl">{editingReel ? 'Edit Reel' : 'Add New Reel'}</h3>
                <button onClick={() => setShowReelModal(false)} className="text-white hover:opacity-70">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmitReel} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Reel Preview / Image</label>
                    <div className="flex justify-center">
                      {reelFormData.image ? (
                        <div className="relative group w-32 aspect-[9/16] rounded-2xl overflow-hidden border-2 border-[var(--primary)] shadow-lg">
                          <img src={reelFormData.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setReelFormData({ ...reelFormData, image: '' })}
                            className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow-md"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className={`w-32 aspect-[9/16] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all ${uploadingImage ? 'opacity-50' : ''}`}>
                          <input type="file" className="hidden" accept="image/*" onChange={handleReelImageUpload} />
                          {uploadingImage ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Plus size={24} />
                              <span className="text-[10px] font-black uppercase mt-2">Upload</span>
                            </div>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Tag (e.g. #NewArrival)</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 mt-1"
                        value={reelFormData.tag}
                        onChange={(e) => setReelFormData({ ...reelFormData, tag: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Instagram Handle</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 mt-1"
                        value={reelFormData.handle}
                        onChange={(e) => setReelFormData({ ...reelFormData, handle: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Display Order</label>
                      <input
                        type="number"
                        required
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 mt-1"
                        value={reelFormData.order}
                        onChange={(e) => setReelFormData({ ...reelFormData, order: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-3">
                    <button
                      type="submit"
                      disabled={uploadingImage}
                      className="flex-grow bg-[var(--primary)] text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                    >
                      {editingReel ? 'Update Reel' : 'Create Reel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReelModal(false)}
                      className="px-8 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </Motion.div>
          </div>
        )}

        {/* Coupon Modal */}
        {showCouponModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCouponModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <Motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-lg relative z-10">
              <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-5 flex items-center justify-between">
                  <h3 className="text-white font-serif text-xl">{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h3>
                  <button onClick={() => setShowCouponModal(false)} className="text-white hover:opacity-70"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmitCoupon} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Code *</label>
                      <input type="text" required value={couponFormData.code} onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none font-bold uppercase tracking-wider" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Discount Type</label>
                      <select value={couponFormData.discountType} onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-purple-500/20 outline-none font-bold">
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</label>
                    <input type="text" value={couponFormData.description} onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })} placeholder="Festival sale discount" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-purple-500/20 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {couponFormData.discountType === 'percentage' ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Discount %</label>
                          <input type="number" min="1" max="100" value={couponFormData.discountPercent} onChange={(e) => setCouponFormData({ ...couponFormData, discountPercent: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-400">Max Discount (₹)</label>
                          <input type="number" min="0" value={couponFormData.maxDiscount} onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold" />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Flat Discount (₹)</label>
                        <input type="number" min="0" value={couponFormData.discountAmount} onChange={(e) => setCouponFormData({ ...couponFormData, discountAmount: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Min Order (₹)</label>
                      <input type="number" min="0" value={couponFormData.minOrderAmount} onChange={(e) => setCouponFormData({ ...couponFormData, minOrderAmount: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Usage Limit</label>
                      <input type="number" min="0" value={couponFormData.usageLimit} onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Expiry Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={couponFormData.expiryDate ? new Date(new Date(couponFormData.expiryDate).getTime() - new Date(couponFormData.expiryDate).getTimezoneOffset()*60000).toISOString().slice(0,16) : ''} 
                      onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null })} 
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold focus:ring-2 focus:ring-purple-500/20" 
                    />
                    <p className="text-[10px] text-gray-400">Optional. Coupon will automatically stop working after this point.</p>
                  </div>
                  {(() => {
                    const isCouponExpired = couponFormData.expiryDate && new Date(couponFormData.expiryDate) < new Date();
                    return (
                      <div className={`flex items-center space-x-3 p-4 rounded-xl ${isCouponExpired ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <input 
                          type="checkbox" 
                          disabled={isCouponExpired}
                          checked={isCouponExpired ? false : couponFormData.isActive} 
                          onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })} 
                          className="w-5 h-5 rounded accent-purple-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed" 
                        />
                        <div className="flex flex-col">
                          <label className={`text-sm font-bold ${isCouponExpired ? 'text-red-700' : 'text-gray-700'}`}>Coupon is Active</label>
                          {isCouponExpired && <span className="text-[10px] text-red-600 mt-0.5 font-medium">Expired coupons cannot be activated. Extend the expiry date first.</span>}
                        </div>
                      </div>
                    );
                  })()}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingCoupon}
                      className={`flex-grow bg-purple-600 text-white py-3.5 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center ${isSubmittingCoupon ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmittingCoupon ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        editingCoupon ? 'Update Coupon' : 'Create Coupon'
                      )}
                    </button>
                    <button type="button" onClick={() => setShowCouponModal(false)} className="px-8 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
                  </div>
                </form>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components for Admin
const OrderDetailModal = ({ order, onClose, onUpdateStatus, onDeleteOrder, onPrintBill }) => {
  if (!order) return null;



  const orderId = String(order?._id || order?.id || '').toUpperCase();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <Motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="h-32 bg-black p-8 flex justify-between items-start">
          <div>
            <h3 className="text-white font-serif text-3xl">Order Management</h3>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-white/70 text-xs font-black uppercase tracking-widest">Order #{orderId || 'N/A'}</p>
              <button
                onClick={() => onPrintBill(order)}
                className="flex items-center space-x-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Printer size={12} />
                <span>Print Bill</span>
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><Clock size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Date</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(order?.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><Truck size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Status</p>
                <p className={`text-sm font-bold ${order?.status === 'Delivered' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>{order?.status || 'Processing'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><ShoppingBag size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Total</p>
                <p className="text-sm font-bold text-gray-900">₹{(Number(order?.totalPrice) || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-xl text-[var(--primary)]"><CheckCircle size={18} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400">Payment</p>
                <p className="text-sm font-bold text-gray-900">{order?.paymentMethod || 'COD'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">Customer Details</h4>
              <p className="text-sm font-bold text-gray-900 mb-1">{order?.email || 'N/A'}</p>
              <p className="text-xs text-gray-500 mb-1">UID: {order?.user || 'Guest'}</p>
              <p className="text-sm text-gray-500">{order?.shippingAddress?.phone || 'N/A'}</p>
            </div>
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)] mb-4">Shipping Address</h4>
              <p className="text-sm font-bold text-gray-900 mb-1">{order?.shippingAddress?.street || order?.shippingAddress?.address || 'N/A'}</p>
              <p className="text-sm text-gray-500">
                {order?.shippingAddress?.city || 'N/A'}, {order?.shippingAddress?.state || 'N/A'} - {order?.shippingAddress?.pincode || order?.shippingAddress?.postalCode || 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">Order Items</h4>
            {(order?.orderItems || []).map((item, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                <img
                  src={item?.image || item?.images?.[0] || '/placeholder.png'}
                  className="w-16 aspect-[3/4] object-contain bg-white rounded-xl shadow-sm border border-gray-100"
                  alt={item?.name || 'Item'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.png';
                  }}
                />
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-900">{item?.name || 'Unnamed Item'}</p>
                  <p className="text-xs text-gray-400">Quantity: {item?.quantity || 1}</p>
                </div>
                <p className="font-bold text-gray-900">₹{(Number(item?.price || 0) * Number(item?.quantity || 1)).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 mb-4">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              {['Processing', 'Shipped', 'Delivered'].map((status) => (
                <button
                  key={status}
                  onClick={() => onUpdateStatus(order?._id || order?.id, status)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${order?.status === status
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                    }`}
                >
                  {status}
                </button>
              ))}
              <button
                onClick={() => onDeleteOrder(order?._id || order?.id)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 md:ml-auto"
              >
                Mark as Fake
              </button>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default Admin;
