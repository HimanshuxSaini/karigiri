import React, { useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Trash2 } from 'lucide-react';

const OrderManager = ({ orders, handleUpdateOrderStatus, handleDeleteOrder, setSelectedOrder }) => {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');

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
        if (isSuspicious) return false;
        statusMatch = orderFilter === 'All' || o?.status === orderFilter;
      }

      return statusMatch && (idMatch || phoneMatch || emailMatch);
    });
  }, [orders, orderSearch, orderFilter]);

  return (
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
  );
};

export default OrderManager;
