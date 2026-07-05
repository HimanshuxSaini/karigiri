const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Define routes
router.route('/')
  .get(getSettings)
  .post(protectAdmin, updateSettings);

module.exports = router;
