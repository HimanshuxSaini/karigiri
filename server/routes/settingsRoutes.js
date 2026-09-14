const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getConfig, updateConfig } = require('../controllers/settingsController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSettings)
  .post(protectAdmin, updateSettings);

router.route('/config/:key')
  .get(getConfig)
  .put(protectAdmin, updateConfig);

module.exports = router;
