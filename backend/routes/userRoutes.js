// =============================================
// routes/userRoutes.js
// =============================================

const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, getManagers } = require('../controllers/userController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// GET /api/users/managers - Managers list (for assignment dropdown)
router.get('/managers', protect, getManagers);

// GET /api/users - Admin: all users, Manager: own team members
router.get('/', protect, checkRole('admin', 'manager'), getAllUsers);

// GET /api/users/:id
router.get('/:id', protect, checkRole('admin', 'manager'), getUserById);

// PUT /api/users/:id - Admin only
router.put('/:id', protect, checkRole('admin'), updateUser);

// DELETE /api/users/:id - Admin only
router.delete('/:id', protect, checkRole('admin'), deleteUser);

module.exports = router;
