const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');

// Define routes
router.route('/')
  .get(getSettings)
  .post(updateSettings); // Assuming the admin panel uses POST (or PUT) to update settings

module.exports = router;
