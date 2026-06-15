import React from 'react';
import { Tag, Plus, Edit3, Trash2 } from 'lucide-react';
import { deleteCoupon } from '../../services/api';
import { useToastStore } from '../../store/useStore';

const CouponManager = ({ coupons, setCoupons, setEditingCoupon, setCouponFormData, setShowCouponModal }) => {
  const { showToast } = useToastStore();

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter(c => (c._id || c.id) !== id));
      showToast('Coupon deleted', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete coupon', 'error');
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-serif font-bold text-gray-900">Coupons</h3>
          <p className="text-sm text-gray-500">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setCouponFormData({ code: '', description: '', discountType: 'percentage', discountPercent: 10, discountAmount: 0, maxDiscount: 500, minOrderAmount: 499, usageLimit: 100, isActive: true });
            setShowCouponModal(true);
          }}
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
                {coupons.map((coupon) => {
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                  const isTrulyActive = coupon.isActive && !isExpired;
                  
                  return (
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
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isTrulyActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isTrulyActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditCoupon(coupon)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteCoupon(coupon._id || coupon.id)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
