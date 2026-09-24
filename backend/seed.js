// =============================================
// seed.js - Fresh Start Database Seeder
// Clears all existing data (leaves & extra users)
// Keeps ONLY 3 clean accounts:
// 1. Admin: Devji
// 2. Manager: Manish
// 3. Employee: Maulik (reporting to Manish)
//
// Run: node seed.js
// =============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Leave = require('./models/Leave');

dotenv.config();

const freshStartSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!');

    // 1. Clear all leave applications
    const leavesDeleted = await Leave.deleteMany({});
    console.log(`🗑️  All leave records deleted (${leavesDeleted.deletedCount} removed)`);

    // 2. Clear all users
    const usersDeleted = await User.deleteMany({});
    console.log(`🗑️  All previous users deleted (${usersDeleted.deletedCount} removed)`);

    // 3. Create Admin: Devji
    const admin = await User.create({
      name: 'Devji',
      email: 'devji1@gmail.com',
      password: 'devji1',
      role: 'admin',
      department: 'HR',
      leaveBalance: { casual: 12, sick: 10, earned: 15 }
    });
    console.log('✅ Admin created:', admin.name, `(${admin.email})`);

    // 4. Create Manager: Manish
    const manager = await User.create({
      name: 'Manish',
      email: 'manish1@gmail.com',
      password: 'manish1',
      role: 'manager',
      department: 'IT',
      leaveBalance: { casual: 12, sick: 10, earned: 15 }
    });
    console.log('✅ Manager created:', manager.name, `(${manager.email})`);

    // 5. Create Employee: Maulik (reports to Manager Manish)
    const employee = await User.create({
      name: 'Maulik',
      email: 'maulik1@gmail.com',
      password: 'maulik1',
      role: 'employee',
      department: 'IT',
      manager: manager._id,
      leaveBalance: { casual: 12, sick: 10, earned: 15 }
    });
    console.log('✅ Employee created:', employee.name, `(${employee.email}) - Manager: Manish`);

    // ---- Print Summary ----
    console.log('\n========================================');
    console.log('🎉 FRESH START READY - ONLY 3 USERS REMAIN:');
    console.log('========================================');
    console.log('👑 ADMIN');
    console.log('   Name    : Devji');
    console.log('   Email   : devji1@gmail.com');
    console.log('   Password: devji1');
    console.log('   Role    : admin');
    console.log('');
    console.log('🧑‍💼 MANAGER');
    console.log('   Name    : Manish');
    console.log('   Email   : manish1@gmail.com');
    console.log('   Password: manish1');
    console.log('   Role    : manager');
    console.log('');
    console.log('👤 EMPLOYEE');
    console.log('   Name    : Maulik');
    console.log('   Email   : maulik1@gmail.com');
    console.log('   Password: maulik1');
    console.log('   Role    : employee (Under Manish)');
    console.log('========================================');
    console.log('🌐 Frontend: http://localhost:5173/login');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

freshStartSeed();
