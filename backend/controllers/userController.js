// =============================================
// controllers/userController.js
// User management - Admin (English)
// =============================================

const User = require('../models/User');

// ---- Get All Users ----
// GET /api/users - Admin: all, Manager: own team
const getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === 'admin') {
      users = await User.find().select('-password').populate('manager', 'name email');
    } else if (req.user.role === 'manager') {
      users = await User.find({ manager: req.user._id }).select('-password');
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Get Single User ----
// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'name email');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Update User (Admin only) ----
// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, password, department, role, managerId, isActive, leaveBalance } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (password && password.trim().length > 0) user.password = password.trim();
    if (department) user.department = department.trim();
    if (role) user.role = role;
    if (managerId !== undefined) user.manager = managerId || null;
    if (isActive !== undefined) user.isActive = isActive;
    if (leaveBalance) user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };

    await user.save();
    res.json({ message: 'User updated successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Delete User (Admin only) ----
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ---- Get All Managers (for dropdown) ----
// GET /api/users/managers
const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('name email department');
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getManagers };
