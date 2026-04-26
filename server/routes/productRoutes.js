const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protectAdmin, createProduct);
router.route('/:id').get(getProductById).delete(protectAdmin, deleteProduct).put(protectAdmin, updateProduct);

module.exports = router;
