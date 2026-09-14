const Coupon = require('../models/Coupon');

const normalizeCouponPayload = (payload = {}) => ({
  code: String(payload.code || '').toUpperCase().trim(),
  description: String(payload.description || '').trim(),
  discountType: ['flat', 'percentage', 'free_shipping'].includes(payload.discountType) ? payload.discountType : 'percentage',
  discountPercent: Number(payload.discountPercent || 0),
  discountAmount: Number(payload.discountAmount || 0),
  maxDiscount: Number(payload.maxDiscount || 0),
  minOrderAmount: Number(payload.minOrderAmount || 0),
  usageLimit: Number(payload.usageLimit || 0),
  isActive: payload.isActive !== false,
  validFrom: payload.validFrom ? new Date(payload.validFrom) : new Date(),
  validUntil: payload.expiryDate ? new Date(payload.expiryDate) : (payload.validUntil ? new Date(payload.validUntil) : null)
});

const validateCouponPayload = (payload) => {
  if (!payload.code) {
    return 'Coupon code is required';
  }

  if (payload.discountType === 'percentage') {
    if (payload.discountPercent <= 0 || payload.discountPercent > 100) {
      return 'Discount percent must be between 1 and 100';
    }
  } else if (payload.discountType === 'flat') {
    if (payload.discountAmount <= 0) {
      return 'Flat discount amount must be greater than 0';
    }
  }

  if (payload.minOrderAmount < 0 || payload.maxDiscount < 0 || payload.usageLimit < 0) {
    return 'Coupon amounts and usage limit must be 0 or more';
  }

  return null;
};

const createCoupon = async (req, res) => {
  try {
    const couponData = normalizeCouponPayload(req.body);
    const validationError = validateCouponPayload(couponData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicateCoupon = await Coupon.findOne({ code: couponData.code });
    if (duplicateCoupon) {
      return res.status(409).json({ message: 'A coupon with this code already exists' });
    }

    // fallback for validUntil if not provided properly (e.g. valid for 100 years default)
    if (!couponData.validUntil) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 100);
      couponData.validUntil = d;
    }

    const newCoupon = await Coupon.create({
      ...couponData,
      usedCount: 0
    });

    return res.status(201).json({ 
      ...newCoupon.toObject(), 
      _id: newCoupon._id.toString(), 
      id: newCoupon._id.toString() 
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const couponData = normalizeCouponPayload(req.body);
    const validationError = validateCouponPayload(couponData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicateCoupon = await Coupon.findOne({ code: couponData.code, _id: { $ne: id } });
    if (duplicateCoupon) {
      return res.status(409).json({ message: 'Another coupon already uses this code' });
    }

    if (!couponData.validUntil && !coupon.validUntil) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 100);
      couponData.validUntil = d;
    } else if (!couponData.validUntil) {
       couponData.validUntil = coupon.validUntil;
    }

    Object.assign(coupon, couponData);
    await coupon.save();

    return res.json({ 
      ...coupon.toObject(), 
      _id: coupon._id.toString(), 
      id: coupon._id.toString() 
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    const now = new Date();
    let isAdmin = false;

    if (req.query.admin === 'true' && req.headers.authorization?.startsWith('Bearer')) {
      try {
        // we could just check req.user if this went through authMiddleware, 
        // but keeping existing logic structure
        const token = req.headers.authorization.split(' ')[1];
        const admin = require('firebase-admin');
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { isAdminEmail } = require('../config/constants');
        isAdmin = isAdminEmail(decodedToken.email);
      } catch (err) {
        console.error('Failed to verify admin token for coupons:', err.message);
      }
    }

    const filteredCoupons = coupons
      .map(coupon => ({
        ...coupon.toObject(),
        _id: coupon._id.toString(),
        id: coupon._id.toString()
      }))
      .filter((coupon) => {
        if (isAdmin) return true;
        if (coupon.isActive === false) return false;
        if (coupon.validUntil && new Date(coupon.validUntil) < now) return false;
        if (coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) return false;
        return true;
      });

    return res.json(filteredCoupons);
  } catch (error) {
    console.error('Get all coupons error:', error);
    return res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountPercent) / 100;
      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'flat') {
      discount = coupon.discountAmount;
    } // free_shipping is handled by frontend delivery calc

    return res.json({
      success: true,
      coupon: {
        ...coupon.toObject(),
        _id: coupon._id.toString(),
        id: coupon._id.toString(),
        discountValue: coupon.discountType === 'percentage' ? coupon.discountPercent : coupon.discountAmount,
        discountAmount: discount,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
  }
};

const incrementCouponUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.usedCount += 1;
    await coupon.save();

    return res.json({ success: true });
  } catch (error) {
    console.error('Increment coupon usage error:', error);
    return res.status(500).json({ message: 'Failed to increment usage', error: error.message });
  }
};

module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
  incrementCouponUsage,
};
