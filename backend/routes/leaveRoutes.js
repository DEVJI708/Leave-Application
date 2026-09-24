// =============================================
// routes/leaveRoutes.js
// =============================================

const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  managerAction,
  adminAction,
  cancelLeave,
  deleteLeave
} = require('../controllers/leaveController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// All routes are protected (authentication required)

// Employee / Manager: Apply for leave
router.post('/apply', protect, checkRole('employee', 'manager'), applyLeave);

// Employee / Manager: View own leave applications
router.get('/my', protect, getMyLeaves);

// Employee / Manager: Cancel own pending leave
router.put('/:id/cancel', protect, cancelLeave);

// Manager: View team leaves and review
router.get('/team', protect, checkRole('manager', 'admin'), getTeamLeaves);
router.put('/:id/manager-action', protect, checkRole('manager'), managerAction);

// Admin: View all leaves and review manager leaves
router.get('/all', protect, checkRole('admin'), getAllLeaves);
router.put('/:id/admin-action', protect, checkRole('admin'), adminAction);

// Admin & Manager: Permanently delete leave record from database
router.delete('/:id', protect, checkRole('admin', 'manager'), deleteLeave);

module.exports = router;
