const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  updateOrderStatus
} = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/').post(addOrderItems).get(protectAdmin, getOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/deliver').put(protectAdmin, updateOrderToDelivered);
router.route('/:id/status').put(protectAdmin, updateOrderStatus);

module.exports = router;
