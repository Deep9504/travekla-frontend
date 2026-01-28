// server/scripts/makeAdmin.js

// 1. Load your .env file (This grabs your Cloud Mongo URI)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User'); 

const makeAdmin = async () => {
  try {
    // 2. Check if we found the Cloud Link
    if (!process.env.MONGO_URI) {
        console.error("❌ Error: Could not find MONGO_URI in your .env file.");
        process.exit(1);
    }

    console.log("⏳ Connecting to Cloud Database...");
    
    // 3. Connect to the Cloud (NOT Localhost)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 Connected to Cloud!");

    // 4. Force Update the User
    const updatedUser = await User.findOneAndUpdate(
      { email: 'admin@test.com' }, 
      { $set: { role: 'admin' } }, 
      { new: true }
    );

    if (updatedUser) {
        console.log("✅ SUCCESS! User Updated:");
        console.log("Name:", updatedUser.name);
        console.log("New Role:", updatedUser.role);
    } else {
        console.log("❌ User not found. Make sure 'admin@test.com' is registered first.");
    }

    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

makeAdmin();