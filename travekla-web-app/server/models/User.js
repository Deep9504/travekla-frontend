const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['traveler', 'admin', 'advisor'], default: 'traveler' },
  avatar: { type: String, default: "" }, // ✅ Added default string for safety

  // 👇 NEW PROFILE FIELDS
  location: { type: String, default: "Global Citizen" }, 
  bio: { type: String, default: "Ready for a new adventure! 🌍" }, 

  // KYC & Verification
  kycStatus: { type: String, enum: ['new', 'pending', 'verified', 'rejected'], default: 'new' },
  kycDocument: String,
  
  // VERIFICATION FIELDS
  isVerified: { type: Boolean, default: false }, // The "Blue Tick" status
  verificationRequestDate: Date,
  socialMediaLink: String,
  
  // ADVISOR METRICS
  expertise: [{ type: String }], 
  hourlyRate: { type: Number, default: 499 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  adviceCount: { type: Number, default: 0 }, // Used for Ranking

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);