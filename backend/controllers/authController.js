// =============================================
// controllers/authController.js
// Login, Registration & Profile Logic (English)
// =============================================

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ---- Generate JWT Token ----
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// ---- Register User (Admin Only) ----
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, managerId, leaveBalance } = req.body;

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'employee',
      department: department ? department.trim() : 'General',
      manager: managerId || null,
      leaveBalance: leaveBalance || { casual: 12, sick: 10, earned: 15 }
    });

    res.status(201).json({
      message: 'User registered successfully!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        leaveBalance: user.leaveBalance
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Login ----
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email ? email.trim().toLowerCase() : '' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated. Please contact an administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        leaveBalance: user.leaveBalance
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Get Profile ----
// GET /api/auth/profile (protected)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('manager', 'name email');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Update Profile ----
// PUT /api/auth/profile (protected)
const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name.trim();
    if (password && password.trim().length > 0) {
      user.password = password.trim();
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        leaveBalance: user.leaveBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
