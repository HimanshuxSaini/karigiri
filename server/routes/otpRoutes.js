const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, forgotPassword } = require('../controllers/otpController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);

module.exports = router;
