const express = require('express');
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  validateCoupon,
} = require('../controllers/couponController');

const router = express.Router();

router.get('/', getAllCoupons);
router.post('/validate', validateCoupon);
router.post('/', protectAdmin, createCoupon);
router.put('/:id', protectAdmin, updateCoupon);
router.delete('/:id', protectAdmin, deleteCoupon);

module.exports = router;
