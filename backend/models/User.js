// =============================================
// models/User.js - User Schema (MongoDB)
// =============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  // Role: admin, manager, or employee
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },

  // Department name
  department: {
    type: String,
    default: 'General'
  },

  // Reference to assigned Manager (for employees)
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Leave balance
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    earned: { type: Number, default: 15 }
  },

  // Account active status flag
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// ---- Password Hashing ----
// Hash password before saving to database
userSchema.pre('save', async function (next) {
  // Skip hashing if password was not modified
  if (!this.isModified('password')) return next();

  // Hash password with bcrypt (salt rounds = 10)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Password Compare Method ----
// Compare entered password with hashed password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
