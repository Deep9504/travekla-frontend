const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // ✅ Correct (Goes up one folder) // Make sure path matches your structure

// Force IPv4 to avoid connection errors
const MONGO_URI = 'mongodb://127.0.0.1:27017/travekla';

const resetAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔥 Connected to Database...");

    // 1. Remove the old admin (to avoid duplicates or bad data)
    await User.deleteOne({ email: 'admin@test.com' });
    console.log("🗑️ Cleared old admin data.");

    // 2. Create a fresh Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const newAdmin = new User({
      name: 'Super Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      kycStatus: 'verified'
    });

    await newAdmin.save();
    console.log("✅ SUCCESS: Admin Reset!");
    console.log("👉 Email: admin@test.com");
    console.log("👉 Pass:  123456");
    
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetAdmin();