import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  ShoppingBag, 
  LayoutDashboard, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  ExternalLink,
  RotateCcw,
  Eye,
  ShieldCheck,
  Users,
  Smartphone
} from 'lucide-react';

import { 
  fetchProducts, 
  deleteProduct, 
  createProduct, 
  updateProduct, 
  fetchOrders, 
  updateOrderStatus, 
  uploadProductImage 
} from '../services/api';
import { useAuthStore } from '../store/useStore';
import { Navigate, Link, useLocation } from 'react-router-dom';


const Admin = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Men',
    subCategory: '',
    description: '',
    image: '',
    brand: 'KARIGIRI',
    inStock: true
  });

  // Admin Check
  const isAdmin = user?.email === 'himanshu0481@gmail.com' || user?.email === 'admin@karigiri.com';

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
        brand: product.brand,
        inStock: product.inStock
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
      const [prodRes, orderRes] = await Promise.all([
        fetchProducts(),
        fetchOrders()
      ]);
      setProducts(prodRes || []);
      setOrders(orderRes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to connect to Firestore. Please check your Firebase configuration and internet connection.');
    } finally {
      setLoading(false);
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
      const statusMatch = orderFilter === 'All' || o?.status === orderFilter;
      return statusMatch && (idMatch || phoneMatch || emailMatch);
    });
  }, [orders, orderSearch, orderFilter]);

  const statsData = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : [];
    const productsArray = Array.isArray(products) ? products : [];

    const totalRevenue = ordersArray.reduce((acc, o) => acc + (Number(o?.totalPrice) || 0), 0);
    const pendingOrders = ordersArray.filter(o => o?.status === 'Processing').length;

    return [
      { label: 'TOTAL REVENUE', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <ShoppingBag className="text-emerald-500" />, color: "bg-emerald-50" },
      { label: 'TOTAL ORDERS', value: ordersArray.length, icon: <Package className="text-blue-500" />, color: "bg-blue-50" },
      { label: 'TOTAL PRODUCTS', value: productsArray.length, icon: <LayoutDashboard className="text-purple-500" />, color: "bg-purple-50" },
      { label: 'PENDING ORDERS', value: pendingOrders, icon: <Clock className="text-amber-500" />, color: "bg-amber-50" },
    ];
  }, [orders, products]);

  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    try {
      // Handle Firestore Timestamp
      if (dateObj.toDate && typeof dateObj.toDate === 'function') {
        return dateObj.toDate().toLocaleDateString();
      }
      // Handle Date object or string
      const date = new Date(dateObj);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        showNotification('Product deleted');
      } catch (err) {
        showNotification('Failed to delete product', 'error');
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
      brand: product.brand,
      inStock: product.inStock
    });
    setShowProductModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setFormData({ ...formData, image: url });
      showNotification('Image uploaded successfully');
    } catch (err) {
      console.error("Upload handler error:", err);
      showNotification(err.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
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
        name: '', price: '', category: 'Men', subCategory: '', description: '', image: '', brand: 'KARIGIRI', inStock: true
      });
    } catch (err) {
      showNotification('Failed to save product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders(orders.map(o => o._id === id ? updated : o));
      if (selectedOrder?._id === id) setSelectedOrder(updated);
      showNotification(`Order marked as ${status}`);
    } catch (err) {
      console.error('Order update failed:', err);
      showNotification('Failed to update order status', 'error');
    }
  };




  // Auth check is handled by ProtectedRoute in App.jsx

  const Stats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statsData.map((stat, i) => (
        <motion.div 
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
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border ${
              notification.type === 'error' 
                ? 'bg-red-50 border-red-100 text-red-800' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}
          >
            {notification.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
            <span className="text-sm font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Admin Control</h1>
              <p className="text-gray-500 mt-2 font-medium">Managing <span className="text-[var(--primary)] font-bold">Karigiri Artisanal Collection</span></p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all"
              >
                <ExternalLink size={14} />
                <span>View Site</span>
              </Link>
            </div>
          </div>

          {/* Horizontal Tab Navigation */}
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
            <div className="flex items-center min-w-max md:min-w-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-[0.15em] ${
                    activeTab === tab.id 
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
          <motion.div
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
                        orders.slice(0, 5).map((order, idx) => (
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
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                                order?.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
                          const displayCats = ['Infants', 'Girls', 'Women', 'Men', 'Yarn', 'Laddu Gopal'];
                          
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

                  {/* Phone Verification Feature Card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black p-8 rounded-[3rem] text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                          <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-2xl font-bold">Security Features</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group/item">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                               <Smartphone size={20} />
                            </div>
                            <div className="flex items-center space-x-2">
                               <Eye size={16} className="text-white/40 group-hover/item:text-emerald-400 transition-colors" />
                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <h4 className="text-lg font-bold mb-1">Phone Verification</h4>
                          <p className="text-sm text-white/50 leading-relaxed">SMS OTP authentication is active and securing user transactions.</p>
                        </div>

                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 opacity-50 grayscale hover:grayscale-0 transition-all">
                           <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                               <ShieldCheck size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/10 px-2 py-1 rounded">Coming Soon</span>
                          </div>
                          <h4 className="text-lg font-bold mb-1">Two-Factor Auth</h4>
                          <p className="text-sm text-white/30 leading-relaxed">Advanced biometric and multi-device authentication layer.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </>
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
                          category: 'Men',
                          subCategory: '',
                          description: '',
                          image: '',
                          brand: 'KARIGIRI',
                          inStock: true
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
                  <table className="w-full text-left">
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
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                  <img 
                                    src={p?.image || 'https://placehold.co/150?text=No+Image'} 
                                    alt={p?.name || 'Product'} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                      e.target.onerror = null; // Prevent infinite loop
                                      e.target.src = 'https://placehold.co/150?text=Error';
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{p?.name || 'Unnamed Product'}</p>
                                  <p className="text-xs text-gray-400">{p?.brand || 'KARIGIRI'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
                                  p?.category === 'Infants' ? 'bg-blue-50 text-blue-600' :
                                  p?.category === 'Girls' ? 'bg-pink-50 text-pink-600' :
                                  p?.category === 'Women' ? 'bg-rose-50 text-rose-600' :
                                  p?.category === 'Men' ? 'bg-slate-100 text-slate-700' :
                                  p?.category === 'Yarn' ? 'bg-emerald-50 text-emerald-600' :
                                  p?.category === 'Laddu Gopal' ? 'bg-amber-50 text-amber-700' :
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
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                p?.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {p?.inStock ? 'In Stock' : 'Out of Stock'}
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
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
                    {['All', 'Processing', 'Shipped', 'Delivered'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setOrderFilter(status)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          orderFilter === status 
                            ? 'bg-black text-white' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {status}
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
                          <motion.div 
                            key={order?._id || order?.id || `order-${idx}`}
                            layout
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                <h4 className="font-bold text-lg">#{String(order?._id || order?.id || '').slice(-8).toUpperCase() || 'NEW-ORDER'}</h4>
                              </div>
                              <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                                order?.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
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
                            </div>
                          </motion.div>
                        ))
                      )}
                </div>
              </div>
            )}
          </motion.div>
        )}
        </motion.div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-serif font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {['Infants', 'Girls', 'Women', 'Men', 'Yarn', 'Laddu Gopal'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  {formData.category === 'Infants' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Infant Sub-Category</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Winterwear">
                          {['Handmade Sweaters', 'Handcrafted Sweaters', 'Frocks', 'Poncho', 'Vests', 'Booties', 'Cap Mitten Set', 'Rompers / Jumpsuits', 'Winterwear Sets', 'Caps'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Photoprops">
                          {['Mermaid', 'Beach Theme', 'Jungle Theme', 'Christmas Theme', 'Sports', 'Fruits and Veggies'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Accessories">
                          {['Mufflers', 'Cap Muffler Set', 'Headband', 'Socks', 'Gloves', 'Hair Accessories'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Home & Living">
                          {['Blankets', 'Cushions'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Girls' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Girls Sub-Category</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Summerwear">
                          {['Crochet Tops for Girls', 'Casual Dresses', 'Girls Co-ords', 'Party Dresses', 'Socks and Tights', 'Ethnic Wear'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Winterwear">
                          {['Sweaters'].map(s => (
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
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
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
                          {['Macrame Belts', 'Earrings', 'Crochet Scarf', 'Winter Headbands', 'Summer Headbands'].map(s => (
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
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      >
                        <option value="">Select Sub-Category</option>
                        <option value="Sweaters">Sweaters (Winterwear)</option>
                      </select>
                    </div>
                  )}

                  {formData.category === 'Yarn' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yarn Sub-Category</label>
                      <select 
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                      >
                        <option value="">Select Sub-Category</option>
                        <optgroup label="Yarn Types">
                          {['100% Acrylic Yarn'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Product Image</label>
                    <div className="flex items-center space-x-4">
                      {formData.image && (
                        <img src={formData.image} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border border-gray-100" />
                      )}
                      <div className="flex-grow">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="product-image-upload"
                        />
                        <label 
                          htmlFor="product-image-upload"
                          className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex flex-col items-center justify-center py-2">
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                            ) : (
                              <>
                                <Plus size={20} className="text-gray-400" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Upload File</p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                      <div className="flex-grow">
                        <input 
                          placeholder="Or paste Image URL"
                          type="text" 
                          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      required
                      rows="3"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="inStock"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                      className="w-5 h-5 accent-[var(--primary)]"
                    />
                    <label htmlFor="inStock" className="text-sm font-bold text-gray-700">Available in Stock</label>
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components for Admin
const OrderDetailModal = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    try {
      if (dateObj.toDate && typeof dateObj.toDate === 'function') {
        return dateObj.toDate().toLocaleDateString();
      }
      const date = new Date(dateObj);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const orderId = String(order?._id || order?.id || '').toUpperCase();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="h-32 bg-black p-8 flex justify-between items-start">
          <div>
            <h3 className="text-white font-serif text-3xl">Order Management</h3>
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mt-1">Order #{orderId || 'N/A'}</p>
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
                <p className={`text-sm font-bold ${
                  order?.status === 'Delivered' ? 'text-emerald-600' : 'text-amber-600'
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
                  src={item?.image || 'https://placehold.co/150?text=Item'} 
                  className="w-16 h-16 object-cover rounded-xl shadow-sm" 
                  alt={item?.name || 'Item'} 
                  onError={(e) => { 
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/150?text=Error';
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
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    order?.status === status
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;
