const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['traveler', 'admin', 'advisor'], default: 'traveler' }, // 👈 Added 'advisor'
  avatar: String,
  
 // KYC & Verification
  kycStatus: { type: String, enum: ['new', 'pending', 'verified', 'rejected'], default: 'new' },
  kycDocument: String,
  
  // 🌟 NEW: VERIFICATION FIELDS
  isVerified: { type: Boolean, default: false }, // The "Blue Tick" status
  verificationRequestDate: Date,
  socialMediaLink: String, // For the backend check
  
  // ADVISOR METRICS
  expertise: [{ type: String }], 
  bio: { type: String, default: "Experienced traveler." },
  hourlyRate: { type: Number, default: 499 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  adviceCount: { type: Number, default: 0 }, // 🌟 Used for Ranking (Top of list)

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);