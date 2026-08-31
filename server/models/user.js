const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['traveler', 'admin', 'advisor'], default: 'traveler' }, // 👈 Added 'advisor'
  avatar: String,
  
  // KYC Fields
  kycStatus: { type: String, enum: ['new', 'pending', 'verified', 'rejected'], default: 'new' },
  kycDocument: String,

  // 🎓 ADVISOR SPECIFIC FIELDS
  expertise: [{ type: String }], // e.g. ["Visa", "Budget", "Luxury", "Solo"]
  bio: { type: String, default: "Experienced traveler helping you plan better." },
  hourlyRate: { type: Number, default: 499 },
  rating: { type: Number, default: 4.8 },
  reviews: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);