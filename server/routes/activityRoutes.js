const express = require('express');
const router = express.Router();
const { recordActivity, getActivities } = require('../controllers/activityController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public route to record activity from anywhere in the app
router.post('/', recordActivity);

// Admin only route to view activities
router.get('/', protectAdmin, getActivities);

module.exports = router;
