// =============================================
// routes/authRoutes.js
// =============================================

const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// POST /api/auth/register - Only Admin can register employee / manager
router.post('/register', protect, checkRole('admin'), register);

// POST /api/auth/login
router.post('/login', login);

// GET & PUT /api/auth/profile (requires authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
