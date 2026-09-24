// =============================================
// config/db.js - MongoDB Connection
// =============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGO_URI is loaded from .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    process.exit(1); // Exit server on connection failure
  }
};

module.exports = connectDB;
