const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  getCart, 
  updateCart, 
  getWishlist, 
  updateWishlist,
  getMyOrders
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

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
