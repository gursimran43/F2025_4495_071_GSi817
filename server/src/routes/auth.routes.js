const express = require('express');
const { signup, login, getMe, updateProfile, verifyOtp } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { signupValidation, loginValidation } = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;