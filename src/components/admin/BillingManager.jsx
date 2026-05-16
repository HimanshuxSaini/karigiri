import React, { useState, useMemo } from 'react';
import { Search, Printer, Eye } from 'lucide-react';

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

const BillingManager = ({ orders, handlePrintBill, setSelectedOrder }) => {
  const [orderSearch, setOrderSearch] = useState('');

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const searchLower = orderSearch.toLowerCase();
    return orders.filter(o => {
      const idMatch = String(o?._id || o?.id || '').toLowerCase().includes(searchLower);
      const phoneMatch = String(o?.shippingAddress?.phone || '').includes(orderSearch);
      const emailMatch = String(o?.email || '').toLowerCase().includes(searchLower);
      
      const isSuspicious = o.isDeletedByAdmin === true || o.status?.includes('Suspicious');
      if (isSuspicious) return false;

      return idMatch || phoneMatch || emailMatch;
    });
  }, [orders, orderSearch]);

  return (
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
  );
};

export default BillingManager;
