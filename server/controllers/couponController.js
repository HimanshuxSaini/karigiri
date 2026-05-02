const admin = require('firebase-admin');

const couponsCollection = () => admin.firestore().collection('coupons');

const normalizeCouponPayload = (payload = {}) => ({
  code: String(payload.code || '').toUpperCase().trim(),
  description: String(payload.description || '').trim(),
  discountType: payload.discountType === 'flat' ? 'flat' : 'percentage',
  discountPercent: Number(payload.discountPercent || 0),
  discountAmount: Number(payload.discountAmount || 0),
  maxDiscount: Number(payload.maxDiscount || 0),
  minOrderAmount: Number(payload.minOrderAmount || 0),
  usageLimit: Number(payload.usageLimit || 0),
  isActive: payload.isActive !== false,
});

const validateCouponPayload = (payload) => {
  if (!payload.code) {
    return 'Coupon code is required';
  }

  if (payload.discountType === 'percentage') {
    if (payload.discountPercent <= 0 || payload.discountPercent > 100) {
      return 'Discount percent must be between 1 and 100';
    }
  } else if (payload.discountAmount <= 0) {
    return 'Flat discount amount must be greater than 0';
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

    const duplicateCoupon = await couponsCollection()
      .where('code', '==', couponData.code)
      .limit(1)
      .get();

    if (!duplicateCoupon.empty) {
      return res.status(409).json({ message: 'A coupon with this code already exists' });
    }

    const docRef = await couponsCollection().add({
      ...couponData,
      usedCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const savedCoupon = await docRef.get();
    return res.status(201).json({ _id: savedCoupon.id, id: savedCoupon.id, ...savedCoupon.data() });
  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({ message: 'Failed to create coupon', error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const couponRef = couponsCollection().doc(id);
    const existingSnapshot = await couponRef.get();

    if (!existingSnapshot.exists) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const couponData = normalizeCouponPayload(req.body);
    const validationError = validateCouponPayload(couponData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicateCoupon = await couponsCollection()
      .where('code', '==', couponData.code)
      .limit(5)
      .get();

    const hasDuplicate = duplicateCoupon.docs.some((doc) => doc.id !== id);
    if (hasDuplicate) {
      return res.status(409).json({ message: 'Another coupon already uses this code' });
    }

    await couponRef.update({
      ...couponData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedSnapshot = await couponRef.get();
    return res.json({ _id: updatedSnapshot.id, id: updatedSnapshot.id, ...updatedSnapshot.data() });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const couponRef = couponsCollection().doc(id);
    const existingSnapshot = await couponRef.get();

    if (!existingSnapshot.exists) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await couponRef.delete();
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const snapshot = await couponsCollection().get();
    const coupons = snapshot.docs.map((doc) => ({
      _id: doc.id,
      id: doc.id,
      ...doc.data(),
    }));
    return res.json(coupons);
  } catch (error) {
    console.error('Get all coupons error:', error);
    return res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const snapshot = await couponsCollection()
      .where('code', '==', code.toUpperCase().trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const coupon = snapshot.docs[0].data();
    coupon.id = snapshot.docs[0].id;

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
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
    } else {
      discount = coupon.discountAmount;
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountType === 'percentage' ? coupon.discountPercent : coupon.discountAmount,
        discountAmount: discount,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
  }
};


module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
};
