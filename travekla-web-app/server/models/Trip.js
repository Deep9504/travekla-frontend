const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: Date,
  budget: Number,
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // 🌟 NEW FIELD: Required for Admin Dashboard
  isVerified: { type: Boolean, default: false }, 

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);