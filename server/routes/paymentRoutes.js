const express = require('express');
const router = express.Router();
const { createRazorpayOrder } = require('../controllers/paymentController');

// Define rate limiting or authentication middleware if needed
router.post('/create-razorpay-order', createRazorpayOrder);

module.exports = router;
