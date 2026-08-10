const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');

// Validation middleware
const validateOrder = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required').escape(),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required').escape(),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required').escape(),
  body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// POST /api/orders — Create a new order (server-validated)
router.post('/', validateOrder, createOrder);

module.exports = router;
