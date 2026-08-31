const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // ✅ Correct (Goes up one folder) // Adjust path if needed
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@travekla.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      return;
    }

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Default password

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@travekla.com',
      password: hashedPassword,
      role: 'admin',      // Special role
      kycStatus: 'verified'
    });

    await admin.save();
    console.log('✅ Super Admin Created!');
    console.log('📧 Email: admin@travekla.com');
    console.log('🔑 Pass: admin123');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();