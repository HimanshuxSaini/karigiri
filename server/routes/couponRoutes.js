const express = require('express');
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
  incrementCouponUsage,
} = require('../controllers/couponController');

const router = express.Router();

router.get('/', getAllCoupons);
router.post('/validate', validateCoupon);
router.post('/:id/increment', incrementCouponUsage); // Anyone can increment upon checkout success
router.post('/', protectAdmin, createCoupon);
router.put('/:id', protectAdmin, updateCoupon);
router.delete('/:id', protectAdmin, deleteCoupon);

module.exports = router;
