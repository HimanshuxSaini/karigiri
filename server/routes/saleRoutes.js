const express = require('express');
const router = express.Router();
const { getFlashSale, updateFlashSale } = require('../controllers/saleController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getFlashSale)
  .post(protectAdmin, updateFlashSale);

module.exports = router;
