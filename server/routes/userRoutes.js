const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  getCart, 
  updateCart, 
  getWishlist, 
  updateWishlist,
  getMyOrders,
  getAdmins,
  grantAdmin,
  updateAdminPermissions,
  revokeAdmin
} = require('../controllers/userController');
const { protect, protectSuperAdmin } = require('../middleware/authMiddleware');

// ==========================================
// Admin Management (Super Admin only)
// ==========================================
router.route('/admins')
  .get(protectSuperAdmin, getAdmins);

router.route('/admins/grant')
  .post(protectSuperAdmin, grantAdmin);

router.route('/admins/revoke')
  .post(protectSuperAdmin, revokeAdmin);

router.route('/admins/:uid/permissions')
  .put(protectSuperAdmin, updateAdminPermissions);

// ==========================================
// User Routes
// ==========================================
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/cart')
  .get(protect, getCart)
  .put(protect, updateCart);

router.route('/wishlist')
  .get(protect, getWishlist)
  .put(protect, updateWishlist);

router.route('/orders')
  .get(protect, getMyOrders);

module.exports = router;
