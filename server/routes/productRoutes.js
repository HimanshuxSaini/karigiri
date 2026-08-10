const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Validation middleware
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required').escape(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim().escape(),
  body('category').optional().trim().escape(),
  body('brand').optional().trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.route('/').get(getProducts).post(protectAdmin, validateProduct, createProduct);
router.route('/:id').get(getProductById).delete(protectAdmin, deleteProduct).put(protectAdmin, validateProduct, updateProduct);

module.exports = router;
