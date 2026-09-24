// =============================================
// controllers/leaveController.js
// Leave apply, approve, reject logic (English)
// =============================================

const Leave = require('../models/Leave');
const User = require('../models/User');

// ---- Apply Leave ----
// POST /api/leaves/apply
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!['casual', 'sick', 'earned'].includes(leaveType)) {
      return res.status(400).json({ message: 'Invalid leave type. Only casual, sick, and earned leaves are allowed.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'End date must be on or after start date' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated or not registered' });
    }

    const balance = user.leaveBalance ? user.leaveBalance[leaveType] : undefined;
    if (balance !== undefined && balance < totalDays) {
      return res.status(400).json({
        message: `Insufficient ${leaveType} leave balance. Available: ${balance} day(s)`
      });
    }

    const isManager = user.role === 'manager';

    // Manager leave is managed by Admin (managerStatus auto-cleared)
    // Employee leave is managed by Manager (managerStatus: pending)
    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      managerStatus: isManager ? 'approved' : 'pending',
      adminStatus: 'pending',
      status: 'pending'
    });

    res.status(201).json({ message: 'Leave application submitted successfully!', leave });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- My Leaves ----
// GET /api/leaves/my - Employee / Manager views own leaves
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Team Leaves (Manager) ----
// GET /api/leaves/team - Manager views team leaves
const getTeamLeaves = async (req, res) => {
  try {
    const teamEmployees = await User.find({ manager: req.user._id });
    const teamIds = teamEmployees.map(e => e._id);

    const leaves = await Leave.find({ employee: { $in: teamIds } })
      .populate('employee', 'name email department role')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- All Leaves (Admin) ----
// GET /api/leaves/all - Admin views all organization leaves
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: 'employee',
        select: 'name email department role manager',
        populate: {
          path: 'manager',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Manager: Approve/Reject (Employee leaves managed by Manager) ----
// PUT /api/leaves/:id/manager-action
const managerAction = async (req, res) => {
  try {
    const { action, remark } = req.body;

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    // Validate employee belongs to this manager's team
    if (leave.employee.manager?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This employee does not belong to your team' });
    }

    const prevStatus = leave.status;

    leave.managerStatus = action;
    leave.managerRemark = remark || '';
    leave.status = action;

    // Deduct leave balance upon approval
    if (action === 'approved' && prevStatus !== 'approved') {
      const user = await User.findById(leave.employee._id);
      if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
        user.leaveBalance[leave.leaveType] = Math.max(0, user.leaveBalance[leave.leaveType] - leave.totalDays);
        await user.save();
      }
    } else if (action === 'rejected' && prevStatus === 'approved') {
      const user = await User.findById(leave.employee._id);
      if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
        user.leaveBalance[leave.leaveType] += leave.totalDays;
        await user.save();
      }
    }

    await leave.save();
    res.json({ message: `Leave request ${action} by Manager successfully!`, leave });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Admin: Approve/Reject (Manager leaves managed by Admin) ----
// PUT /api/leaves/:id/admin-action
const adminAction = async (req, res) => {
  try {
    const { action, remark } = req.body;

    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    // Employee leaves are managed by their respective Manager
    if (leave.employee?.role === 'employee' && leave.employee?.manager) {
      return res.status(400).json({
        message: 'Employee leaves are managed by their Manager. Admin can only view status.'
      });
    }

    const prevStatus = leave.status;
    leave.adminStatus = action;
    leave.adminRemark = remark || '';
    leave.status = action;

    // Deduct manager leave balance upon approval
    if (action === 'approved' && prevStatus !== 'approved') {
      const user = await User.findById(leave.employee._id || leave.employee);
      if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
        user.leaveBalance[leave.leaveType] = Math.max(0, user.leaveBalance[leave.leaveType] - leave.totalDays);
        await user.save();
      }
    } else if (action === 'rejected' && prevStatus === 'approved') {
      const user = await User.findById(leave.employee._id || leave.employee);
      if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
        user.leaveBalance[leave.leaveType] += leave.totalDays;
        await user.save();
      }
    }

    await leave.save();
    res.json({ message: `Manager leave request ${action} by Admin successfully!`, leave });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Cancel Leave ----
// PUT /api/leaves/:id/cancel - Employee / Manager cancels own pending leave
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to cancel this leave application' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be cancelled' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({ message: 'Leave application cancelled successfully!', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Delete Leave (Admin or Manager) ----
// DELETE /api/leaves/:id - Permanently deletes leave record from MongoDB
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    // Role authorization:
    // Admin can delete any leave in the organization
    // Manager can only delete leaves belonging to employees in their team
    if (req.user.role === 'manager') {
      const isTeamMember = leave.employee?.manager?.toString() === req.user._id.toString();
      if (!isTeamMember) {
        return res.status(403).json({ message: 'You can only delete leave records for members of your team' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied! Only Admin or Manager can delete leaves' });
    }

    // If leave was approved, restore the deducted leave balance to the user
    if (leave.status === 'approved' && leave.employee) {
      const user = await User.findById(leave.employee._id || leave.employee);
      if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
        user.leaveBalance[leave.leaveType] += leave.totalDays;
        await user.save();
      }
    }

    // Permanently remove document from MongoDB
    await Leave.findByIdAndDelete(req.params.id);

    res.json({ message: 'Leave record deleted permanently from database successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  managerAction,
  adminAction,
  cancelLeave,
  deleteLeave
};
