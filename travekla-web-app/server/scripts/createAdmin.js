// File: server/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // ✅ Correct (Goes up one folder) // 👈 Adjusted path for inside server folder

// 👇 Check if your DB name is correct (travekla)
const MONGO_URI = 'mongodb://127.0.0.1:27017/travekla';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 1. DELETE OLD ADMIN IF EXISTS (To fix the "Invalid Credentials" issue)
    await User.deleteOne({ email: 'admin@test.com' });

    // 2. HASH PASSWORD PROPERLY
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 3. CREATE NEW ADMIN USER
    const adminUser = new User({
      name: "Super Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      kycStatus: "verified",
      isVerified: true
    });

    await adminUser.save();
    console.log("------------------------------------------");
    console.log("🎉 SUCCESS: Admin User Created!");
    console.log("📧 Email:    admin@test.com");
    console.log("🔑 Password: 123456");
    console.log("------------------------------------------");

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

createAdmin();