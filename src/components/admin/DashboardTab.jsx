import React, { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  ShoppingBag,
  Package,
  LayoutDashboard,
  Eye,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

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

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F43F5E', '#F59E0B', '#14B8A6'];

const DashboardTab = ({ products, orders, reels, setActiveTab }) => {
  const activeOrders = useMemo(() => {
    return Array.isArray(orders) ? orders.filter(o => !o.isDeletedByAdmin && !o.status?.includes('Suspicious')) : [];
  }, [orders]);

  const statsData = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : [];
    const reelsArray = Array.isArray(reels) ? reels : [];

    const totalRevenue = activeOrders.reduce((acc, o) => acc + (Number(o?.totalPrice) || 0), 0);

    return [
      { label: 'TOTAL REVENUE', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <ShoppingBag className="text-emerald-500" />, color: "bg-emerald-50" },
      { label: 'TOTAL ORDERS', value: activeOrders.length, icon: <Package className="text-blue-500" />, color: "bg-blue-50" },
      { label: 'TOTAL PRODUCTS', value: productsArray.length, icon: <LayoutDashboard className="text-purple-500" />, color: "bg-purple-50" },
      { label: 'REELS (MOTION)', value: reelsArray.length, icon: <Eye className="text-rose-500" />, color: "bg-rose-50" },
    ];
  }, [activeOrders, products, reels]);

  const revenueData = useMemo(() => {
    const dailyData = {};
    activeOrders.forEach(order => {
      const date = formatDate(order?.createdAt);
      if (date !== 'N/A') {
        if (!dailyData[date]) {
          dailyData[date] = 0;
        }
        dailyData[date] += Number(order?.totalPrice) || 0;
      }
    });

    return Object.entries(dailyData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')))
      .slice(-14); // Last 14 days
  }, [activeOrders]);

  const categoryData = useMemo(() => {
    const catCounts = {};
    if (Array.isArray(products)) {
      products.forEach(p => {
        const cat = p?.category || 'Uncategorized';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
    }
    return Object.entries(catCounts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const orderStatusData = useMemo(() => {
    const statusCounts = {};
    activeOrders.forEach(order => {
      const status = order?.status || 'Pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [activeOrders]);

  const lowStockProducts = useMemo(() => {
    return Array.isArray(products) 
      ? products.filter(p => p.stockCount !== undefined && p.stockCount <= 5).sort((a, b) => a.stockCount - b.stockCount)
      : [];
  }, [products]);

  return (
    <>
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue Trend (Last 14 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Product Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Order Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-sm text-[var(--primary)] font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {activeOrders.length > 0 ? (
              activeOrders.slice(0, 5).map((order, idx) => (
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

        {/* Inventory Alerts */}
        <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 relative group overflow-hidden shadow-sm">
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
      </div>
    </>
  );
};

export default DashboardTab;
