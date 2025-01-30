const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth'); // Add this import

// Public route
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);

// Admin only routes
router.post('/register', auth, adminAuth, register);

module.exports = router;