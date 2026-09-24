// =============================================
// models/Leave.js - Leave Schema (MongoDB)
// =============================================

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({

  // Applicant reference (Employee or Manager)
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Leave category/type
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'earned'],
    required: true
  },

  // Leave dates
  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  // Total duration in days
  totalDays: {
    type: Number,
    required: true
  },

  // Reason for leave
  reason: {
    type: String,
    required: true
  },

  // Manager review decision
  managerStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  managerRemark: {
    type: String,
    default: ''
  },

  // Admin review decision (final)
  adminStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  adminRemark: {
    type: String,
    default: ''
  },

  // Final overall leave status
  // pending   -> under review
  // approved  -> request approved
  // rejected  -> request rejected
  // cancelled -> cancelled by applicant
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
