// =============================================
// server.js - Main Entry Point of Backend
// =============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Create express app
const app = express();

// ---- Middleware ----
app.use(cors());                        // Allow frontend to connect
app.use(express.json());               // Accept JSON data

// ---- Routes ----
app.use('/api/auth', require('./routes/authRoutes'));    // Login, Register
app.use('/api/leaves', require('./routes/leaveRoutes')); // Leave CRUD
app.use('/api/users', require('./routes/userRoutes'));   // User Management

// ---- Root Route ----
app.get('/', (req, res) => {
  res.json({ message: 'Leave Management API is running!' });
});

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
